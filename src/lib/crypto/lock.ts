import { neon } from "@neondatabase/serverless";

let ready: Promise<void> | null = null;

export async function ensureCryptoTables() {
  if (!process.env.DATABASE_URL) return;
  if (!ready) {
    const url = process.env.DATABASE_URL;
    ready = (async () => {
      const sql = neon(url);
      await sql`
        CREATE TABLE IF NOT EXISTS sf_crypto_tx_lock (
          tx_hash text PRIMARY KEY,
          network text NOT NULL,
          order_id integer NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sf_crypto_payments (
          id text PRIMARY KEY,
          order_id integer NOT NULL,
          network text NOT NULL,
          expected_micro text NOT NULL,
          received_micro text,
          address text NOT NULL,
          tx_hash text,
          status text NOT NULL,
          confirmations integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL,
          expires_at timestamptz NOT NULL,
          confirmed_at timestamptz,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS sf_crypto_payments_order
        ON sf_crypto_payments (order_id)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS sf_crypto_payments_status
        ON sf_crypto_payments (status)
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sf_crypto_unmatched (
          tx_hash text PRIMARY KEY,
          network text NOT NULL,
          amount_micro text NOT NULL,
          from_address text,
          to_address text,
          block_time timestamptz,
          reason text NOT NULL,
          confirmations integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  await ready;
}

export async function syncCryptoRows(
  payments: {
    id: string;
    orderId: number;
    network: string;
    expectedMicro: string;
    receivedMicro: string | null;
    address: string;
    txHash: string | null;
    status: string;
    confirmations: number;
    createdAt: string;
    expiresAt: string;
    confirmedAt: string | null;
  }[],
  unmatched: {
    txHash: string;
    network: string;
    amountMicro: string;
    fromAddress: string;
    toAddress: string;
    blockTime: string | null;
    reason: string;
    confirmations: number;
  }[]
) {
  if (!process.env.DATABASE_URL) return;
  await ensureCryptoTables();
  const sql = neon(process.env.DATABASE_URL);
  for (const p of payments) {
    await sql`
      INSERT INTO sf_crypto_payments (
        id, order_id, network, expected_micro, received_micro, address, tx_hash,
        status, confirmations, created_at, expires_at, confirmed_at, updated_at
      ) VALUES (
        ${p.id}, ${p.orderId}, ${p.network}, ${p.expectedMicro}, ${p.receivedMicro},
        ${p.address}, ${p.txHash}, ${p.status}, ${p.confirmations},
        ${p.createdAt}, ${p.expiresAt}, ${p.confirmedAt}, now()
      )
      ON CONFLICT (id) DO UPDATE SET
        received_micro = EXCLUDED.received_micro,
        tx_hash = EXCLUDED.tx_hash,
        status = EXCLUDED.status,
        confirmations = EXCLUDED.confirmations,
        confirmed_at = EXCLUDED.confirmed_at,
        updated_at = now()
    `;
  }
  for (const u of unmatched) {
    await sql`
      INSERT INTO sf_crypto_unmatched (
        tx_hash, network, amount_micro, from_address, to_address, block_time, reason, confirmations
      ) VALUES (
        ${u.txHash.toLowerCase()}, ${u.network}, ${u.amountMicro}, ${u.fromAddress},
        ${u.toAddress}, ${u.blockTime}, ${u.reason}, ${u.confirmations}
      )
      ON CONFLICT (tx_hash) DO NOTHING
    `;
  }
}

export type TxClaim = "new" | "same" | "other";

/** One transaction hash can belong to only one order. */
export async function claimTx(
  hash: string,
  network: string,
  orderId: number,
  local: { txHash: string; orderId: number }[]
): Promise<TxClaim> {
  const key = hash.trim().toLowerCase();
  const have = local.find((l) => l.txHash.toLowerCase() === key);
  if (have && have.orderId !== orderId) return "other";
  if (!process.env.DATABASE_URL) {
    if (!have) local.push({ txHash: key, orderId });
    return have ? "same" : "new";
  }
  await ensureCryptoTables();
  const sql = neon(process.env.DATABASE_URL);
  const inserted = await sql`
    INSERT INTO sf_crypto_tx_lock (tx_hash, network, order_id)
    VALUES (${key}, ${network}, ${orderId})
    ON CONFLICT (tx_hash) DO NOTHING
    RETURNING tx_hash
  `;
  if (inserted.length) {
    if (!have) local.push({ txHash: key, orderId });
    return "new";
  }
  const rows = await sql`SELECT order_id FROM sf_crypto_tx_lock WHERE tx_hash = ${key}`;
  const owner = Number(rows[0]?.order_id);
  if (owner === orderId) {
    if (!have) local.push({ txHash: key, orderId });
    return "same";
  }
  return "other";
}
