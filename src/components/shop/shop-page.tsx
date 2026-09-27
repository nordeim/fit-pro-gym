"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShoppingCart } from "lucide-react";

import { useApp, type ProductDTO } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryMatches, SHOP_CATEGORIES } from "@/lib/shop-categories";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

type SortKey = "name" | "price-low" | "price-high";

/**
 * Shop product card — pixel-matched to the reference's grid card:
 * bg-slate-800, rounded-2xl, hover glow, category badge, blue round
 * add-to-cart button.
 */
export function ProductCard({
  product,
  index,
}: {
  product: ProductDTO;
  index: number;
}) {
  const { user, refreshCart, showToast } = useApp();
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const addToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "product",
          itemId: product.id,
          itemName: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error("add failed");
      await refreshCart();
      showToast("success", data.message ?? "Product added to cart!");
    } catch {
      showToast("error", "Error adding to cart. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 text-card-foreground shadow-sm transition-all duration-300 hover:border-slate-600 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-900">
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-between p-4 flex-grow">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className="border-slate-600 px-2.5 font-semibold text-gray-300 capitalize"
          >
            {product.category}
          </Badge>
          <h3 className="line-clamp-2 text-lg font-semibold text-white">
            {product.name}
          </h3>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-white">${product.price}</span>
          <Button
            size="icon"
            onClick={addToCart}
            disabled={busy}
            aria-label={`Add ${product.name} to cart`}
            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            {busy ? "…" : <ShoppingCart className="h-5 w-5" aria-hidden />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Shop page: "Premium Fitness Store" header, search box, category filter,
 * sort select, and the responsive product grid (client-side filtering of
 * the server-provided catalog — same UX as the reference).
 */
export function ShopPage({ products }: { products: ProductDTO[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState<SortKey>("name");
  const [loading] = React.useState(false);

  const categories = React.useMemo(
    () => ["all", ...SHOP_CATEGORIES] as const,
    []
  );

  const visible = React.useMemo(() => {
    let list = products.filter((p) => {
      const matchesQuery = p.name
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesCategory = categoryMatches(p.category, category);
      return matchesQuery && matchesCategory;
    });
    switch (sort) {
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
    }
    return list;
  }, [products, query, category, sort]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Premium Fitness Store</h1>
          <p className="text-lg text-gray-400">
            Discover professional-grade equipment, premium supplements, and
            accessories to elevate your fitness journey.
          </p>
        </div>

        {/* Filters — sticky toolbar card under the header (reference parity) */}
        <div className="sticky top-20 z-40 mb-8 rounded-2xl border border-slate-700 bg-slate-800/80 p-4 backdrop-blur-sm">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search
                className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by name..."
                aria-label="Search products by name"
                className="h-9 border-slate-600 bg-slate-700 pl-10 text-white placeholder:text-gray-400 focus:border-slate-500"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                aria-label="Filter by category"
                className="h-9 w-full border-slate-600 bg-slate-700 text-white"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-white">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger
                aria-label="Sort products"
                className="h-9 w-full border-slate-600 bg-slate-700 text-white"
              >
                <SelectValue placeholder="Name (A-Z)" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-white">
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800"
              >
                <Skeleton className="aspect-square w-full rounded-none bg-slate-700" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-4 w-1/3 bg-slate-700" />
                  <Skeleton className="h-5 w-3/4 bg-slate-700" />
                  <Skeleton className="h-8 w-1/2 bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          // SESSION-6 PARITY FIX (S6-R2): the reference renders a single
          // centered paragraph — no icon, no heading (extracted from its DOM:
          // <div class="text-center py-24"><p class="text-gray-400 text-lg">
          // No products found matching your criteria.</p></div>)
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">
              No products found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
