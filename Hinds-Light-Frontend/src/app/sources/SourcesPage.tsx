"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import { useSources, useCategories } from "@/features/sources/hooks";
import type { Source } from "@/types/api";

export default function SourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showActiveOnly, setShowActiveOnly] = useState(true);

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
              Manage your RSS feeds and filter by categories
            </p>
          </div>

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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sources.map((source) => (
                <SourceCard key={source.id} source={source} />
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
}

function SourceCard({ source }: SourceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
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

      {source.categories && source.categories.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {source.categories.slice(0, 3).map((category, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {category}
              </span>
            ))}
            {source.categories.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                +{source.categories.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <span className="w-16 font-medium">Type:</span>
          <span>{source.type}</span>
        </div>
        <div className="flex items-center">
          <span className="w-16 font-medium">Language:</span>
          <span>{source.language}</span>
        </div>
        {source.url && (
          <div className="flex items-center">
            <span className="w-16 font-medium">URL:</span>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate"
            >
              {source.url}
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Created: {new Date(source.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(source.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
