import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Refund & Dispute Policy | SocialsFlip",
  description:
    "How SocialsFlip handles refunds, disputes, evidence, and escrow release timelines.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <LegalDoc
      title="Refund and Dispute Policy"
      updated="Last updated: November 26, 2026"
    >
      <h2>1. When funds stay in escrow</h2>
      <p>
        After payment, USDT remains in escrow until the buyer confirms delivery or a
        dispute is decided. Sellers should not ask buyers to release early or pay
        outside the platform.
      </p>
      <h2>2. Opening a dispute</h2>
      <p>
        Buyers can open a dispute from the deal room if delivery is late, incomplete,
        or not as described. Upload evidence (screenshots, chat logs, proof of access
        issues). Sellers may respond with their evidence.
      </p>
      <h2>3. Decision window</h2>
      <p>
        Escrow hold and review windows are shown on the homepage and in the deal room
        (default cooling-off / hold period applies per settings). Admin may release to
        the seller, refund the buyer, or split when evidence supports it.
      </p>
      <h2>4. Non-refundable cases</h2>
      <p>
        After the buyer confirms delivery and funds are released, refunds are not
        guaranteed. Change-of-mind after a successful transfer is not grounds for
        refund. Wrong-network crypto sends may be unrecoverable.
      </p>
      <h2>5. Contact</h2>
      <p>
        Use Help → Chat with Escrow or email{" "}
        <a href="mailto:support@socialsflip.com">support@socialsflip.com</a>.
      </p>
    </LegalDoc>
  );
}
