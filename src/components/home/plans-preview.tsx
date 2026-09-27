"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import type { MembershipDTO } from "@/components/providers";
import { MembershipCard } from "@/components/memberships/membership-card";
import { Button } from "@/components/ui/button";
import { homePlanSlots } from "@/lib/home-featured-plan";

/**
 * Home "Choose Your Perfect Plan" section. Mirrors the reference: its query
 * is Membership.list("-created_date", 3) and its bundle then renders
 * [newest, HARDCODED-Pro, second-newest] — the middle card is a hardcoded
 * Pro Athlete (five design features, "Premium equipment access"), NOT the
 * entity's row; the third fetched entity is never shown. The "Most
 * Popular" badge rides the hardcoded card's own flag.
 * See src/lib/home-featured-plan.ts (pinned by unit tests + e2e specs).
 */
export function PlansPreview({ memberships }: { memberships: MembershipDTO[] }) {
  const three: MembershipDTO[] = homePlanSlots(memberships);

  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Choose Your Perfect Plan
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
            Unlock your potential with our premium membership options
          </p>
          <div className="text-center">
            <span className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-green-500 px-6 py-2 text-sm font-medium text-white">
              🚀 Limited Time: Save 20% on Annual Plans
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
          {three.map((membership, index) => (
            <MembershipCard key={membership.id} membership={membership} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Link href="/Memberships">
            {/* S7-R11: the reference renders this CTA as a SOLID blue,
                default-size button (text-sm font-semibold, h-10, px-6,
                shadow, ArrowRight w-4 h-4) — not a gradient size="lg"
                pill. Classes extracted from its DOM. */}
            <Button className="h-10 rounded-md bg-blue-600 px-6 font-semibold text-primary-foreground shadow hover:bg-blue-700">
              View All Plans
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
