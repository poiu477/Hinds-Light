"use client";

import React from "react";

interface Article {
  id: string;
  source: string;
  originalLanguage: string;
  originalText: string;
  translatedText: string;
  url?: string;
  publishedAt?: string;
}

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <article className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-gray-900/50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {article.source}
            </span>
            {article.publishedAt && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <time className="text-sm text-gray-500 dark:text-gray-500">
                  {formatDate(article.publishedAt)}
                </time>
              </>
            )}
          </div>
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span>View Source</span>
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Original Text */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                Hebrew
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-[system-ui] dir-rtl text-right">
              {article.originalText}
            </p>
          </div>

          {/* Translation */}
          <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                English
              </span>
            </div>
            <p className="text-base leading-relaxed text-gray-900 dark:text-white font-medium">
              {article.translatedText}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
