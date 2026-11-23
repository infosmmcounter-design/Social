import {
  addSystemMessage,
  restoreOrderStock,
} from "@/lib/db";
import type {
  CryptoAsset,
  CryptoPayment,
  CryptoPayStatus,
  Order,
  StoreData,
  UnmatchedTx,
} from "@/lib/types";
import { matchWalletAsset } from "@/lib/db";
import { REQUIRED_CONFIRMATIONS, networkLabel } from "./constants";
import { claimTx } from "./lock";
import { assignExpectedMicro, planPayments, type ChainTransfer, type PaySnap } from "./match";
import { microToUsd, sameAddress, usdToMicro } from "./money";

export function takenMicros(data: StoreData) {
  const taken = new Set<string>();
  for (const p of data.cryptoPayments || []) {
    if (p.status === "waiting" || p.status === "detected" || p.status === "confirming") {
      taken.add(p.expectedMicro);
    }
  }
  for (const d of data.walletDeposits || []) {
    if (d.status === "pending" && d.expectedMicro) taken.add(d.expectedMicro);
  }
  return taken;
}

export function attachCryptoPayment(data: StoreData, order: Order, asset?: CryptoAsset) {
  if (!data.cryptoPayments) data.cryptoPayments = [];
  if (order.coin === "Wallet balance") return;
  const network = asset || matchWalletAsset(order.coin);
  const wallet = data.settings.cryptoWallets.find((w) => w.enabled && w.asset === network && w.address);
  if (!wallet) return;
  const active = data.cryptoPayments.find(
    (p) =>
      p.orderId === order.id &&
      (p.status === "waiting" || p.status === "detected" || p.status === "confirming")
  );
  if (active && active.network === network) {
    mirror(order, active);
    return;
  }
  if (active && active.network !== network && !active.txHash) {
    active.status = "cancelled";
    active.reason = "Buyer switched network before payment";
  }
  const base = usdToMicro(order.total);
  const expected = assignExpectedMicro(base, takenMicros(data));
  const created = Date.now();
  const expires = order.paymentDueAt
    ? new Date(order.paymentDueAt).getTime()
    : created + (order.paymentWindowMins || 60) * 60_000;
  const pay: CryptoPayment = {
    id: `pay_${order.id}_${created}`,
    orderId: order.id,
    network,
    address: wallet.address,
    expectedMicro: expected.toString(),
    receivedMicro: null,
    txHash: null,
    fromAddress: null,
    status: "waiting",
    confirmations: 0,
    createdAt: new Date(created).toISOString(),
    expiresAt: new Date(expires).toISOString(),
    confirmedAt: null,
    blockTime: null,
    reason: null,
  };
  data.cryptoPayments.push(pay);
  order.coin = network === "USDT_BEP20" ? "USDT (BEP20)" : "USDT (TRC20)";
  order.paymentInstructions =
    `Send exactly ${microToUsd(expected)} USDT on ${networkLabel(network)} to ${wallet.address}. ` +
    `The amount is unique to order #${order.id}. A different amount is not marked paid automatically. ` +
    `Wrong network can lose the funds. Pay before ${pay.expiresAt}.`;
  mirror(order, pay);
}

function mirror(order: Order, pay: CryptoPayment) {
  order.payId = pay.id;
  order.payStatus = pay.status;
  order.payNetwork = pay.network;
  order.payAddress = pay.address;
  order.payExpectedMicro = pay.expectedMicro;
  order.payReceivedMicro = pay.receivedMicro;
  order.payTxHash = pay.txHash;
  order.payConfirmations = pay.confirmations;
}

function snap(p: CryptoPayment): PaySnap {
  return {
    id: p.id,
    orderId: p.orderId,
    network: p.network,
    address: p.address,
    expectedMicro: BigInt(p.expectedMicro),
    status: p.status,
    txHash: p.txHash,
    createdAtMs: new Date(p.createdAt).getTime(),
    expiresAtMs: new Date(p.expiresAt).getTime(),
  };
}

