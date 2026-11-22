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

        <text
          x="8"
          y="26"
          fill={`url(#${gGold})`}
          fontSize="16"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          SF
        </text>
        {/* Handshake: a deal / flip between two sides */}
        <path
          d="M14 40c2-3 4-4 6.2-4h3.2l2.2 2.2 2.2-2.2h3.2c2.2 0 4.2 1 6.2 4"
          stroke={`url(#${gGold})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.5 38.2l3.2 3.4 3.3-2.2 3.3 2.2 3.2-3.4"
          stroke={`url(#${gGold})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
