"use client";

import { Moon, Sun } from "lucide-react";

// No React state: which icon shows is driven purely by CSS off the
// html[data-theme] attribute (see .theme-icon-* rules in globals.css), so
// there's nothing to resync in an effect and no server/client mismatch.
function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  try {
    localStorage.setItem("pulse-theme", next);
  } catch {
    // Private browsing / blocked storage — theme just won't persist.
  }
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Changer de thème"
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-text-secondary transition-colors hover:text-text-primary"
    >
      <span className="theme-icon-dark">
        <Sun size={15} />
      </span>
      <span className="theme-icon-light">
        <Moon size={15} />
      </span>
    </button>
  );
}