function hold(data: StoreData, order: Order, text: string) {
  if (
    order.status === "funds_held" ||
    order.status === "credentials_shared" ||
    order.status === "release_requested" ||
    order.status === "completed"
  ) {
    addSystemMessage(order, text);
    return;
  }
  if (order.status === "cancelled" || order.status === "refunded") {
    const listing = data.listings.find((l) => l.id === order.listingId);
    const qty = Math.max(1, order.qty || 1);
    if (listing && order.stockReserved === false && (listing.stock ?? 0) >= qty && !order.deliveredAt) {
      listing.stock = (listing.stock ?? 0) - qty;
      listing.soldCount = (listing.soldCount ?? 0) + qty;
      order.stockReserved = true;
    }
  }
  const hours = order.deliveryWindowHours || data.settings.deliveryWindowHours || 24;
  order.deliveryWindowHours = hours;
  if (!order.deliveryDueAt) {
    order.deliveryDueAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }
  order.status = "funds_held";
  order.buyerMarkedPaid = true;
  addSystemMessage(order, text);
  addSystemMessage(
    order,
    order.sellerAcceptedAt
      ? "Seller already accepted. The deal has started. Mark it delivered when the work is finished. There is no 24-hour delivery limit."
      : `Seller has until ${new Date(order.deliveryDueAt).toLocaleString()} to accept. If there is no response, the buyer can cancel.`
  );
}

function rememberUnmatched(data: StoreData, row: UnmatchedTx) {
  if (!data.unmatchedTxs) data.unmatchedTxs = [];
  if (data.unmatchedTxs.some((u) => u.txHash.toLowerCase() === row.txHash.toLowerCase())) return;
  data.unmatchedTxs.unshift(row);
  data.unmatchedTxs = data.unmatchedTxs.slice(0, 200);
}

