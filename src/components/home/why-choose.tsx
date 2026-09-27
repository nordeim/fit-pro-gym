"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Award, Star, Users, Zap } from "lucide-react";

/**
 * Stats, mirrored from the reference: values, labels, colors, and icons
 * (users / award / zap / star — w-8 h-8 inside w-16 h-16 boxes).
 */
const STATS = [
  { icon: Users, value: "5,000+", label: "Happy Members", color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500/30" },
  { icon: Award, value: "10+", label: "Years Experience", color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/30" },
  { icon: Zap, value: "24/7", label: "Gym Access", color: "text-yellow-400", bgColor: "bg-yellow-500/20", borderColor: "border-yellow-500/30" },
  { icon: Star, value: "4.9", label: "Average Rating", color: "text-purple-400", bgColor: "bg-purple-500/20", borderColor: "border-purple-500/30" },
] as const;

/**
 * "Why Choose FitnessPro?" — glass stat cards over a gradient section with
 * a brand tint and two glow blobs. Each card carries the reference's cursor
 * spotlight (-inset-px, 400px radius) plus a from-white/5 inner overlay, and
 * the value scales in (0.8 → 1) on scroll-into-view.
 */
export function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
      {/* Brand tint + corner glow blobs */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10" aria-hidden />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-500/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            Why Choose FitnessPro?
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Join thousands of satisfied members in our premium fitness community
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <SpotlightCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpotlightCard({
  stat,
  index,
}: {
  stat: (typeof STATS)[number];
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-2xl border ${stat.borderColor} bg-white/5 p-8 text-center shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-105`}
    >
      {/* Cursor spotlight (reference: -inset-px, 400px radius, white 0.15) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: pos.x ? 1 : 0,
          background: `radial-gradient(400px at ${pos.x}px ${pos.y}px, rgba(255, 255, 255, 0.15), transparent 80%)`,
        }}
      />
      {/* Inner sheen */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" aria-hidden />

      <div className="relative z-10">
        <div
          className={`relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${stat.borderColor} ${stat.bgColor} backdrop-blur-sm transition-transform duration-300 group-hover:scale-110`}
        >
          <stat.icon className={`h-8 w-8 ${stat.color}`} aria-hidden />
        </div>
        <motion.p
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          className="mb-2 text-4xl font-bold text-white"
        >
          {stat.value}
        </motion.p>
        <p className="font-medium text-gray-300">{stat.label}</p>
      </div>
    </motion.div>
  );
}
