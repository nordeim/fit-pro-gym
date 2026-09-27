"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, Star, ThumbsUp, Trophy } from "lucide-react";

const STATS = [
  { icon: ThumbsUp, value: "5,000+", label: "Happy Members", color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500/30" },
  { icon: Trophy, value: "10+", label: "Years Experience", color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/30" },
  { icon: Clock, value: "24/7", label: "Gym Access", color: "text-yellow-400", bgColor: "bg-yellow-500/20", borderColor: "border-yellow-500/30" },
  { icon: Star, value: "4.9", label: "Average Rating", color: "text-purple-400", bgColor: "bg-purple-500/20", borderColor: "border-purple-500/30" },
] as const;

/**
 * "Why Choose FitnessPro?" — four stat cards with the reference's cursor
 * spotlight (a radial-gradient that follows the mouse inside each card).
 */
export function WhyChoose() {
  return (
    <section className="bg-gray-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Why Choose FitnessPro?
          </h2>
          <p className="text-lg text-gray-400">
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl border bg-slate-800/50 p-6 text-center backdrop-blur-sm"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: pos.x ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(255, 255, 255, 0.05) 0%, transparent 60%)`,
        }}
      />
      <div
        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} ${stat.borderColor} border`}
      >
        <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden />
      </div>
      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
      <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
    </motion.div>
  );
}
