"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Closing CTA band — gradient overlay over gray-800, dual CTAs. */
export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gray-800 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-green-600 opacity-80" aria-hidden />
      <div
        className="absolute -bottom-1/2 -left-1/4 h-full w-full rounded-full bg-blue-500/20 opacity-50 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -top-1/2 -right-1/4 h-full w-full rounded-full bg-green-500/20 opacity-50 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          Ready to Transform Your Fitness Journey?
        </h2>
        <p className="mb-8 text-xl text-blue-100 max-w-2xl mx-auto">
          Join thousands of members who have achieved their fitness goals with
          FitnessPro
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/Memberships">
            <Button size="lg" className="bg-white font-semibold text-blue-600 hover:bg-blue-50">
              Start Your Membership
            </Button>
          </Link>
          <Link href="/Shop">
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
            >
              Shop Equipment
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
