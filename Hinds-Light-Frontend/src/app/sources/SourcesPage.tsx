"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import { useSources, useCategories } from "@/features/sources/hooks";
import { useFilterStore } from "@/stores/useFilterStore";
import type { Source } from "@/types/api";

export default function SourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Filter store for managing selected sources and tags
  const {
    selectedSources,
    selectedTags,
    hasActiveFilters,
    getFilterSummary,
    clearAllFilters,
  } = useFilterStore();

  const { 
    data: sourcesResponse, 
    isLoading: sourcesLoading, 
    isError: sourcesError, 
    error: sourcesErrorData,
    refetch: refetchSources 
  } = useSources({ 
    category: selectedCategory, 
    active: showActiveOnly 
  });

  const { 
    data: categoriesResponse, 
    isLoading: categoriesLoading 
  } = useCategories();

  const sources = sourcesResponse || [];
  const categories = categoriesResponse || [];
  
  console.log('Sources page data:', { 
    sources: sources.length, 
    categories: categories.length,
    sourcesResponse,
    categoriesResponse 
  });

  if (sourcesLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <LoadingSpinner size="lg" text="Loading sources..." />
        </div>
      </div>
    );
  }

  if (sourcesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <ErrorState 
            message={(sourcesErrorData as Error)?.message ?? "Error loading sources"}
            onRetry={() => refetchSources()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Source Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select sources and tags to filter your news feed
            </p>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      News Feed Filters Active
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {getFilterSummary()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    href="/"
                    className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Filtered Feed
                  </Link>
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filters
            </h2>
            
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Show active only
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sources</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sources.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sources</h3>
              <p className="text-2xl font-bold text-green-600">{sources.filter(s => s.active).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">RSS Categories</h3>
              <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Articles</h3>
              <p className="text-2xl font-bold text-purple-600">{sources.reduce((sum, s) => sum + (s._count?.items || 0), 0)}</p>
            </div>
          </div>

          {/* Sources Grid */}
          {sources.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sources found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCategory ? `No sources found for "${selectedCategory}" category` : "No sources available"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {sources.map((source) => (
                <SourceCard 
                  key={source.id} 
                  source={source}
                  selectedSources={selectedSources}
                  selectedTags={selectedTags}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface SourceCardProps {
  source: Source;
  selectedSources: string[];
  selectedTags: string[];
}

function SourceCard({ source, selectedSources, selectedTags }: SourceCardProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const { toggleSource, toggleTag } = useFilterStore();
  
  const isSourceSelected = selectedSources.includes(source.id);
  const sourceCategories = source.categories || [];
  const displayedCategories = showAllTags ? sourceCategories : sourceCategories.slice(0, 6);
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border-2 transition-all ${
      isSourceSelected 
        ? "border-blue-500 dark:border-blue-400 shadow-lg" 
        : "border-gray-200 dark:border-gray-800 hover:shadow-lg"
    } p-6`}>
      {/* Source Header with Selection */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSourceSelected}
              onChange={() => toggleSource(source.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {source.displayName || source.name}
            </h3>
            {source.displayName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {source.name}
              </p>
            )}
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            source.active
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {source.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Source Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-medium">Type:</span> {source.type}
        </div>
        <div>
          <span className="font-medium">Language:</span> {source.language}
        </div>
        <div>
          <span className="font-medium">Articles:</span> {source._count?.items || 0}
        </div>
        <div>
          <span className="font-medium">Categories:</span> {sourceCategories.length}
        </div>
      </div>

      {/* Category Tags Selection */}
      {sourceCategories.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categories ({sourceCategories.length})
            </h4>
            {sourceCategories.length > 6 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {showAllTags ? "Show Less" : "Show All"}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {displayedCategories.map((category, index) => {
              const isTagSelected = selectedTags.includes(category);
              return (
                <button
                  key={index}
                  onClick={() => toggleTag(category)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isTagSelected
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {category}
                  {isTagSelected && (
                    <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Source URL */}
      {source.url && (
        <div className="mb-4">
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
          >
            {source.url}
          </a>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Created: {new Date(source.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(source.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
