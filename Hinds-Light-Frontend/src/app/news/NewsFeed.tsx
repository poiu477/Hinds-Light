"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <LoadingSpinner size="lg" text="Loading latest news..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header onRefresh={() => refetch()} isRefreshing={isFetching} />
        <div className="container mx-auto px-6 py-8">
          <ErrorState 
            message={(error as Error)?.message ?? "Error loading articles"}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onRefresh={() => refetch()} isRefreshing={isFetching} />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Articles Grid */}
          {flatItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-400">Check back later for new content.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {flatItems.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-10" />

          {/* Load more section */}
          <div className="mt-8 flex items-center justify-center">
            {isFetchingNextPage ? (
              <LoadingSpinner text="Loading more articles..." />
            ) : hasNextPage ? (
              <button
                onClick={() => fetchNextPage()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Load More Articles
              </button>
            ) : flatItems.length > 0 ? (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You&apos;re all caught up!
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}


