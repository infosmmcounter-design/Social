import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Scam Alerts | SocialsFlip",
  description:
    "Common marketplace scams and how SocialsFlip protects buyers and sellers.",
  alternates: { canonical: "/scam-alerts" },
};

export default function ScamAlertsPage() {
  return (
    <LegalDoc title="Scam Alerts" updated="Last updated: November 26, 2026">
      <h2>Never pay outside escrow</h2>
      <p>
        Anyone asking you to pay via personal wallet, gift cards, or “friends and
        family” is a red flag. SocialsFlip will never ask you to bypass escrow for a
        marketplace order.
      </p>
      <h2>Wrong-network USDT</h2>
      <p>
        Confirm TRC20 vs BEP20 before sending. The payment screen shows the network
        in a warning banner. Wrong-network transfers are often unrecoverable.
      </p>
      <h2>Off-platform chat</h2>
      <p>
        Keep negotiations in SocialsFlip until the deal is funded. External links and
        contact details shared early are a common lure.
      </p>
      <h2>Fake support</h2>
      <p>
        Support emails end with @socialsflip.com. We will not ask for your password or
        seed phrase. Report impersonation to{" "}
        <a href="mailto:abuse@socialsflip.com">abuse@socialsflip.com</a>.
      </p>
      <h2>Report a listing</h2>
      <p>
        Use the report control on a listing when available, or email abuse with the
        listing URL and screenshots.
      </p>
    </LegalDoc>
  );
}
