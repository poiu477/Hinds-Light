"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import { useFilteredItems } from "@/features/items/hooks";
import { useFilterStore } from "@/stores/useFilterStore";
import { useSources } from "@/features/sources/hooks";
import type { NewsItem } from "@/types/api";

// Article type is now handled by NewsItem from @/types/api

// Note: The article fetching is now handled by useFilteredItems hook via React Query

export default function NewsFeed() {
  // Get filter state
  const {
    selectedSources,
    selectedTags,
    hasActiveFilters,
    getFilterSummary,
    clearAllFilters,
  } = useFilterStore();

  // Get sources data for mapping
  const { data: sourcesData } = useSources({ active: true });
  const sources = sourcesData || [];

  // Use React Query hooks
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useFilteredItems(selectedSources, selectedTags, 'en');

  // Access items from the hook result and enhance with source info
  const newsItems: NewsItem[] = data?.items || [];
  

  
  // Helper function to extract domain from URL
  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return '';
    }
  };

  // Helper function to get source info
  const getSourceInfo = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    console.log('Looking for source:', { sourceId, found: !!source, totalSources: sources.length });
    return {
      name: source?.displayName || source?.name || 'Unknown Source',
      domain: source?.url ? extractDomain(source.url) : '',
      url: source?.url
    };
  };

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
        <Header onRefresh={() => refetch()} isRefreshing={isRefetching} />
        <div className="container mx-auto px-6 py-8">
          <LoadingSpinner size="lg" text="Loading latest news..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header onRefresh={() => refetch()} isRefreshing={isRefetching} />
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
      <Header onRefresh={() => refetch()} isRefreshing={isRefetching} />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Active Filters Banner */}
          {hasActiveFilters() && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Filtered Feed
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {getFilterSummary()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    href="/sources"
                    className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Manage Filters
                  </Link>
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {newsItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {hasActiveFilters() ? "No articles match your filters" : "No articles found"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {hasActiveFilters() 
                  ? "Try adjusting your source and category filters to see more content."
                  : "Check back later for new content."
                }
              </p>
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}

            </div>
          ) : (
            <div className="grid gap-6">
              {newsItems.map((item: NewsItem) => {
                const sourceInfo = getSourceInfo(item.sourceId);
                return (
                  <ArticleCard 
                    key={item.id} 
                    article={{
                      id: item.id,
                      source: sourceInfo.name,
                      sourceDomain: sourceInfo.domain,
                      originalLanguage: item.originalLanguage,
                      originalText: item.originalText,
                      translatedText: item.text,
                      url: item.url || undefined,
                      publishedAt: item.publishedAt || undefined,
                      title: item.title || undefined,
                      tags: item.translatedTags || []
                    }} 
                  />
                );
              })}
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
            ) : newsItems.length > 0 ? (
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


