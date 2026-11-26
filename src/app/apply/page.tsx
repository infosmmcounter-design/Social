"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

/** Old apply links open the seller page. Selling does not need approval. */
export default function ApplyPage() {
  const router = useRouter();
  const { locale } = useLang();

  useEffect(() => {
    router.replace(withLocalePrefix("/dashboard/seller", locale));
  }, [router, locale]);

  return <p className="sec mut">Opening your seller page…</p>;
}
