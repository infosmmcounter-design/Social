/** USDT amounts are matched at 6 decimal places (1 micro-USDT). */

export const MICRO = 1_000_000n;

export function usdToMicro(amount: number): bigint {
  const cents = Math.round(Number(amount) * 100);
  if (!Number.isFinite(cents)) return 0n;
  return BigInt(cents) * 10_000n;
}

export function microToUsd(micro: bigint): string {
  const neg = micro < 0n;
  const v = neg ? -micro : micro;
  const whole = v / MICRO;
  const frac = (v % MICRO).toString().padStart(6, "0");
  return `${neg ? "-" : ""}${whole.toString()}.${frac}`;
}

/** Convert a raw token integer into 6-decimal micro-USDT. */
export function chainToMicro(
  raw: bigint,
  decimals: number
): { micro: bigint; exact: boolean } {
  if (decimals >= 6) {
    const factor = 10n ** BigInt(decimals - 6);
    return { micro: raw / factor, exact: raw % factor === 0n };
  }
  const factor = 10n ** BigInt(6 - decimals);
  return { micro: raw * factor, exact: true };
}

export function sameAddress(a: string, b: string, evm: boolean): boolean {
  if (evm) return a.trim().toLowerCase() === b.trim().toLowerCase();
  return a.trim() === b.trim();
}
