import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyCryptoScan } from "./apply";
import type { Order, StoreData } from "@/lib/types";
import { parseBscLogs } from "./bsc";
import { assignExpectedMicro, planPayments, type ChainTransfer, type PaySnap } from "./match";
import { chainToMicro, microToUsd, usdToMicro } from "./money";
import { parseTronTransfers } from "./tron";
import { USDT_CONTRACT } from "./constants";

const ADDR_T = "TLj1Esv4stWJNcimvXZDXkP5W9FZfQVpx7";
const ADDR_B = "0x97ff787aa462141bc27660BFDB8b96728B3e0209";

function pay(partial: Partial<PaySnap> & Pick<PaySnap, "id" | "orderId" | "network" | "expectedMicro">): PaySnap {
  return {
    address: partial.network === "USDT_BEP20" ? ADDR_B : ADDR_T,
    status: "waiting",
    txHash: null,
    createdAtMs: 1_000_000,
    expiresAtMs: 1_000_000 + 60 * 60_000,
    ...partial,
  };
}

function tx(partial: Partial<ChainTransfer> & Pick<ChainTransfer, "network" | "micro">): ChainTransfer {
  return {
    txHash: "abc",
    from: "sender",
    to: partial.network === "USDT_BEP20" ? ADDR_B : ADDR_T,
    exact: true,
    blockTimeMs: 1_000_000 + 1000,
    confirmations: partial.network === "USDT_BEP20" ? 15 : 19,
    tokenOk: true,
    ...partial,
  };
}

describe("amounts", () => {
  it("keeps two cents as micro-USDT", () => {
    assert.equal(usdToMicro(108.9), 108_900_000n);
    assert.equal(microToUsd(108_900_042n), "108.900042");
  });

  it("treats BSC 18-decimal dust as not exact", () => {
    const parsed = chainToMicro(10_000_000_000_000n + 1n, 18);
    assert.equal(parsed.exact, false);
    assert.equal(parsed.micro, 10n);
  });

  it("assigns different amounts to simultaneous orders", () => {
    const base = usdToMicro(10);
    const taken = new Set<string>();
    const a = assignExpectedMicro(base, taken);
    taken.add(a.toString());
    const b = assignExpectedMicro(base, taken);
    assert.notEqual(a, b);
    assert.equal(a, base + 1n);
    assert.equal(b, base + 2n);
  });
});

