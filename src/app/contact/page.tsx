import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { LocaleLink as Link } from "@/components/LocaleLink";

export const metadata: Metadata = {
  title: "Contact | SocialsFlip",
  description:
    "Contact SocialsFlip support. Typical response within a few hours on business days.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalDoc title="Contact">
      <p>
        We aim to reply to support requests within a few hours on business days.
        For active deals, use the deal room or Help → Chat with Escrow so moderators
        can see context.
      </p>
      <h2>Support</h2>
      <p>
        Email:{" "}
        <a href="mailto:support@socialsflip.com">support@socialsflip.com</a>
        <br />
        Abuse:{" "}
        <a href="mailto:abuse@socialsflip.com">abuse@socialsflip.com</a>
        <br />
        Privacy:{" "}
        <a href="mailto:privacy@socialsflip.com">privacy@socialsflip.com</a>
      </p>
      <h2>Faster help</h2>
      <p>
        <Link className="btn s" href="/help">
          Open Help & escrow chat
        </Link>
      </p>
    </LegalDoc>
  );
}
