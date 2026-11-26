import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { LocaleLink as Link } from "@/components/LocaleLink";

export const metadata: Metadata = {
  title: "About SocialsFlip | Escrow Marketplace",
  description:
    "SocialsFlip is an escrow-protected marketplace for social accounts, freelance services, and digital tools.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalDoc title="About SocialsFlip">
      <p>
        SocialsFlip helps buyers and sellers complete deals for social accounts,
        freelance work, AI tools, and subscriptions with USDT held in escrow until
        delivery is confirmed.
      </p>
      <h2>Why escrow</h2>
      <p>
        Off-platform payments are a common scam vector. Our deal rooms keep buyer,
        seller, and moderators in one place, with funds released only after confirmation
        or a dispute decision.
      </p>
      <h2>What we sell (and do not)</h2>
      <p>
        We host marketplace listings. We do not guarantee that third-party platforms
        allow account transfers. Read each listing carefully and review our{" "}
        <Link href="/terms">Terms</Link> and <Link href="/scam-alerts">Scam Alerts</Link>.
      </p>
      <h2>Contact</h2>
      <p>
        <Link href="/contact">Contact page</Link> ·{" "}
        <a href="mailto:hello@socialsflip.com">hello@socialsflip.com</a>
      </p>
    </LegalDoc>
  );
}
