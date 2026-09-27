"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Hero — mirrored from the reference: full-bleed dark section with animated
 * "speed line" streaks (framer-motion, 6 gradients at staggered top offsets),
 * gradient "Ultimate" headline, dual CTAs, tri-color stats, and the
 * gradient-framed hero image with glow blobs.
 */
export function Hero() {
  const reduced = useReducedMotion();

  const lines = [
    { top: "20%", h: "h-1", gradient: "from-transparent via-cyan-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_20px_#22d3ee]", blur: "blur(1px)", duration: 12, delay: 0 },
    { top: "30%", h: "h-2", gradient: "from-transparent via-blue-500 to-transparent", opacity: "opacity-70", shadow: "shadow-[0_0_30px_#3b82f6]", blur: "blur(1.5px)", duration: 9, delay: 1 },
    { top: "40%", h: "h-1", gradient: "from-transparent via-yellow-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_25px_#facc15]", blur: "blur(1px)", duration: 15, delay: 0.5 },
    { top: "55%", h: "h-2", gradient: "from-transparent via-green-400 to-transparent", opacity: "opacity-70", shadow: "shadow-[0_0_35px_#22c55e]", blur: "blur(1.5px)", duration: 11, delay: 2 },
    { top: "65%", h: "h-1", gradient: "from-transparent via-blue-400 to-transparent", opacity: "opacity-80", shadow: "shadow-[0_0_30px_#60a5fa]", blur: "blur(1px)", duration: 8, delay: 1.5 },
    { top: "80%", h: "h-1", gradient: "from-transparent via-teal-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_25px_#2dd4bf]", blur: "blur(1px)", duration: 13, delay: 2.5 },
  ];

  return (
    <section className="relative overflow-hidden py-24 text-white md:py-32">
      {/* Animated speed lines */}
      {lines.map((line, i) => (
        <motion.div
          key={i}
          aria-hidden
          className={`absolute ${line.top} ${line.h} w-full bg-gradient-to-r ${line.gradient} ${line.opacity} ${line.shadow}`}
          style={{ filter: line.blur }}
          initial={reduced ? undefined : { x: "100vw" }}
          animate={reduced ? undefined : { x: "-100vw" }}
          transition={{ duration: line.duration, delay: line.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Unleash Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  {" "}
                  Ultimate{" "}
                </span>
                Potential
              </h1>
              <p className="text-xl leading-relaxed text-gray-300 md:text-2xl">
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
