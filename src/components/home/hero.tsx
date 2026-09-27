"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SpeedLines } from "@/components/ui/speed-lines";
import { HERO_SPEED_LINES } from "@/lib/speed-lines";

/**
 * Hero — mirrored from the reference: full-bleed gradient section
 * (from-gray-900 via-gray-800 to-gray-900) with a black scrim and a
 * blue→green tint, 8 animated "speed line" streaks (framer-motion),
 * gradient "Ultimate" headline, dual CTAs, tri-color stats, and the
 * gradient-framed hero image with glow blobs.
 */
export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden text-white">
      {/* Scrim + brand tint under the streaks (reference layer order) */}
      <div className="absolute inset-0 bg-black opacity-50" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20" aria-hidden />

      {/* Animated speed lines (8 — pinned by src/lib/speed-lines.test.ts) */}
      <SpeedLines lines={HERO_SPEED_LINES} />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight md:text-6xl md:leading-none">
                Unleash Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  {" "}
                  Ultimate{" "}
                </span>
                Potential
              </h1>
              {/* S7-R2: the reference's v3 stylesheet emits its responsive
                  text-size rules after the base leading-* utilities, so
                  md:text-2xl's bundled 2rem line-height beats leading-relaxed
                  on desktop — pinned explicitly (v4's --tw-leading mechanism
                  would otherwise reverse that precedence). */}
              <p className="text-xl leading-relaxed text-gray-300 md:text-2xl md:leading-[2rem]">
                Premium fitness experience with state-of-the-art equipment, expert
                trainers, and a community that drives results.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/Memberships">
                <Button size="lg" className="bg-blue-600 px-8 py-4 text-lg hover:bg-blue-700">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/20 px-8 py-4 text-lg text-white backdrop-blur-sm hover:bg-white hover:text-gray-900"
              >
                <Play className="mr-2 h-5 w-5" aria-hidden />
                Watch Tour
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">5000+</div>
                <div className="text-sm text-gray-400">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">24/7</div>
                <div className="text-sm text-gray-400">Access</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">50+</div>
                <div className="text-sm text-gray-400">Expert Trainers</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-green-500/20 p-8 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Modern gym interior"
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-green-500 opacity-80 blur-xl" aria-hidden />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-r from-green-500 to-blue-500 opacity-60 blur-xl" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
