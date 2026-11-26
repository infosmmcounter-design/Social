import type { ChainTransfer } from "./match";
import { USDT_CONTRACT } from "./constants";
import { chainToMicro } from "./money";

type TronRow = {
  transaction_id?: string;
  from?: string;
  to?: string;
  value?: string;
  type?: string;
  block_timestamp?: number;
  token_info?: { address?: string; decimals?: number; symbol?: string };
};

export function parseTronTransfers(
  rows: TronRow[],
  receiveAddress: string,
  latestBlock: number,
  txBlocks: Record<string, number | null>
): ChainTransfer[] {
  const out: ChainTransfer[] = [];
  const contract = USDT_CONTRACT.USDT_TRC20;
  for (const row of rows) {
    if (!row.transaction_id || !row.to || !row.value) continue;
    if (row.type && row.type !== "Transfer") continue;
    if (row.to !== receiveAddress) continue;
    const token = row.token_info?.address || "";
    const decimals = Number(row.token_info?.decimals ?? 6);
    let micro = 0n;
    let exact = false;
    try {
      const parsed = chainToMicro(BigInt(row.value), decimals);
      micro = parsed.micro;
      exact = parsed.exact;
    } catch {
      continue;
    }
    const block = txBlocks[row.transaction_id];
    const confirmations =
      block && latestBlock >= block ? latestBlock - block + 1 : block === null ? 0 : 0;
    out.push({
      network: "USDT_TRC20",
      txHash: row.transaction_id,
      from: row.from || "",
      to: row.to,
      micro,
      exact,
      blockTimeMs: Number(row.block_timestamp || 0),
      confirmations,
      tokenOk: token === contract,
    });
  }
  return out;
}

async function tronFetch(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const key = process.env.TRONGRID_API_KEY;
  if (key) headers.set("TRON-PRO-API-KEY", key);
  headers.set("accept", "application/json");
  const res = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`TronGrid ${res.status}`);
  return res.json();
}

async function tronList(address: string, minTs: number, confirmed: boolean) {
  const url =
    `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20` +
    `?only_to=true&limit=100&contract_address=${USDT_CONTRACT.USDT_TRC20}` +
    `&min_timestamp=${minTs}&only_confirmed=${confirmed ? "true" : "false"}`;
  const body = (await tronFetch(url)) as { data?: TronRow[] };
  return body.data || [];
}

/**
 * TronGrid `only_confirmed=true` returns transfers already in a solidified
 * block (19 confirmations). Pending rows are kept at 0 so checkout can show
 * "Payment Detected" before finality.
 */
export async function fetchTronTransfers(
  address: string,
  lookbackMs: number
): Promise<ChainTransfer[]> {
  const minTs = Date.now() - lookbackMs;
  const confirmedRows = await tronList(address, minTs, true);
  let pendingRows: TronRow[] = [];
  try {
    pendingRows = await tronList(address, minTs, false);
  } catch {
    pendingRows = [];
  }
  const confirmedIds = new Set(confirmedRows.map((r) => r.transaction_id));
  const txBlocks: Record<string, number | null> = {};
  for (const row of confirmedRows) {
    if (row.transaction_id) txBlocks[row.transaction_id] = 1;
  }
  for (const row of pendingRows) {
    if (!row.transaction_id || confirmedIds.has(row.transaction_id)) continue;
    txBlocks[row.transaction_id] = null;
  }
  const merged = [
    ...confirmedRows,
    ...pendingRows.filter((r) => r.transaction_id && !confirmedIds.has(r.transaction_id)),
  ];
  // latestBlock 19 and confirmed tx block 1 => 19 confirmations.
  return parseTronTransfers(merged, address, 19, txBlocks);
}
