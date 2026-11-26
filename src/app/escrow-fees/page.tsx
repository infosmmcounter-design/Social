import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { readStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "Escrow Fees | SocialsFlip",
  description:
    "SocialsFlip escrow fee schedule for USDT-protected marketplace deals.",
  alternates: { canonical: "/escrow-fees" },
};

export const revalidate = 300;

export default async function EscrowFeesPage() {
  let fee = 5;
  try {
    const store = await readStore();
    fee = Number(store.settings.fee || 5);
  } catch {
    /* default */
  }

  return (
    <LegalDoc title="Escrow Fees" updated="Last updated: November 26, 2026">
      <h2>Current buyer escrow fee</h2>
      <p>
        The published escrow fee is <strong>{fee}%</strong> of the listing price,
        calculated and shown before you pay. The fee helps fund dispute handling,
        monitoring, and platform operations.
      </p>
      <h2>What you see before paying</h2>
      <p>
        Every checkout shows the item price, escrow fee, network (TRC20 or BEP20),
        exact USDT amount, and countdown. Confirm the network before sending.
      </p>
      <h2>Seller payouts</h2>
      <p>
        After the buyer confirms delivery (or admin releases a dispute in the seller’s
        favor), the seller receives the listing amount according to payout rules.
        Withdrawal minimums and history appear in the seller account when enabled.
      </p>
      <h2>Questions</h2>
      <p>
        Email <a href="mailto:billing@socialsflip.com">billing@socialsflip.com</a> or
        open an escrow chat from Help.
      </p>
    </LegalDoc>
  );
}