describe("matching", () => {
  const now = 1_000_000 + 5 * 60_000;

  it("marks a confirmed TRC20 transfer paid", () => {
    const p = pay({ id: "1", orderId: 1, network: "USDT_TRC20", expectedMicro: 10_000_001n });
    const actions = planPayments([p], [tx({ network: "USDT_TRC20", micro: 10_000_001n, txHash: "t1" })], now, new Set());
    assert.equal(actions[0].type, "progress");
    if (actions[0].type === "progress") assert.equal(actions[0].next, "paid");
  });

  it("marks a confirmed BEP20 transfer paid", () => {
    const p = pay({ id: "1", orderId: 1, network: "USDT_BEP20", expectedMicro: 10_000_001n });
    const actions = planPayments([p], [tx({ network: "USDT_BEP20", micro: 10_000_001n, txHash: "b1", confirmations: 15 })], now, new Set());
    assert.equal(actions[0].type, "progress");
    if (actions[0].type === "progress") assert.equal(actions[0].next, "paid");
  });

  it("waits while BEP20 confirmations are low", () => {
    const p = pay({ id: "1", orderId: 1, network: "USDT_BEP20", expectedMicro: 5n });
    const actions = planPayments(
      [p],
      [tx({ network: "USDT_BEP20", micro: 5n, confirmations: 3, txHash: "b2" })],
      now,
      new Set()
    );
    assert.equal(actions[0].type, "progress");
    if (actions[0].type === "progress") assert.equal(actions[0].next, "confirming");
  });

  it("does not match a TRC20 order with a BEP20 transfer", () => {
    const p = pay({ id: "1", orderId: 1, network: "USDT_TRC20", expectedMicro: 10_000_001n });
    const actions = planPayments(
      [p],
      [tx({ network: "USDT_BEP20", micro: 10_000_001n, txHash: "wrong-net" })],
      now,
      new Set()
    );
    assert.equal(actions.some((a) => a.type === "progress"), false);
    assert.equal(actions.some((a) => a.type === "unmatched"), true);
  });

  it("rejects the wrong token", () => {
    const p = pay({ id: "1", orderId: 1, network: "USDT_TRC20", expectedMicro: 5n });
    const actions = planPayments(
      [p],
      [tx({ network: "USDT_TRC20", micro: 5n, tokenOk: false, txHash: "fake" })],
      now,
      new Set()
    );
    assert.equal(actions[0].type, "unmatched");
  });

  it("flags a short payment as underpaid only when one order is close", () => {
    const p = pay({ id: "1", orderId: 1, network: "USDT_TRC20", expectedMicro: 10_000_042n });
    const actions = planPayments(
      [p],
      [tx({ network: "USDT_TRC20", micro: 10_000_000n, txHash: "short" })],
      now,
      new Set()
    );
    assert.equal(actions[0].type, "underpaid");
  });

  it("does not guess when two orders could fit the same wrong amount", () => {
    const a = pay({ id: "1", orderId: 1, network: "USDT_TRC20", expectedMicro: 10_000_042n });
    const b = pay({ id: "2", orderId: 2, network: "USDT_TRC20", expectedMicro: 10_000_077n });
    const actions = planPayments(
      [a, b],
      [tx({ network: "USDT_TRC20", micro: 10_000_000n, txHash: "ambig" })],
      now,
      new Set()
    );
    assert.equal(actions[0].type, "unmatched");
  });

  it("keeps identical catalog prices apart", () => {
    const a = pay({ id: "1", orderId: 1, network: "USDT_TRC20", expectedMicro: 50_000_001n });
    const b = pay({ id: "2", orderId: 2, network: "USDT_TRC20", expectedMicro: 50_000_002n });
    const actions = planPayments(
      [a, b],
      [tx({ network: "USDT_TRC20", micro: 50_000_002n, txHash: "for-2" })],
      now,
      new Set()
    );
    const hit = actions.find((x) => x.type === "progress");
    assert.ok(hit && hit.type === "progress" && hit.paymentId === "2");
  });

  it("marks an exact transfer after the deadline as late", () => {
    const p = pay({
      id: "1",
      orderId: 1,
      network: "USDT_TRC20",
      expectedMicro: 7n,
      expiresAtMs: now - 10 * 60_000,
    });
    const actions = planPayments(
      [p],
      [tx({ network: "USDT_TRC20", micro: 7n, blockTimeMs: now, txHash: "late" })],
      now,
      new Set()
    );
    assert.equal(actions.some((a) => a.type === "late"), true);
    assert.equal(actions.some((a) => a.type === "progress" && a.next === "paid"), false);
  });

  it("still pays when the scan runs after the window but the transfer was on time", () => {
    const created = now - 3 * 60 * 60_000;
    const p = pay({
      id: "1",
      orderId: 1,
      network: "USDT_TRC20",
      expectedMicro: 7n,
      createdAtMs: created,
      expiresAtMs: created + 60 * 60_000,
    });
    const actions = planPayments(
      [p],
      [tx({ network: "USDT_TRC20", micro: 7n, blockTimeMs: created + 10 * 60_000, txHash: "ontime" })],
      now,
      new Set()
    );
    assert.equal(actions.some((a) => a.type === "progress" && a.next === "paid"), true);
    assert.equal(actions.some((a) => a.type === "expire" || a.type === "late"), false);
  });

  it("expires an unpaid order and ignores a repeated transaction hash", () => {
    const p = pay({
      id: "1",
      orderId: 1,
      network: "USDT_BEP20",
      expectedMicro: 9n,
      expiresAtMs: now - 1000,
    });
    const expired = planPayments([p], [], now, new Set());
    assert.equal(expired[0].type, "expire");
    const paid = pay({
      id: "9",
      orderId: 9,
      network: "USDT_TRC20",
      expectedMicro: 9n,
      status: "paid",
      txHash: "dup",
    });
    const again = planPayments([paid], [tx({ network: "USDT_TRC20", micro: 9n, txHash: "dup" })], now, new Set());
    assert.equal(again.some((a) => a.type === "progress"), false);
  });

  it("flags overpaid when the extra is unambiguous", () => {
    const p = pay({ id: "1", orderId: 1, network: "USDT_BEP20", expectedMicro: 20_000_003n });
    const actions = planPayments(
      [p],
      [tx({ network: "USDT_BEP20", micro: 20_500_000n, txHash: "over", confirmations: 20 })],
      now,
      new Set()
    );
    assert.equal(actions[0].type, "overpaid");
  });
});

