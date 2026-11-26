import type { CryptoAsset, CryptoPayStatus } from "@/lib/types";
import { REQUIRED_CONFIRMATIONS } from "./constants";
import { sameAddress } from "./money";

export type ChainTransfer = {
  network: CryptoAsset;
  txHash: string;
  from: string;
  to: string;
  /** 6-decimal micro-USDT. */
  micro: bigint;
  /** False when the chain amount had dust finer than 6 decimals. */
  exact: boolean;
  blockTimeMs: number;
  confirmations: number;
  tokenOk: boolean;
};

export type PaySnap = {
  id: string;
  orderId: number;
  network: CryptoAsset;
  address: string;
  expectedMicro: bigint;
  status: CryptoPayStatus;
  txHash: string | null;
  createdAtMs: number;
  expiresAtMs: number;
};

export type PlanAction =
  | {
      type: "expire";
      paymentId: string;
    }
  | {
      type: "progress";
      paymentId: string;
      txHash: string;
      from: string;
      micro: bigint;
      confirmations: number;
      blockTimeMs: number;
      next: "detected" | "confirming" | "paid";
    }
  | {
      type: "late" | "underpaid" | "overpaid";
      paymentId: string;
      txHash: string;
      from: string;
      micro: bigint;
      confirmations: number;
      blockTimeMs: number;
    }
  | {
      type: "needs_review";
      paymentIds: string[];
      txHash: string;
      from: string;
      micro: bigint;
      confirmations: number;
      blockTimeMs: number;
      network: CryptoAsset;
      to: string;
      reason: string;
    }
  | {
      type: "unmatched";
      transfer: ChainTransfer;
      reason: string;
    };

const OPEN: CryptoPayStatus[] = [
  "waiting",
  "detected",
  "confirming",
  "underpaid",
  "overpaid",
  "late",
  "needs_review",
];

const NEAR = 1_000_000n;
const SKEW_MS = 120_000;

function normHash(hash: string) {
  return hash.trim().toLowerCase();
}

function stage(network: CryptoAsset, confirmations: number): "detected" | "confirming" | "paid" {
  if (confirmations <= 0) return "detected";
  if (confirmations < REQUIRED_CONFIRMATIONS[network]) return "confirming";
  return "paid";
}

function addressOk(pay: PaySnap, to: string) {
  return sameAddress(pay.address, to, pay.network === "USDT_BEP20");
}

/**
 * Decide what each incoming transfer should do.
 * Exact 6-decimal amounts are unique, so two open orders never share one.
 * A transfer is never marked paid when more than one order could claim it.
 */
export function planPayments(
  payments: PaySnap[],
  transfers: ChainTransfer[],
  nowMs: number,
  knownHashes: Set<string>
): PlanAction[] {
  const actions: PlanAction[] = [];
  const claimed = new Set<string>();

  const used = new Set(knownHashes);

  for (const tx of transfers) {
    const hash = normHash(tx.txHash);
    if (!hash || used.has(hash)) continue;

    if (!tx.tokenOk) {
      actions.push({ transfer: tx, type: "unmatched", reason: "Wrong token contract" });
      used.add(hash);
      continue;
    }
    if (!tx.exact) {
      actions.push({
        transfer: tx,
        type: "unmatched",
        reason: "Amount has extra decimals and cannot be matched safely",
      });
      used.add(hash);
      continue;
    }

    const already = payments.find(
      (p) => p.txHash && normHash(p.txHash) === hash
    );
    if (already) {
      const frozen =
        already.status === "paid" ||
        already.status === "expired" ||
        already.status === "cancelled" ||
        already.status === "late" ||
        already.status === "underpaid" ||
        already.status === "overpaid" ||
        already.status === "needs_review";
      if (!frozen) {
        actions.push({
          type: "progress",
          paymentId: already.id,
          txHash: tx.txHash,
          from: tx.from,
          micro: tx.micro,
          confirmations: tx.confirmations,
          blockTimeMs: tx.blockTimeMs,
          next: stage(already.network, tx.confirmations),
        });
      }
      used.add(hash);
      continue;
    }

    const exact = payments.filter(
      (p) =>
        (OPEN.includes(p.status) || p.status === "expired") &&
        p.network === tx.network &&
        addressOk(p, tx.to) &&
        p.expectedMicro === tx.micro &&
        !p.txHash
    );

    if (exact.length > 1) {
      actions.push({
        type: "needs_review",
        paymentIds: exact.map((p) => p.id),
        txHash: tx.txHash,
        from: tx.from,
        micro: tx.micro,
        confirmations: tx.confirmations,
        blockTimeMs: tx.blockTimeMs,
        network: tx.network,
        to: tx.to,
        reason: "This amount matches more than one open order",
      });
      for (const id of exact.map((p) => p.id)) claimed.add(id);
      used.add(hash);
      continue;
    }

    if (exact.length === 1) {
      const pay = exact[0];
      const base = {
        paymentId: pay.id,
        txHash: tx.txHash,
        from: tx.from,
        micro: tx.micro,
        confirmations: tx.confirmations,
        blockTimeMs: tx.blockTimeMs,
      };
      if (tx.blockTimeMs + SKEW_MS < pay.createdAtMs) {
        actions.push({
          transfer: tx,
          type: "unmatched",
          reason: "Transfer is older than the order",
        });
        used.add(hash);
        continue;
      }
      claimed.add(pay.id);
      if (tx.blockTimeMs > pay.expiresAtMs + SKEW_MS) {
        actions.push({ type: "late", ...base });
        used.add(hash);
        continue;
      }
      actions.push({
        type: "progress",
        ...base,
        next: stage(pay.network, tx.confirmations),
      });
      used.add(hash);
      continue;
    }

    const near = payments.filter((p) => {
      if (!OPEN.includes(p.status) || claimed.has(p.id) || p.txHash) return false;
      if (p.network !== tx.network || !addressOk(p, tx.to)) return false;
      const diff = p.expectedMicro > tx.micro ? p.expectedMicro - tx.micro : tx.micro - p.expectedMicro;
      return diff > 0n && diff < NEAR;
    });
    const only = near.length === 1 ? near[0] : null;
    if (only) {
      actions.push({
        type: tx.micro < only.expectedMicro ? "underpaid" : "overpaid",
        paymentId: only.id,
        txHash: tx.txHash,
        from: tx.from,
        micro: tx.micro,
        confirmations: tx.confirmations,
        blockTimeMs: tx.blockTimeMs,
      });
      claimed.add(only.id);
      used.add(hash);
      continue;
    }

    actions.push({
      transfer: tx,
      type: "unmatched",
      reason: "No single open order has this exact amount on this network",
    });
    used.add(hash);
  }

  for (const pay of payments) {
    if (pay.status !== "waiting" || pay.txHash || claimed.has(pay.id)) continue;
    if (nowMs <= pay.expiresAtMs) continue;
    actions.push({ type: "expire", paymentId: pay.id });
  }

  return actions;
}

export function assignExpectedMicro(base: bigint, taken: Set<string>): bigint {
  for (let i = 1; i <= 999; i++) {
    const candidate = base + BigInt(i);
    if (!taken.has(candidate.toString())) return candidate;
  }
  throw new Error("Too many unpaid orders at this price. Try again in a minute.");
}
