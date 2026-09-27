/**
 * "Speed line" streak specs, extracted 1:1 from the reference app
 * (https://fit-pro-gym-app-c6cbb3a3.base44.app/) — live DOM classes plus the
 * framer-motion transitions recovered from its JS bundle.
 *
 * Both heroes render 8 full-width animated lines:
 *   - 6 "glow" lines: colored shadow + blur filter, x: 100vw → -100vw,
 *     linear, infinite repeat, staggered tops/durations/delays.
 *   - 2 "solid" lines: via-blue-300 / via-green-300 at opacity-90, no blur,
 *     no shadow.
 *
 * Pinned by src/lib/speed-lines.test.ts — change the reference's mind, not
 * these numbers, without updating the test in the same commit.
 */

export interface SpeedLine {
  /** Full position utility, e.g. "top-[20%]" — kept complete so Tailwind's static scanner sees it. */
  top: string;
  /** Thickness utility: "h-1" or "h-2". */
  height: "h-1" | "h-2";
  /** Full gradient utilities (always from-transparent … to-transparent). */
  gradient: string;
  /** Opacity utility. */
  opacity: string;
  /** Colored glow shadow utility (glow lines only). */
  shadow?: string;
  /** CSS blur() filter value (glow lines only). */
  blur?: string;
  /** framer-motion duration in seconds. */
  duration: number;
  /** framer-motion delay in seconds. */
  delay: number;
}

export const HERO_SPEED_LINES: SpeedLine[] = [
  { top: "top-[20%]", height: "h-1", gradient: "from-transparent via-cyan-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_20px_#22d3ee]", blur: "blur(1px)", duration: 12, delay: 0 },
  { top: "top-[30%]", height: "h-2", gradient: "from-transparent via-blue-500 to-transparent", opacity: "opacity-70", shadow: "shadow-[0_0_30px_#3b82f6]", blur: "blur(1.5px)", duration: 9, delay: 1 },
  { top: "top-[40%]", height: "h-1", gradient: "from-transparent via-yellow-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_25px_#facc15]", blur: "blur(1px)", duration: 15, delay: 0.5 },
  { top: "top-[55%]", height: "h-2", gradient: "from-transparent via-green-400 to-transparent", opacity: "opacity-70", shadow: "shadow-[0_0_35px_#22c55e]", blur: "blur(1.5px)", duration: 11, delay: 2 },
  { top: "top-[65%]", height: "h-1", gradient: "from-transparent via-blue-400 to-transparent", opacity: "opacity-80", shadow: "shadow-[0_0_30px_#60a5fa]", blur: "blur(1px)", duration: 8, delay: 1.5 },
  { top: "top-[80%]", height: "h-1", gradient: "from-transparent via-teal-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_25px_#2dd4bf]", blur: "blur(1px)", duration: 13, delay: 2.5 },
  { top: "top-[30%]", height: "h-2", gradient: "from-transparent via-blue-300 to-transparent", opacity: "opacity-90", duration: 9, delay: 1 },
  { top: "top-[55%]", height: "h-2", gradient: "from-transparent via-green-300 to-transparent", opacity: "opacity-90", duration: 11, delay: 2 },
];

export const MEMBERSHIPS_SPEED_LINES: SpeedLine[] = [
  { top: "top-[15%]", height: "h-1", gradient: "from-transparent via-cyan-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_20px_#22d3ee]", blur: "blur(1px)", duration: 10, delay: 0 },
  { top: "top-[25%]", height: "h-2", gradient: "from-transparent via-blue-500 to-transparent", opacity: "opacity-70", shadow: "shadow-[0_0_30px_#3b82f6]", blur: "blur(1.5px)", duration: 8, delay: 1 },
  { top: "top-[35%]", height: "h-1", gradient: "from-transparent via-yellow-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_25px_#facc15]", blur: "blur(1px)", duration: 12, delay: 0.5 },
  { top: "top-[50%]", height: "h-2", gradient: "from-transparent via-green-400 to-transparent", opacity: "opacity-70", shadow: "shadow-[0_0_35px_#22c55e]", blur: "blur(1.5px)", duration: 9, delay: 2 },
  { top: "top-[60%]", height: "h-1", gradient: "from-transparent via-blue-400 to-transparent", opacity: "opacity-80", shadow: "shadow-[0_0_30px_#60a5fa]", blur: "blur(1px)", duration: 7, delay: 1.5 },
  { top: "top-[75%]", height: "h-1", gradient: "from-transparent via-teal-400 to-transparent", opacity: "opacity-60", shadow: "shadow-[0_0_25px_#2dd4bf]", blur: "blur(1px)", duration: 11, delay: 2.5 },
  { top: "top-[25%]", height: "h-2", gradient: "from-transparent via-blue-300 to-transparent", opacity: "opacity-90", duration: 8, delay: 1 },
  { top: "top-[50%]", height: "h-2", gradient: "from-transparent via-green-300 to-transparent", opacity: "opacity-90", duration: 9, delay: 2 },
];
