import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Prohibited Items | SocialsFlip",
  description:
    "Items and services not allowed on SocialsFlip marketplace listings.",
  alternates: { canonical: "/prohibited" },
};

export default function ProhibitedPage() {
  return (
    <LegalDoc title="Prohibited Items" updated="Last updated: November 26, 2026">
      <h2>Not allowed</h2>
      <p>Do not list or promote:</p>
      <ul>
        <li>Stolen, hacked, or unauthorized accounts</li>
        <li>Spam, phishing, carding, fraud kits, or attack infrastructure</li>
        <li>DDoS, malware, credential stuffing, or similar abuse tools</li>
        <li>Illegal content, CSAM, or anything that exploits minors</li>
        <li>Weapons, drugs, or regulated goods requiring licenses we do not support</li>
        <li>Listings that instruct buyers to pay outside escrow</li>
      </ul>
      <h2>Reporting</h2>
      <p>
        Use Report on a listing or email{" "}
        <a href="mailto:abuse@socialsflip.com">abuse@socialsflip.com</a>. We may
        remove content, ban accounts, and share information with authorities when
        required.
      </p>
    </LegalDoc>
  );
}
