import type { ChainTransfer } from "./match";
import { DEFAULT_BSC_RPCS, TRANSFER_TOPIC, USDT_CONTRACT } from "./constants";
import { chainToMicro } from "./money";

type Log = {
  address?: string;
  topics?: string[];
  data?: string;
  blockNumber?: string;
  transactionHash?: string;
  removed?: boolean;
};

function rpcUrls() {
  const custom = process.env.BSC_RPC_URL?.trim();
  return custom ? [custom, ...DEFAULT_BSC_RPCS] : DEFAULT_BSC_RPCS;
}

async function rpc(method: string, params: unknown[]) {
  let last = "BSC RPC failed";
  for (const url of rpcUrls()) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) {
        last = `BSC RPC ${res.status}`;
        continue;
      }
      const body = (await res.json()) as { result?: unknown; error?: { message?: string } };
      if (body.error) {
        last = body.error.message || "BSC RPC error";
        continue;
      }
      return body.result;
    } catch (e) {
      last = e instanceof Error ? e.message : last;
    }
  }
  throw new Error(last);
}

function padAddress(address: string) {
  return "0x" + address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

export function parseBscLogs(
  logs: Log[],
  latest: number,
  blockTimes: Record<string, number>,
  decimals: number
): ChainTransfer[] {
  const contract = USDT_CONTRACT.USDT_BEP20.toLowerCase();
  const out: ChainTransfer[] = [];
  for (const log of logs) {
    if (log.removed) continue;
    if (!log.transactionHash || !log.topics || log.topics.length < 3 || !log.data) continue;
    const block = Number.parseInt(log.blockNumber || "0", 16);
    const raw = BigInt(log.data);
    const parsed = chainToMicro(raw, decimals);
    const from = "0x" + (log.topics[1] || "").slice(-40);
    const to = "0x" + (log.topics[2] || "").slice(-40);
    out.push({
      network: "USDT_BEP20",
      txHash: log.transactionHash,
      from,
      to,
      micro: parsed.micro,
      exact: parsed.exact,
      blockTimeMs: blockTimes[log.blockNumber || ""] || 0,
      confirmations: block > 0 && latest >= block ? latest - block + 1 : 0,
      tokenOk: (log.address || "").toLowerCase() === contract,
    });
  }
  return out;
}

export async function fetchBscTransfers(
  address: string,
  lookbackMs: number
): Promise<ChainTransfer[]> {
  const latestHex = String(await rpc("eth_blockNumber", []));
  const latest = Number.parseInt(latestHex, 16);
  const blocks = Math.min(40_000, Math.ceil(lookbackMs / 3000) + 20);
  const fromBlock = Math.max(1, latest - blocks);
  const decimalsHex = String(
    await rpc("eth_call", [
      { to: USDT_CONTRACT.USDT_BEP20, data: "0x313ce567" },
      "latest",
    ])
  );
  const decimals = Number.parseInt(decimalsHex, 16) || 18;
  const logs: Log[] = [];
  const step = 2000;
  for (let start = fromBlock; start <= latest; start += step) {
    const end = Math.min(latest, start + step - 1);
    const chunk = (await rpc("eth_getLogs", [
      {
        address: USDT_CONTRACT.USDT_BEP20,
        fromBlock: "0x" + start.toString(16),
        toBlock: "0x" + end.toString(16),
        topics: [TRANSFER_TOPIC, null, padAddress(address)],
      },
    ])) as Log[];
    logs.push(...(chunk || []));
  }
  const times: Record<string, number> = {};
  const uniqueBlocks = [...new Set(logs.map((l) => l.blockNumber).filter(Boolean))] as string[];
  for (const block of uniqueBlocks) {
    try {
      const info = (await rpc("eth_getBlockByNumber", [block, false])) as {
        timestamp?: string;
      };
      times[block] = Number.parseInt(info.timestamp || "0", 16) * 1000;
    } catch {
      times[block] = 0;
    }
  }
  return parseBscLogs(logs, latest, times, decimals);
}
