"use client";

import React from "react";

type Theme = "light" | "dark" | "system";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + "="));
  return match?.split("=")?.[1];
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; Expires=${expires}; Path=/; SameSite=Lax`;
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (getCookie("theme") as Theme) || "system";
  });

  const applyTheme = React.useCallback((next: Theme) => {
    const root = document.documentElement;
    if (next === "dark") {
      root.classList.add("dark");
    } else if (next === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, []);

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  function cycleTheme() {
    const order: Theme[] = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
    setCookie("theme", next);
  }

  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      <span className="mr-2">Theme:</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}


