import { QueryClient } from "@tanstack/react-query";

let client: QueryClient | null = null;

export function getOrCreateQueryClient(): QueryClient {
  if (client) return client;
  client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
  return client;
}


