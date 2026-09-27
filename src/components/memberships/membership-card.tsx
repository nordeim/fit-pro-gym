"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { MembershipDTO } from "@/components/providers";
import { cn } from "@/lib/utils";

/** Color schemes, mapped 1:1 from the reference's Px table. */
export const PLAN_COLORS = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  green: {
    gradient: "from-green-500 to-green-600",
    shadow: "shadow-green-500/20",
    button: "bg-green-600 hover:bg-green-700",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/20",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  orange: {
    gradient: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/20",
    button: "bg-orange-600 hover:bg-orange-700",
  },
} as const;

export type PlanColor = keyof typeof PLAN_COLORS;

export function planColors(scheme: string): (typeof PLAN_COLORS)[PlanColor] {
  return PLAN_COLORS[scheme as PlanColor] ?? PLAN_COLORS.blue;
}

/**
 * Home-page membership card (the reference's Y4): glass card with cursor
 * spotlight, hover lift, popular badge, gradient price, feature checklist.
 * Informational only — the CTA lives on the Memberships page.
 */
export function MembershipCard({
  membership,
  index,
}: {
  membership: MembershipDTO;
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [hovered, setHovered] = React.useState(false);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -12, transition: { duration: 0.3, ease: "easeOut" } }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-300",
        "bg-slate-800/70 backdrop-blur-xl",
        membership.popular ? "border-blue-500/50 shadow-xl" : "border-slate-700/50"
      )}
      style={{
        boxShadow: hovered
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(255, 255, 255, 0.03) 0%, transparent 50%)`,
        }}
      />

      {membership.popular ? (
        <Badge className="absolute top-6 right-6 rounded-full border-0 bg-blue-500/90 px-3 py-1.5 font-medium text-white shadow-lg backdrop-blur-sm">
          <Star className="mr-1 h-3.5 w-3.5" aria-hidden />
          Most Popular
        </Badge>
      ) : null}

      <div className="relative z-10 flex-grow">
        <h3 className="mb-3 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-blue-100">
          {membership.name}
        </h3>
        <div className="mb-6">
          <span className="inline-block text-5xl font-bold text-white transition-transform duration-300 group-hover:scale-105">
            ${membership.price}
          </span>
          <span className="ml-2 text-lg font-medium text-gray-400">/mo</span>
        </div>
        <p className="mb-8 min-h-[40px] text-sm leading-relaxed text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
          {membership.description || "Premium membership with exclusive benefits"}
        </p>
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        <ul className="mb-8 space-y-3">
          {(membership.features ?? []).map((feature, i) => (
            <li
              key={feature}
              className="group flex items-start space-x-3 transition-transform duration-300 hover:translate-x-1"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              <span className="text-sm text-gray-300 transition-colors duration-300 group-hover:text-white">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
