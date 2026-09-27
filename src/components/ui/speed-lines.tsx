"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { SpeedLine } from "@/lib/speed-lines";
import { cn } from "@/lib/utils";

/**
 * Renders the reference app's animated "speed line" streaks: full-width
 * framer-motion divs sliding from 100vw to -100vw, linear, infinitely.
 * `prefers-reduced-motion` freezes the lines off-screen (the reference
 * degrades the same way — no motion, no streaks).
 */
export function SpeedLines({ lines, className }: { lines: SpeedLine[]; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <>
      {lines.map((line, i) => (
        <motion.div
          key={`${line.top}-${i}`}
          aria-hidden
          className={cn(
            `${line.top} ${line.height} w-full bg-gradient-to-r ${line.gradient} ${line.opacity}`,
            line.shadow,
            className
          )}
          style={line.blur ? { filter: line.blur } : undefined}
          initial={reduced ? { x: "200vw" } : { x: "100vw" }}
          animate={reduced ? { x: "200vw" } : { x: "-100vw" }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: line.duration, delay: line.delay, repeat: Infinity, ease: "linear" }
          }
        />
      ))}
    </>
  );
}
