import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service | SocialsFlip",
  description:
    "Terms of Service for SocialsFlip — escrow marketplace for accounts, services, and digital goods.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated="Last updated: November 26, 2026">
      <h2>1. Agreement</h2>
      <p>
        By using SocialsFlip you agree to these Terms. SocialsFlip provides an
        escrow-held marketplace for social accounts, freelance services, AI tools,
        subscriptions, and related digital offers. You must be at least 18 years old.
      </p>
      <h2>2. Escrow role</h2>
      <p>
        Buyers pay USDT (TRC20 or BEP20) into SocialsFlip escrow. Funds are held until
        the buyer confirms delivery or a dispute is resolved. SocialsFlip is not a bank
        and does not custody funds outside the stated escrow process.
      </p>
      <h2>3. Platform risks</h2>
      <p>
        Many platforms restrict or prohibit account transfers. Buyers accept that
        platform terms may change, accounts may be suspended, and SocialsFlip cannot
        guarantee continued access after a completed transfer. Listings must not
        promise outcomes that violate third-party terms.
      </p>
      <h2>4. Prohibited use</h2>
      <p>
        You may not use SocialsFlip for fraud, stolen goods, spam infrastructure,
        attacks, illegal content, or any listing on our Prohibited Items page. We may
        remove listings, freeze deals, and report abuse.
      </p>
      <h2>5. Fees and disputes</h2>
      <p>
        Escrow fees are shown before payment. Dispute windows and outcomes follow the
        Refund and Dispute Policy. Admin decisions on disputes are final for marketplace
        release or refund within SocialsFlip.
      </p>
      <h2>6. Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:legal@socialsflip.com">legal@socialsflip.com</a>.
      </p>
    </LegalDoc>
  );
}
