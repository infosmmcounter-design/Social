"use client";

/** Visual hint that Gmail, Yahoo, Outlook, or any inbox works with email signup. */
export function EmailProviders({ onPick }: { onPick?: () => void }) {
  return (
    <div className="email-providers" role="group" aria-label="Email providers">
      <button type="button" className="email-provider" onClick={onPick}>
        <span className="email-provider-ic gmail" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 12.7 2 6.2V18c0 1.1.9 2 2 2h3.2V11.3L12 15.6l4.8-4.3V20H20c1.1 0 2-.9 2-2V6.2l-10 6.5z"
            />
            <path fill="#FBBC04" d="M22 6.2V6c0-1.1-.9-2-2-2h-.4L12 9.4 4.4 4H4C2.9 4 2 4.9 2 6v.2l10 6.5 10-6.5z" />
            <path fill="#34A853" d="M2 6.2 7.2 9.6V20H4c-1.1 0-2-.9-2-2V6.2z" />
            <path fill="#4285F4" d="M22 6.2V18c0 1.1-.9 2-2 2h-3.2V9.6L22 6.2z" />
          </svg>
        </span>
        Gmail
      </button>
      <button type="button" className="email-provider" onClick={onPick}>
        <span className="email-provider-ic yahoo" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#6001D2"
              d="M12.9 3.2 16.8 12l3.9-8.8h2.6L17.5 15.2v5.6h-2.7v-5.6L9.1 3.2h3.8zM5.2 3.2l4.2 9.4H6.7L3.6 5.8 1.3 12.6H0L4.1 3.2h1.1z"
            />
          </svg>
        </span>
        Yahoo
      </button>
      <button type="button" className="email-provider" onClick={onPick}>
        <span className="email-provider-ic outlook" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#0078D4" d="M2 5.5A2.5 2.5 0 0 1 4.5 3h9A2.5 2.5 0 0 1 16 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 2 18.5v-13z" />
            <path fill="#28A8EA" d="M16 7.5h5.5A1.5 1.5 0 0 1 23 9v9.5a1.5 1.5 0 0 1-1.5 1.5H16V7.5z" />
            <circle fill="#fff" cx="9" cy="12" r="3.2" />
          </svg>
        </span>
        Outlook
      </button>
      <button type="button" className="email-provider" onClick={onPick}>
        <span className="email-provider-ic any" aria-hidden>
          @
        </span>
        Any email
      </button>
    </div>
  );
}
