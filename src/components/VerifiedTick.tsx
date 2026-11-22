/** Blue verification tick for verified sellers. */
export function VerifiedTick({ size = 16, title = "Verified seller" }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-label={title}
      role="img"
      style={{ display: "inline-block", verticalAlign: "middle", marginInlineStart: 4 }}
    >
      <title>{title}</title>
      <circle cx="12" cy="12" r="11" fill="#1D9BF0" />
      <path
        d="M7.2 12.4l2.8 2.8 6.4-6.4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
