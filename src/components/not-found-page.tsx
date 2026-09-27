"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { notFoundPageName } from "@/lib/not-found-name";

/**
 * The reference's branded 404 — extracted from its live DOM:
 * a light slate-50 canvas (no app chrome), the giant pale 404, a divider,
 * "Page Not Found", the message quoting the missing page name, and a
 * "Go Home" button (the reference hardcodes the classic home-icon path).
 */
export function NotFoundPage({ pageName }: { pageName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const name = pageName ?? notFoundPageName(pathname ?? "/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="mx-auto h-0.5 w-16 bg-slate-200" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <p className="leading-relaxed text-slate-600">
              The page <span className="font-medium text-slate-700">&quot;{name}&quot;</span>{" "}
              could not be found in this application.
            </p>
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={() => router.push("/Home")}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
