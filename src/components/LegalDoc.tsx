import type { ReactNode } from "react";
import { LocaleLink as Link } from "./LocaleLink";

export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <section className="sec legal-page" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "2rem" }}>{title}</h1>
      {updated ? <p className="mut">{updated}</p> : null}
      {children}
      <p className="sm mut" style={{ marginTop: 28 }}>
        <Link href="/help">Help & Support</Link>
        {" · "}
        <Link href="/contact">Contact</Link>
        {" · "}
        <a href="mailto:support@socialsflip.com">support@socialsflip.com</a>
      </p>
    </section>
  );
}
