"use client";

import { useId } from "react";
import { LocaleLink as Link } from "./LocaleLink";

/**
 * SocialsFlip mark: a verified shield with a gold deal handshake inside.
 * Wordmark: Socials (near-black) + Flip (gold).
 */
export function BrandLogo({
  href = "/",
  size = 40,
  showWord = true,
}: {
  href?: string;
  size?: number;
  showWord?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const face = `${uid}-face`;
  const gold = `${uid}-gold`;
  const goldSoft = `${uid}-gold-soft`;

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
          <linearGradient id={face} x1="20" y1="2" x2="46" y2="62" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3C3426" />
            <stop offset="0.42" stopColor="#17140F" />
            <stop offset="1" stopColor="#070605" />
          </linearGradient>
          <linearGradient id={gold} x1="14" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF6D0" />
            <stop offset="0.38" stopColor="#F0C14B" />
            <stop offset="1" stopColor="#8D6410" />
          </linearGradient>
          <linearGradient id={goldSoft} x1="18" y1="16" x2="46" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF8DE" />
            <stop offset="1" stopColor="#C9962A" />
          </linearGradient>
        </defs>

        <path
          d="M32 2.2 56 12.6v17.2c0 15.2-9.6 26.2-24 33.2C17.6 56 8 45 8 29.8V12.6L32 2.2Z"
          fill={`url(#${face})`}
        />
        <path
          d="M32 5.2 52.6 14.2v14.8c0 13.2-8.2 23-20.6 29.2C19.6 52 11.4 42.2 11.4 29V14.2L32 5.2Z"
          stroke={`url(#${gold})`}
          strokeWidth="1.6"
        />

        <circle cx="32" cy="18" r="6.15" fill={`url(#${gold})`} />
        <path
          d="M28.7 18.1 30.9 20.4 35.4 15.6"
          stroke="#1A1408"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g
          transform="translate(16.2 26.2) scale(1.32)"
          fill="none"
          stroke={`url(#${goldSoft})`}
          strokeWidth="2.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m11 17 2 2a1 1 0 1 0 3-3" />
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
          <path d="m21 3 1 11h-2" />
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <path d="M3 4h8" />
        </g>
      </svg>
      {showWord ? (
        <span className="brand-word">
          Socials<span>Flip</span>
        </span>
      ) : null}
    </Link>
  );
}
