"use client";

import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { StartEscrowChat } from "@/components/StartEscrowChat";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does escrow work?",
    a: "You pay USDT (TRC20 or BEP20) into SocialsFlip escrow — never directly to the seller. Funds stay held until delivery is confirmed in the 3-way deal chat (buyer, seller, admin).",
  },
  {
    q: "How do I buy a freelance gig?",
    a: "Open Browse → Freelance Services (same chip row as YouTube, Facebook, TikTok…). Pick a gig, start escrow, pay, then share your brief in chat. Delivery days and revisions are listed on each gig.",
  },
  {
    q: "How do buyer reviews work?",
    a: "After a deal is completed, the buyer can rate and review the seller. Reviews are public on the listing and seller profile, shown in the language the buyer selected when writing them.",
  },
  {
    q: "Wrong network / payment issues",
    a: "Only USDT on TRC20 (Tron) or BEP20 (BNB Smart Chain) is accepted. Sending on the wrong network can lose funds. Open Chat with Escrow below or email support if something looks wrong.",
  },
  {
    q: "Seller did not deliver",
    a: "If the seller misses the delivery window after funds are held, use Claim refund / Cancel in the deal room. Admin escrow moderators review disputes — or start Chat with Escrow here.",
  },
  {
    q: "How do I become a seller?",
    a: "Use Sell / Apply, pick a category board (including Freelance Services), and submit your first listing. Admin approves sellers at their discretion.",
  },
];

export default function HelpPage() {
  const { t } = useLang();

  return (
    <section className="sec" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("help.title")}</h1>
      <p className="mut">{t("help.sub")}</p>

      <div className="card f escrow-support-hero" style={{ marginTop: 16 }}>
        <p className="pill g" style={{ marginBottom: 10 }}>
          {t("help.escrowBadge")}
        </p>
        <h2 style={{ marginTop: 0 }}>{t("help.chatEscrow")}</h2>
        <p className="sm" style={{ marginBottom: 12 }}>
          {t("help.chatEscrowSub")}
        </p>
        <StartEscrowChat />
        <p className="sm mut" style={{ marginTop: 14 }}>
          {t("help.orEmail")}:{" "}
          <a href="mailto:support@socialsflip.com">support@socialsflip.com</a>
        </p>
      </div>

      <div className="card hl-card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t("help.quickLinks")}</h2>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <Link className="btn s o" href="/orders">
            {t("orders.track")}
          </Link>
          <Link className="btn s o" href="/chats">
            {t("nav.chats")}
          </Link>
          <Link className="btn s o" href="/create-deal">
            {t("nav.createDeal")}
          </Link>
          <Link className="btn s o" href="/listings?cat=freelance">
            {t("nav.services")}
          </Link>
        </div>
      </div>

      <h2 style={{ marginTop: 28 }}>{t("help.faq")}</h2>
      {FAQS.map((f) => (
        <div className="card hl-card" key={f.q} style={{ marginBottom: 10 }}>
          <strong>{f.q}</strong>
          <p className="sm" style={{ margin: "8px 0 0" }}>
            {f.a}
          </p>
        </div>
      ))}

      <p className="sm mut" style={{ marginTop: 20 }}>
        <Link href="/privacy">{t("nav.privacy")}</Link>
      </p>
    </section>
  );
}
