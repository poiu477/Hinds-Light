## Frontend Integration Guide

Target backend: Fastify + TypeScript service with PostgreSQL/Prisma, Redis, BullMQ.

### Base URL and CORS
- Local dev (host): `http://localhost:4000`
- Docker: API is published on host `http://localhost:4000`
- Recommended frontend env var: `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

Notes:
- The backend currently does not enable CORS. In Next.js App Router, prefer calling the backend from server components/route handlers, or proxy via a Next.js Route Handler to avoid browser CORS issues.

Example proxy (optional): `app/api/backend/items/route.ts`
```ts
// Next.js Route Handler proxy
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/items?${url.searchParams.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
    // Forward cookies/headers if you add auth later
  });
  return new NextResponse(await res.text(), { status: res.status });
}
```

### Rate limiting
- 300 requests / 15 minutes per IP (HTTP 429 on exceed).

### Data contracts (responses are JSON)

- GET `/health`
  - Response: `{ status: 'ok', uptime: number }`

- GET `/api/v1/sources`
  - Response: `{ sources: Source[] }`
  - Type:
    ```ts
    type Source = {
      id: string
      type: 'RSS'
      name: string // Hebrew name
      displayName: string | null // English label
      alignment: string | null
      url: string | null
      language: string // default 'he'
      active: boolean
      createdAt: string
      updatedAt: string
    }
    ```

- POST `/api/v1/sources` (optional admin path; for adding more RSS)
  - Body: `{ type: 'RSS', name: string, url: string, language?: string, active?: boolean }`
  - Response: `{ source: Source }`

- GET `/api/v1/items`
  - Query params:
    - `limit` number (1..100, default 50)
    - `before` string (cursor id from previous response `nextCursor`)
    - `sourceId` string (optional filter)
    - `lang` 'en' | 'he' (default 'en')
  - Response:
    ```ts
    type ItemListResponse = {
      items: Array<{
        id: string
        sourceId: string
        type: 'ARTICLE' | 'POST' | 'TWEET' | 'THREAD' | 'VIDEO'
        title: string | null
        url: string | null
        publishedAt: string | null
        language: 'en' | 'he'
        text: string // translated (en) if available, else original
      }>
      nextCursor: string | null // pass as ?before= on next call
    }
    ```

- GET `/api/v1/items/:id`
  - Response: `{ item: ContentItem } | { error: 'Not found' }`
  - Type:
    ```ts
    type ContentItem = {
      id: string
      sourceId: string
      type: 'ARTICLE' | 'POST' | 'TWEET' | 'THREAD' | 'VIDEO'
      title: string | null
      url: string | null
      originalLanguage: string
      originalText: string
      translatedLanguage: string | null
      translatedText: string | null
      translationStatus: 'PENDING' | 'TRANSLATED' | 'FAILED'
      publishedAt: string | null
      createdAt: string
      updatedAt: string
    }
    ```

Error shape examples:
- 404: `{ error: 'Not found' }`
- 429: `{ error: 'Too Many Requests' }`

Translation behavior:
- When requesting `lang=en`, backend returns `text = translatedText ?? originalText`.
- `translationStatus` may be `PENDING` shortly after ingest; UI can display a "Translating…" hint.

Data freshness:
- RSS ingest jobs run periodically (by default every 5 minutes) and also on new source creation. Some feeds may occasionally return 403/404; the backend skips and retries in the next cycle.

Reference (example feed already seeded): `https://www.srugim.co.il/feed`.

### Next.js (App Router) integration

Set env: `.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Shared fetcher (server or client)
```ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}
```

React Query setup (client-side)
```tsx
// app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

Use in layout
```tsx
// app/layout.tsx
import './globals.css';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Infinite feed with React Query
```tsx
"use client";
import { useInfiniteQuery } from '@tanstack/react-query';

type Item = {
  id: string; sourceId: string; type: string; title: string | null;
  url: string | null; publishedAt: string | null; language: 'en' | 'he'; text: string;
};
type ItemPage = { items: Item[]; nextCursor: string | null };

async function fetchPage(cursor?: string, sourceId?: string, lang: 'en' | 'he' = 'en'): Promise<ItemPage> {
  const params = new URLSearchParams();
  params.set('limit', '50');
  params.set('lang', lang);
  if (sourceId) params.set('sourceId', sourceId);
  if (cursor) params.set('before', cursor);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/items?${params}`);
  if (!res.ok) throw new Error(`Failed ${res.status}`);
  return res.json();
}

export function useFeed(sourceId?: string, lang: 'en' | 'he' = 'en') {
  return useInfiniteQuery({
    queryKey: ['items', { sourceId, lang }],
    queryFn: ({ pageParam }) => fetchPage(pageParam as string | undefined, sourceId, lang),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });
}
```

Source list
```ts
type SourcesResponse = { sources: Array<{ id: string; name: string; displayName: string | null; alignment: string | null; url: string | null; language: string; active: boolean }> };

export async function getSources(): Promise<SourcesResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sources`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load sources');
  return res.json();
}
```

### Zustand (or Redux Toolkit) for UI state

Use a lightweight store for filters (selected source, language), and ephemeral UI state (panel open, etc.).

Zustand example
```ts
import { create } from 'zustand';

type FeedState = {
  selectedSourceId?: string
  lang: 'en' | 'he'
  setSource: (id?: string) => void
  setLang: (l: 'en' | 'he') => void
};

export const useFeedStore = create<FeedState>((set) => ({
  selectedSourceId: undefined,
  lang: 'en',
  setSource: (id) => set({ selectedSourceId: id }),
  setLang: (l) => set({ lang: l })
}));
```

Integrate with the feed hook
```tsx
"use client";
import { useFeedStore } from '@/stores/feed';
import { useFeed } from '@/hooks/useFeed';

export function Feed() {
  const { selectedSourceId, lang } = useFeedStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(selectedSourceId, lang);

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {items.map((i) => (
        <article key={i.id} className="rounded border p-3">
          <div className="text-sm text-gray-500">{new Date(i.publishedAt ?? Date.now()).toLocaleString()}</div>
          <h3 className="font-semibold">{i.title ?? 'Untitled'}</h3>
          <p className="mt-2 whitespace-pre-line">{i.text}</p>
        </article>
      ))}
      {hasNextPage && (
        <button className="btn" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
```

### Tailwind CSS
- Install Tailwind in your Next.js project and apply utility classes as above.
- For RTL Hebrew display, toggle `dir="rtl"` on containers or use Tailwind plugins for RTL if needed.

### Operational notes
- Backend 429s: React Query will retry by default; consider setting `retry: false` on write paths.
- Items may show original Hebrew text temporarily while translation jobs complete.
- Source metadata (e.g., alignment) is included to help badge or filter sources in the UI.

### Known limitations / roadmap
- No auth yet.
- No websocket push; polling/infinite queries recommended.
- CORS disabled by default; use server components/proxy route in Next.js for browser calls, or enable CORS on the backend later.

### Reference link
- Srugim RSS (seeded): [`https://www.srugim.co.il/feed`](https://www.srugim.co.il/feed)


