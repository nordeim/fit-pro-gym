"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";

import type { ProductDTO } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

/**
 * Home "Professional Fitness Gear" preview — the reference's hover-reveal
 * card: full-bleed image with a bottom gradient scrim, the title lifts on
 * hover while the category + price fade in, and the "Shop Now" button
 * slides up into place.
 */
export function ShopPreview({ products }: { products: ProductDTO[] }) {
  const four = products.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-black py-20">
      {/* Corner glow blobs (reference: purple top-left, teal bottom-right) */}
      <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-slate-800 px-4 py-2">
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-sm font-semibold text-transparent">
              ⚡ PREMIUM COLLECTION
            </span>
          </div>
          <h2 className="mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            Professional Fitness Gear
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-400">
            Discover our handpicked selection of premium equipment and supplements,
            trusted by professional athletes and fitness enthusiasts worldwide.
          </p>
        </div>

        {/* SESSION-6 PARITY FIX (S6-R5): the reference's preview grid is
            gap-8 with NO pb-4 (extracted: grid grid-cols-1 sm:grid-cols-2
            lg:grid-cols-4 gap-8) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {four.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-800/50"
                >
                  <Skeleton className="absolute inset-0 rounded-none bg-slate-700/60" />
                </div>
              ))
            : four.map((product, index) => (
                <ProductRevealCard key={product.id} product={product} index={index} />
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Link href="/Shop">
            <Button
              size="lg"
              className="rounded-xl bg-gradient-to-r from-slate-200 to-slate-100 px-8 py-4 font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:from-slate-100 hover:to-slate-50 hover:shadow-xl"
            >
              Explore Full Collection
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ProductRevealCard({ product, index }: { product: ProductDTO; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20"
    >
      {/* Full-bleed image */}
      <img
        src={product.imageUrl || FALLBACK_IMAGE}
        alt={product.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
      />
      {/* Bottom scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-all duration-500 group-hover:from-black/90 group-hover:via-black/50" aria-hidden />

      <div className="relative flex h-full flex-col justify-end p-6 text-white">
        <h3 className="mb-2 text-2xl font-bold transition-transform duration-300 ease-out group-hover:-translate-y-20">
          {product.name}
        </h3>
        <div className="max-h-0 -translate-y-8 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:-translate-y-8 group-hover:max-h-40 group-hover:opacity-100">
          <div className="mb-3 inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium capitalize text-white">
            {product.category}
          </div>
          <p className="mb-4 text-4xl font-extrabold">${product.price}</p>
        </div>
        <Link
          href="/Shop"
          className="translate-y-20 transition-all duration-300 ease-out group-hover:translate-y-0"
        >
          <Button className="h-9 w-full bg-white/90 font-semibold text-black hover:bg-white">
            Shop Now
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export function ShopPreviewEmpty() {
  return (
    <div className="py-12 text-center">
      <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-500" aria-hidden />
      <p className="text-gray-400">No products available at the moment.</p>
    </div>
  );
}
