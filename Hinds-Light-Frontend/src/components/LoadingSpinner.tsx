"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}>
          <div className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
        </div>
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
