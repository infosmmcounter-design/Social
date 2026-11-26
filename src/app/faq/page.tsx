import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { LocaleLink as Link } from "@/components/LocaleLink";

export const metadata: Metadata = {
  title: "FAQ | SocialsFlip",
  description:
    "Frequently asked questions about SocialsFlip escrow, USDT payments, buying, and selling.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "How does escrow work?",
    a: "You pay USDT into SocialsFlip escrow — never directly to the seller. Funds stay held until you confirm delivery or a dispute is resolved.",
  },
  {
    q: "Which networks are accepted?",
    a: "USDT on TRC20 (Tron) and BEP20 (BNB Smart Chain) only. Sending on the wrong network can lose funds permanently.",
  },
  {
    q: "How do I buy?",
    a: "Browse listings, open a listing, start escrow, pay the exact amount shown, then follow the deal room checklist.",
  },
  {
    q: "How do I sell?",
    a: "Use Start selling, create a listing, wait for approval if required, then deliver inside the funded deal room.",
  },
  {
    q: "What if the seller does not deliver?",
    a: "Open a dispute from the deal room with evidence. Moderators can refund or release based on the Refund and Dispute Policy.",
  },
];

export default function FaqPage() {
  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
      <LegalDoc title="FAQ">
        {FAQS.map((f) => (
          <div key={f.q} style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: "1.05rem", marginBottom: 6 }}>{f.q}</h2>
            <p style={{ marginTop: 0 }}>{f.a}</p>
          </div>
        ))}
        <p>
          More detail: <Link href="/help">Help & Support</Link> ·{" "}
          <Link href="/scam-alerts">Scam Alerts</Link>
        </p>
      </LegalDoc>
    </>
  );
}
