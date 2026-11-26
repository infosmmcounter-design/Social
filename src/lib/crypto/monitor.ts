import { readStore, updateStore } from "@/lib/db";
import type { CryptoAsset } from "@/lib/types";
import { applyCryptoScan } from "./apply";
import { fetchBscTransfers } from "./bsc";
import type { ChainTransfer } from "./match";
import { fetchTronTransfers } from "./tron";
import { syncCryptoRows } from "./lock";

let lastScan = 0;
let scanning: Promise<void> | null = null;

export async function scanCryptoPayments(opts?: { force?: boolean; lookbackMs?: number }) {
  const lookback = opts?.lookbackMs ?? 4 * 60 * 60 * 1000;
  const minGap = opts?.force ? 0 : 15_000;
  if (!opts?.force && Date.now() - lastScan < minGap) return;
  if (scanning) return scanning;
  scanning = run(lookback).finally(() => {
    scanning = null;
    lastScan = Date.now();
  });
  return scanning;
}

async function run(lookbackMs: number) {
  const store = await readStore();
  const addresses = new Map<CryptoAsset, Set<string>>();
  for (const w of store.settings.cryptoWallets) {
    if (!w.enabled || !w.address) continue;
    const set = addresses.get(w.asset) || new Set<string>();
    set.add(w.address);
    addresses.set(w.asset, set);
  }
  for (const p of store.cryptoPayments || []) {
    if (!p.address) continue;
    if (p.status === "paid" || p.status === "cancelled" || p.status === "expired") continue;
    const set = addresses.get(p.network) || new Set<string>();
    set.add(p.address);
    addresses.set(p.network, set);
  }

  const transfers: ChainTransfer[] = [];
  const errors: string[] = [];
  for (const address of addresses.get("USDT_TRC20") || []) {
    try {
      transfers.push(...(await fetchTronTransfers(address, lookbackMs)));
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "TRC20 scan failed");
    }
  }
  for (const address of addresses.get("USDT_BEP20") || []) {
    try {
      transfers.push(...(await fetchBscTransfers(address, lookbackMs)));
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "BEP20 scan failed");
    }
  }

  const saved = await updateStore(async (data) => {
    await applyCryptoScan(data, transfers);
  });
  try {
    await syncCryptoRows(saved.cryptoPayments || [], saved.unmatchedTxs || []);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Could not sync payment tables");
  }
  if (errors.length) {
    console.error("crypto scan", errors.join("; "));
  }
}