export async function applyCryptoScan(data: StoreData, transfers: ChainTransfer[], now = Date.now()) {
  if (!data.cryptoPayments) data.cryptoPayments = [];
  if (!data.unmatchedTxs) data.unmatchedTxs = [];
  if (!data.cryptoTxLocks) data.cryptoTxLocks = [];

  for (const order of data.orders) {
    if (order.status !== "awaiting_payment") continue;
    if (order.coin === "Wallet balance") continue;
    const live = data.cryptoPayments.find(
      (p) =>
        p.orderId === order.id &&
        (p.status === "waiting" || p.status === "detected" || p.status === "confirming")
    );
    if (!live) attachCryptoPayment(data, order);
  }

  const known = new Set((data.unmatchedTxs || []).map((u) => u.txHash.toLowerCase()));
  const actions = planPayments(
    data.cryptoPayments.map(snap),
    transfers,
    now,
    known
  );

  for (const action of actions) {
    if (action.type === "expire") {
      const pay = data.cryptoPayments.find((p) => p.id === action.paymentId);
      const order = pay && data.orders.find((o) => o.id === pay.orderId);
      if (!pay || !order || pay.txHash || pay.status !== "waiting") continue;
      pay.status = "expired";
      pay.reason = "Payment window ended before a matching transfer was seen";
      mirror(order, pay);
      if (order.status === "awaiting_payment") {
        order.status = "cancelled";
        restoreOrderStock(
          data,
          order,
          "Payment window ended with no matching USDT transfer. The order is expired, stock is returned, and a late transfer is not treated as paid. Escrow can review a late payment."
        );
      }
      continue;
    }

    if (action.type === "unmatched") {
      rememberUnmatched(data, {
        txHash: action.transfer.txHash,
        network: action.transfer.network,
        amountMicro: action.transfer.micro.toString(),
        fromAddress: action.transfer.from,
        toAddress: action.transfer.to,
        blockTime: action.transfer.blockTimeMs
          ? new Date(action.transfer.blockTimeMs).toISOString()
          : null,
        reason: action.reason,
        confirmations: action.transfer.confirmations,
        createdAt: new Date(now).toISOString(),
      });
      continue;
    }

    if (action.type === "needs_review") {
      for (const id of action.paymentIds) {
        const pay = data.cryptoPayments.find((p) => p.id === id);
        const order = pay && data.orders.find((o) => o.id === pay.orderId);
        if (!pay || !order || pay.status === "paid") continue;
        pay.status = "needs_review";
        pay.reason = action.reason;
        mirror(order, pay);
        addSystemMessage(order, `Payment needs review: ${action.reason}. Tx ${action.txHash}.`);
      }
      rememberUnmatched(data, {
        txHash: action.txHash,
        network: action.network,
        amountMicro: action.micro.toString(),
        fromAddress: action.from,
        toAddress: action.to,
        blockTime: new Date(action.blockTimeMs).toISOString(),
        reason: action.reason,
        confirmations: action.confirmations,
        createdAt: new Date(now).toISOString(),
      });
      continue;
    }

    const pay = data.cryptoPayments.find((p) => p.id === action.paymentId);
    const order = pay && data.orders.find((o) => o.id === pay.orderId);
    if (!pay || !order || pay.status === "paid") continue;
    const claim = await claimTx(action.txHash, pay.network, order.id, data.cryptoTxLocks);
    if (claim === "other") continue;

    pay.txHash = action.txHash.toLowerCase();
    pay.fromAddress = action.from;
    pay.receivedMicro = action.micro.toString();
    pay.confirmations = action.confirmations;
    pay.blockTime = action.blockTimeMs ? new Date(action.blockTimeMs).toISOString() : null;
    order.paymentProof = pay.txHash;

    if (action.type === "progress") {
      pay.status = action.next;
      if (action.next === "paid") {
        pay.confirmedAt = new Date(now).toISOString();
        pay.reason = null;
        mirror(order, pay);
        hold(
          data,
          order,
          `USDT payment confirmed on ${networkLabel(pay.network)}. Tx ${pay.txHash}. ${pay.confirmations} confirmation(s). Funds are held in escrow. Received ${microToUsd(action.micro)} USDT.`
        );
      } else {
        pay.reason = null;
        mirror(order, pay);
      }
      continue;
    }

    pay.status = action.type;
    pay.reason =
      action.type === "late"
        ? "Transfer arrived after the payment deadline. It is not marked paid. Escrow will review a refund or a manual accept."
        : action.type === "underpaid"
          ? `Received ${microToUsd(action.micro)} USDT, expected ${microToUsd(BigInt(pay.expectedMicro))}. Not marked paid.`
          : `Received ${microToUsd(action.micro)} USDT, expected ${microToUsd(BigInt(pay.expectedMicro))}. Not marked paid until escrow reviews it.`;
    mirror(order, pay);
    addSystemMessage(order, pay.reason + ` Tx ${pay.txHash}.`);
  }
  await creditWalletDeposits(data, transfers);
}

async function creditWalletDeposits(data: StoreData, transfers: ChainTransfer[]) {
  if (!data.walletDeposits) return;
  if (!data.cryptoTxLocks) data.cryptoTxLocks = [];
  for (const dep of data.walletDeposits) {
    if (dep.status !== "pending" || !dep.expectedMicro || !dep.network || !dep.address) continue;
    const expected = BigInt(dep.expectedMicro);
    const created = new Date(dep.createdAt).getTime();
    const expires = dep.expiresAt ? new Date(dep.expiresAt).getTime() : created + 60 * 60_000;
    const hit = transfers.find(
      (tx) =>
        tx.tokenOk &&
        tx.exact &&
        tx.network === dep.network &&
        sameAddress(tx.to, dep.address || "", dep.network === "USDT_BEP20") &&
        tx.micro === expected &&
        tx.blockTimeMs + 120_000 >= created &&
        tx.blockTimeMs <= expires + 120_000
    );
    if (!hit) continue;
    const claim = await claimTx(hit.txHash, dep.network, -dep.id, data.cryptoTxLocks);
    if (claim === "other") continue;
    dep.txHash = hit.txHash.toLowerCase();
    dep.confirmations = hit.confirmations;
    const need = REQUIRED_CONFIRMATIONS[dep.network];
    if (hit.confirmations < need) {
      dep.note = `Confirming ${hit.confirmations}/${need}`;
      continue;
    }
    dep.status = "approved";
    dep.note = `Auto-credited ${microToUsd(hit.micro)} USDT`;
    const user = data.users.find((u) => u.id === dep.userId);
    if (user) {
      user.walletBalance = Math.round((Number(user.walletBalance || 0) + dep.amount) * 100) / 100;
    }
  }
}

