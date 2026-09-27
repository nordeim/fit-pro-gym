"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

/**
 * Single-slot toast, mirroring the reference app's message strip:
 * success → green-500/20 + green-300, error → red-500/20 + red-300,
 * info → blue-500/20 + blue-300; auto-dismiss handled by AppProvider (3s).
 */
export function Toaster() {
  const { toast } = useApp();
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      role="region"
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4",
        "sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      )}
    >
      {toast ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border-0 px-4 py-3 shadow-lg backdrop-blur-md",
            toast.type === "success" && "bg-green-500/20 text-green-300",
            toast.type === "error" && "bg-red-500/20 text-red-300",
            toast.type === "info" && "bg-blue-500/20 text-blue-300"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <Info className="h-4 w-4 shrink-0" />
          )}
          <p className="text-sm">{toast.text}</p>
        </div>
      ) : null}
    </div>
  );
}
