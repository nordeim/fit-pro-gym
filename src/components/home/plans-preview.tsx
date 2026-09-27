"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

import type { MembershipDTO } from "@/components/providers";
import { MembershipCard } from "@/components/memberships/membership-card";
import { Button } from "@/components/ui/button";

/**
 * Home "Choose Your Perfect Plan" section. Mirrors the reference: three
 * cards with the POPULAR plan pinned to the middle slot, a promo banner
 * above, and a "View All Plans" CTA below.
 */
export function PlansPreview({ memberships }: { memberships: MembershipDTO[] }) {
  // The reference pins its hardcoded Pro Athlete card to the middle slot;
  // we generalize: [first, popular, second] (falling back to the first three).
  const popular = memberships.find((m) => m.popular);
  let three: MembershipDTO[] = memberships;
  if (memberships.length >= 2 && popular) {
    const rest = memberships.filter((m) => m.id !== popular.id);
    three = [rest[0] ?? popular, popular, rest[1] ?? popular];
  } else if (memberships.length > 3) {
    three = memberships.slice(0, 3);
  }

  return (
    <section className="bg-gray-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-gray-400">
            Unlock your potential with our premium membership options
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
            <Zap className="h-4 w-4" aria-hidden />
            🚀 Limited Time: Save 20% on Annual Plans
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
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
            >
              View All Plans
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
