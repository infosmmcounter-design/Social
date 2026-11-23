import type { CryptoAsset } from "@/lib/types";

/** Official Tether contracts. These are not receiving wallets. */
export const USDT_CONTRACT: Record<CryptoAsset, string> = {
  USDT_TRC20: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  USDT_BEP20: "0x55d398326f99059fF775485246999027B3197955",
};

export const REQUIRED_CONFIRMATIONS: Record<CryptoAsset, number> = {
  USDT_TRC20: 19,
  USDT_BEP20: 15,
};

export const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const DEFAULT_BSC_RPCS = [
  "https://bsc-dataseed.binance.org",
  "https://bsc-rpc.publicnode.com",
];

export function networkLabel(asset: CryptoAsset): string {
  return asset === "USDT_BEP20" ? "BNB Smart Chain (BEP20)" : "TRON (TRC20)";
}

export function explorerTx(asset: CryptoAsset, hash: string): string {
  if (asset === "USDT_BEP20") return `https://bscscan.com/tx/${hash}`;
  return `https://tronscan.org/#/transaction/${hash}`;
}

export function isEvm(asset: CryptoAsset): boolean {
  return asset === "USDT_BEP20";
}
