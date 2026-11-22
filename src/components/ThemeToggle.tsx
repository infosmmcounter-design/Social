"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("sf_theme", theme);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("sf_theme");
    const next: Theme = saved === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  return (
    <div className="theme-toggle" role="group" aria-label="Color mode">
      <button
        type="button"
        className={theme === "light" ? "on" : ""}
        aria-pressed={theme === "light"}
        aria-label="Light mode"
        title="Light mode"
        onClick={() => {
          setTheme("light");
          applyTheme("light");
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className={theme === "dark" ? "on" : ""}
        aria-pressed={theme === "dark"}
        aria-label="Dark mode"
        title="Dark mode"
        onClick={() => {
          setTheme("dark");
          applyTheme("dark");
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}
