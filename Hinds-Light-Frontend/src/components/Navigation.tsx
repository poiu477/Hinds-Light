"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "News Feed", href: "/", icon: "📰" },
  { name: "Sources", href: "/sources", icon: "📡" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
