"use client";

import React from "react";
import Navigation from "./Navigation";

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({ onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">HL</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hinds Light
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hebrew News Translation
              </p>
            </div>
          </div>
        </div>

        {/* Navigation in the center */}
        <div className="flex-1 flex justify-center">
          <Navigation />
        </div>
        
        <div className="flex items-center space-x-4">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              <svg 
                className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