describe("store update", () => {
  it("holds funds once and refuses a reused transaction", async () => {
    const order = {
      id: 7,
      status: "awaiting_payment",
      coin: "USDT (TRC20)",
      qty: 1,
      stockReserved: true,
      listingId: 1,
      deliveryWindowHours: 24,
      msgs: [],
      paymentProof: "",
      buyerMarkedPaid: false,
    } as unknown as Order;
    const data = {
      orders: [order],
      listings: [{ id: 1, stock: 3, soldCount: 1, status: "approved", listed: true }],
      offers: [],
      settings: { cryptoWallets: [], deliveryWindowHours: 24 },
      cryptoPayments: [
        {
          id: "pay7",
          orderId: 7,
          network: "USDT_TRC20",
          address: ADDR_T,
          expectedMicro: "10000001",
          receivedMicro: null,
          txHash: null,
          fromAddress: null,
          status: "waiting",
          confirmations: 0,
          createdAt: new Date(1_000_000).toISOString(),
          expiresAt: new Date(1_000_000 + 60 * 60_000).toISOString(),
          confirmedAt: null,
          blockTime: null,
          reason: null,
        },
      ],
      unmatchedTxs: [],
      cryptoTxLocks: [],
    } as unknown as StoreData;
    const transfer = tx({
      network: "USDT_TRC20",
      micro: 10_000_001n,
      txHash: "once",
      blockTimeMs: 1_000_000 + 5000,
    });
    await applyCryptoScan(data, [transfer], 1_000_000 + 10_000);
    assert.equal(order.status, "funds_held");
    assert.equal(data.cryptoPayments![0].status, "paid");
    const msgs = order.msgs.length;
    await applyCryptoScan(data, [transfer], 1_000_000 + 20_000);
    assert.equal(order.status, "funds_held");
    assert.equal(order.msgs.length, msgs);
    assert.equal(data.cryptoTxLocks!.length, 1);
  });
});

describe("chain parsers", () => {
  it("reads a confirmed TRC20 transfer and ignores the wrong contract", () => {
    const rows = parseTronTransfers(
      [
        {
          transaction_id: "tx1",
          from: "TFrom",
          to: ADDR_T,
          value: "10000042",
          type: "Transfer",
          block_timestamp: 10,
          token_info: { address: USDT_CONTRACT.USDT_TRC20, decimals: 6 },
        },
        {
          transaction_id: "tx2",
          from: "TFrom",
          to: ADDR_T,
          value: "10000042",
          type: "Transfer",
          block_timestamp: 10,
          token_info: { address: "TFakeToken", decimals: 6 },
        },
      ],
      ADDR_T,
      19,
      { tx1: 1, tx2: 1 }
    );
    assert.equal(rows.length, 2);
    assert.equal(rows[0].tokenOk, true);
    assert.equal(rows[0].confirmations, 19);
    assert.equal(rows[0].micro, 10_000_042n);
    assert.equal(rows[1].tokenOk, false);
  });

  it("reads a BEP20 log and drops a reorged log", () => {
    const rows = parseBscLogs(
      [
        {
          address: USDT_CONTRACT.USDT_BEP20,
          topics: [
            "0xdd",
            "0x" + "11".padStart(64, "0"),
            "0x" + ADDR_B.slice(2).toLowerCase().padStart(64, "0"),
          ],
          data: "0x" + (10_000_001n * 10n ** 12n).toString(16),
          blockNumber: "0x10",
          transactionHash: "0xabc",
        },
        {
          address: USDT_CONTRACT.USDT_BEP20,
          topics: ["0xdd", "0x" + "1".padStart(64, "0"), "0x" + "2".padStart(64, "0")],
          data: "0x1",
          blockNumber: "0x10",
          transactionHash: "0xreorg",
          removed: true,
        },
      ],
      30,
      { "0x10": 5_000 },
      18
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].micro, 10_000_001n);
    assert.equal(rows[0].exact, true);
    assert.equal(rows[0].confirmations, 15);
    assert.equal(rows[0].tokenOk, true);
    assert.equal(rows[0].to, ADDR_B.toLowerCase());
  });
});