export function paymentView(order: Order, pay: CryptoPayment | undefined) {
  const status: CryptoPayStatus = pay?.status || order.payStatus || "waiting";
  const network = pay?.network || order.payNetwork || matchWalletAsset(order.coin);
  const expected = pay?.expectedMicro || order.payExpectedMicro || "0";
  return {
    orderId: order.id,
    orderStatus: order.status,
    status,
    network,
    networkLabel: networkLabel(network),
    address: pay?.address || order.payAddress || "",
    expected: microToUsd(BigInt(expected || "0")),
    expectedMicro: expected,
    received: pay?.receivedMicro ? microToUsd(BigInt(pay.receivedMicro)) : null,
    txHash: pay?.txHash || order.payTxHash || null,
    confirmations: pay?.confirmations || order.payConfirmations || 0,
    requiredConfirmations: REQUIRED_CONFIRMATIONS[network],
    expiresAt: pay?.expiresAt || order.paymentDueAt,
    confirmedAt: pay?.confirmedAt || null,
    reason: pay?.reason || null,
    fromAddress: pay?.fromAddress || null,
    blockTime: pay?.blockTime || null,
  };
}

export async function acceptReviewedPayment(data: StoreData, orderId: number, txHash: string) {
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");
  const pay =
    data.cryptoPayments?.find((p) => p.orderId === orderId && p.txHash?.toLowerCase() === txHash.toLowerCase()) ||
    data.cryptoPayments?.find((p) => p.id === order.payId);
  if (!pay) throw new Error("Payment not found");
  const unmatched = data.unmatchedTxs?.find((u) => u.txHash.toLowerCase() === txHash.toLowerCase());
  if (
    unmatched &&
    (unmatched.network !== pay.network ||
      !sameAddress(unmatched.toAddress, pay.address, pay.network === "USDT_BEP20"))
  ) {
    throw new Error("That transfer was not sent to this order's wallet on the selected network.");
  }
  const hash = (pay.txHash || unmatched?.txHash || "").toLowerCase();
  if (!hash || hash !== txHash.toLowerCase()) throw new Error("That transaction is not linked to this order.");
  const confirmations = Math.max(pay.confirmations, unmatched?.confirmations || 0);
  if (confirmations < REQUIRED_CONFIRMATIONS[pay.network]) {
    throw new Error("The transfer does not have enough confirmations yet.");
  }
  if (pay.status === "paid") return pay;
  const claim = await claimTx(hash, pay.network, order.id, data.cryptoTxLocks || []);
  if (claim === "other") throw new Error("This transaction is already used by another order.");
  pay.txHash = hash;
  pay.status = "paid";
  pay.confirmedAt = new Date().toISOString();
  pay.reason = "Accepted by admin after review";
  if (unmatched && !pay.receivedMicro) pay.receivedMicro = unmatched.amountMicro;
  mirror(order, pay);
  hold(
    data,
    order,
    `Admin accepted reviewed USDT payment ${hash} on ${networkLabel(pay.network)}. Funds are held in escrow.`
  );
  return pay;
}
