"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Zap } from "lucide-react";

import type { ProductDTO } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

/**
 * Home "Professional Fitness Gear" preview — the reference's hover-reveal
 * card: the title lifts on hover, the category + price fade in, and the
 * "Shop Now" button slides up into place.
 */
export function ShopPreview({ products }: { products: ProductDTO[] }) {
  const four = products.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-slate-900 py-20">
      <div className="absolute inset-0 bg-black opacity-40" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-yellow-300">
            <Zap className="h-3.5 w-3.5" aria-hidden />
            ⚡ PREMIUM COLLECTION
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Professional Fitness Gear
          </h2>
          <p className="mx-auto mb-2 max-w-3xl text-gray-300">
            Discover our handpicked selection of premium equipment and supplements,
            trusted by professional athletes and fitness enthusiasts worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 pb-4 sm:grid-cols-2 lg:grid-cols-4">
          {four.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50"
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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-700 bg-slate-800"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-900">
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="relative flex h-full flex-col p-4">
        <h3 className="mb-2 text-2xl font-bold text-white transition-transform duration-300 ease-out group-hover:-translate-y-20">
          {product.name}
        </h3>
        <div className="max-h-0 -translate-y-8 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:-translate-y-8 group-hover:max-h-40 group-hover:opacity-100">
          <span className="mb-3 inline-flex items-center rounded-md border border-slate-600 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-300">
            {product.category}
          </span>
          <p className="mb-4 text-4xl font-extrabold text-white">${product.price}</p>
        </div>
        <Link
          href="/Shop"
          className="absolute bottom-4 left-4 right-4 translate-y-20 transition-all duration-300 ease-out group-hover:translate-y-0"
        >
          <Button className="w-full bg-white/90 font-semibold text-black hover:bg-white">
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
