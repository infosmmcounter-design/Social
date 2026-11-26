"use client";

import { useId } from "react";
import { CAT_ICONS } from "@/lib/constants";
import type { Category } from "@/lib/types";

/** Brand-colored category mark. Pass `spin` for the live homepage pods. */
export function CatIcon({
  cat,
  size = 24,
  className,
}: {
  cat: string;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const raw = CAT_ICONS[cat as Category] || CAT_ICONS.other;
  // Unique gradient / filter ids when many icons share a page
  const path = raw
    .replace(/\bid="([^"]+)"/g, (_m, id: string) => `id="${id}-${uid}"`)
    .replace(/url\(#([^)]+)\)/g, (_m, id: string) => `url(#${id}-${uid})`);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={className}
      style={{ flex: "none", display: "block" }}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}
