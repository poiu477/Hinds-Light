"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

type Article = {
  id: string;
  source: string;
  originalLanguage: string;
  originalText: string;
  translatedText: string;
  url?: string;
  publishedAt?: string;
};

type Page = { items: Article[]; nextCursor: string | null };

async function fetchPage(cursor?: string): Promise<Page> {
  try {
    const params = new URLSearchParams({ lang: "he", limit: "50" });
    if (cursor) params.set("before", cursor);
    const res = await fetch(`/api/v2/items?${params.toString()}`);
    if (!res.ok) {
      let message = `Failed to load items (status ${res.status})`;
      try {
        const data = (await res.json()) as unknown;
        if (
          data &&
          typeof data === 'object' &&
          'error' in (data as Record<string, unknown>) &&
          typeof (data as Record<string, unknown>).error === 'string'
        ) {
          message = (data as Record<string, string>).error;
        }
      } catch {
        // ignore
      }
      throw new Error(message);
    }
    const payload = (await res.json()) as unknown;

    const extractItems = (value: unknown): unknown[] => {
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        // APIResponse shape: { success, data }
        if ("data" in obj) {
          const data = obj["data"];
          if (Array.isArray(data)) return data;
          if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>)["items"])) {
            return (data as Record<string, unknown>)["items"] as unknown[];
          }
        }
        // Fallback to top-level items
        if (Array.isArray(obj["items"])) return obj["items"] as unknown[];
      }
      return [];
    };

    const list: unknown[] = extractItems(payload);
    const extractNextCursor = (value: unknown): string | null => {
      if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        if ("data" in obj && obj.data && typeof obj.data === "object") {
          const d = obj.data as Record<string, unknown>;
          const nc = d["nextCursor"];
          if (typeof nc === "string" && nc.trim().length > 0) return nc;
          if (nc === null) return null;
        }
        const ncTop = obj["nextCursor"];
        if (typeof ncTop === "string" && ncTop.trim().length > 0) return ncTop;
        if (ncTop === null) return null;
      }
      return null;
    };

    const toStr = (obj: Record<string, unknown>, keys: string[]): string => {
      for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string" && v.trim().length > 0) return v;
      }
      return "";
    };

    const toArticle = (raw: unknown): Article | null => {
      if (!raw || typeof raw !== "object") return null;
      const o = raw as Record<string, unknown>;
      const id = toStr(o, ["id", "uuid", "item_id"]);
      const source = toStr(o, ["source", "source_name", "origin", "platform"]);
      const originalText =
        toStr(o, [
          "originalText",
          "original_text",
          "text_he",
          "original",
          "text",
          "content",
        ]) || "";
      const translatedText =
        toStr(o, [
          "translatedText",
          "translated_text",
          "text_en",
          "translation",
          "english",
        ]) || originalText;
      const url = toStr(o, ["url", "link", "permalink"]);
      const publishedAt =
        toStr(o, ["publishedAt", "published_at", "created_at", "timestamp"]) || undefined;

      if (!id) return null;
      return { id, source, originalLanguage: "he", originalText, translatedText, url, publishedAt };
    };

    const items = list.map(toArticle).filter((x): x is Article => x !== null);
    const nextCursor = extractNextCursor(payload);
    return { items, nextCursor };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Network error: ${msg}`);
  }
}

export default function NewsFeed() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useInfiniteQuery<Page, Error>({
    queryKey: ["articles", { lang: "he" }],
    queryFn: ({ pageParam }) => fetchPage(pageParam as string | undefined),
    getNextPageParam: (lastPage: Page) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });

  const flatItems = useMemo(() => {
    const pages = (data?.pages as Page[]) ?? [];
    return pages.flatMap((p) => p.items);
  }, [data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage().catch(() => {});
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (isError)
    return (
      <div className="text-sm text-red-600">
        {(error as Error)?.message ?? "Error loading articles"}
      </div>
    );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Translated Hebrew News</h2>
        <button
          className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <ul className="space-y-4">
        {flatItems.map((a) => (
          <li key={a.id} className="p-4 rounded border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                {a.source} · {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ""}
              </div>
              {a.url ? (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Source
                </a>
              ) : null}
            </div>
            <div className="mt-2 text-xs text-gray-500">Original (HE)</div>
            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">{a.originalText}</p>
            <div className="mt-3 text-xs text-gray-500">Translation (EN)</div>
            <p className="mt-1 text-base leading-7 font-medium whitespace-pre-wrap">
              {a.translatedText}
            </p>
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} className="h-10" />
      <div className="mt-4 flex items-center justify-center">
        {isFetchingNextPage ? (
          <span className="text-sm text-gray-500">Loading more…</span>
        ) : hasNextPage ? (
          <button
            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
            onClick={() => fetchNextPage()}
          >
            Load more
          </button>
        ) : (
          <span className="text-xs text-gray-400">No more items</span>
        )}
      </div>
    </div>
  );
}


