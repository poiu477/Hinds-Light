"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getOrCreateQueryClient } from "@/lib/queryClient";

// Lightweight theme sync: read cookie and set <html class="dark"> before paint
function useApplyInitialThemeFromCookie() {
  React.useEffect(() => {
    try {
      const cookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("theme="));
      const theme = cookie?.split("=")?.[1];
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = theme === "dark" || (!theme || theme === "system") && prefersDark;
      document.documentElement.classList.toggle("dark", !!shouldDark);
    } catch {
      // no-op
    }
  }, []);
}

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = React.useState(() => getOrCreateQueryClient());
  useApplyInitialThemeFromCookie();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}


