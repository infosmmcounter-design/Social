import { CAT_ICONS } from "@/lib/constants";
import type { Category } from "@/lib/types";

export function CatIcon({ cat, size = 24 }: { cat: string; size?: number }) {
  const path = CAT_ICONS[cat as Category] || CAT_ICONS.other;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      style={{ flex: "none" }}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}
