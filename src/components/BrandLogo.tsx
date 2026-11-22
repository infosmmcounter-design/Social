"use client";

import { useId } from "react";
import { LocaleLink as Link } from "./LocaleLink";

/**
 * SocialsFlip mark: black tile, gold flip arrows, clear SF monogram.
 * Wordmark: Socials (near-black) + Flip (dark yellow).
 */
export function BrandLogo({
  href = "/",
  size = 36,
  showWord = true,
}: {
  href?: string;
  size?: number;
  showWord?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const gBg = `${uid}-bg`;
  const gGold = `${uid}-gold`;

  return (
    <Link className="brand" href={href} aria-label="SocialsFlip home">
      <svg
        className="brand-mark"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={gBg}
            x1="6"
            y1="2"
            x2="58"
            y2="62"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1C1C1C" />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
          <linearGradient
            id={gGold}
            x1="14"
            y1="10"
            x2="50"
            y2="54"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F6E08A" />
            <stop offset="0.5" stopColor="#E2B93D" />
            <stop offset="1" stopColor="#B8860B" />
          </linearGradient>
        </defs>

        <rect width="64" height="64" rx="16" fill={`url(#${gBg})`} />
        <rect
          x="2.75"
          y="2.75"
          width="58.5"
          height="58.5"
          rx="13.5"
          stroke={`url(#${gGold})`}
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />

        {/* Top flip arrow → */}
        <path
          d="M17 23.5h24.5L35.2 17"
          stroke={`url(#${gGold})`}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom flip arrow ← */}
        <path
          d="M47 40.5H22.5L28.8 47"
          stroke={`url(#${gGold})`}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* SF — vector paths (no ambiguous letter shapes) */}
        <path
          fill={`url(#${gGold})`}
          d="M18.2 33.1c0-2.35 1.95-3.85 4.85-3.85 1.7 0 3.05.45 4.05 1.25l-1.2 1.65c-.7-.55-1.6-.9-2.7-.9-1.35 0-2.15.65-2.15 1.65 0 .85.55 1.35 2.4 1.75l1.05.25c2.85.65 4.25 1.85 4.25 3.95 0 2.5-2.05 4.15-5.15 4.15-2.05 0-3.7-.65-4.75-1.8l1.3-1.55c.75.85 1.85 1.3 3.2 1.3 1.45 0 2.3-.7 2.3-1.7 0-.85-.55-1.35-2.45-1.8l-1.05-.25c-2.95-.7-4.4-1.9-4.4-4.05Z"
        />
        <path
          fill={`url(#${gGold})`}
          d="M30.6 29.4h3.55v5.35h5.1V29.4H42.8v12.3h-3.55v-5.05h-5.1v5.05H30.6V29.4Z"
        />
      </svg>
      {showWord ? (
        <span className="brand-word">
          Socials<span>Flip</span>
        </span>
      ) : null}
    </Link>
  );
}
