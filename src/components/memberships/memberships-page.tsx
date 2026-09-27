"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, ShoppingCart, Star } from "lucide-react";

import {
  useApp,
  type MembershipDTO,
  type ProductDTO,
} from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { planColors } from "@/components/memberships/membership-card";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";

/** Horizontal-rail membership card (the reference's Memberships page card). */
function PlanRailCard({
  plan,
  index,
  onChoose,
  busy,
}: {
  plan: MembershipDTO;
  index: number;
  onChoose: (plan: MembershipDTO) => void;
  busy: boolean;
}) {
  const colors = planColors(plan.colorScheme);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative w-full flex-shrink-0 rounded-3xl border bg-slate-800/30 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-slate-800/50 hover:shadow-2xl sm:w-[320px]",
        plan.popular
          ? "border-blue-500/50 shadow-xl ring-2 ring-blue-500/20"
          : "border-slate-700/50"
      )}
    >
      {plan.popular ? (
        <Badge className="absolute top-6 right-6 rounded-full border-0 bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          <Star className="mr-1 h-4 w-4" aria-hidden />
          Most Popular
        </Badge>
      ) : null}

      <div className="mb-8 text-center">
        <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
        <div className="mb-4">
          <span className="text-5xl font-bold text-white">${plan.price}</span>
          <span className="ml-2 text-lg text-gray-400">/month</span>
        </div>
        <p className="text-sm leading-relaxed text-gray-400">{plan.description}</p>
      </div>

      <div className="mb-8 space-y-4">
        {plan.features?.map((feature) => (
          <div key={feature} className="flex items-start space-x-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-400" aria-hidden />
            <span className="text-sm text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => onChoose(plan)}
        disabled={busy}
        className={cn(
          "w-full bg-gradient-to-r py-3 font-semibold text-white transition-all duration-300",
          colors.gradient,
          "hover:shadow-lg hover:shadow-blue-500/25"
        )}
      >
        Choose {plan.name}
      </Button>
    </motion.div>
  );
}

/** Cross-sell card (the reference's L3) used inside the "Complete Your Setup" dialog. */
function CrossSellCard({
  product,
  onAdd,
}: {
  product: ProductDTO;
  onAdd: (name: string) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const { user, refreshCart, showToast } = useApp();
  const router = useRouter();

  const add = async () => {
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
      if (!res.ok) throw new Error("add failed");
      const data = (await res.json()) as { message?: string };
      await refreshCart();
      showToast("success", data.message ?? "Product added to cart!");
      onAdd(product.name);
    } catch {
      showToast("error", "Error adding to cart. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-white shadow-md backdrop-blur-lg transition-all duration-300 hover:border-white/20">
      <div className="relative aspect-square overflow-hidden bg-gray-900/50">
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:scale-105 group-hover:opacity-100"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xl font-bold">${product.price}</span>
          <Button
            size="icon"
            onClick={add}
            disabled={busy}
            aria-label={`Add ${product.name} to cart`}
            className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600"
          >
            {busy ? "…" : <ShoppingCart className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Memberships page: gradient hero, horizontally-scrolling plan rail sorted
 * by price, "Choose" → add to cart (deduped) → cross-sell dialog.
 */
export function MembershipsPage() {
  const { user, refreshCart, showToast } = useApp();
  const router = useRouter();
  const [plans, setPlans] = React.useState<MembershipDTO[] | null>(null);
  const [crossSell, setCrossSell] = React.useState<ProductDTO[]>([]);
  const [busyPlanId, setBusyPlanId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [plansRes, productsRes] = await Promise.all([
          fetch("/api/memberships", { cache: "no-store" }),
          fetch("/api/products?featured=true&limit=3", { cache: "no-store" }),
        ]);
        const plansData = (await plansRes.json()) as MembershipDTO[];
        const productsData = (await productsRes.json()) as ProductDTO[];
        if (!cancelled) {
          setPlans(Array.isArray(plansData) ? plansData : []);
          setCrossSell(Array.isArray(productsData) ? productsData.slice(0, 3) : []);
        }
      } catch {
        if (!cancelled) {
          setPlans([]);
          setCrossSell([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = React.useMemo(
    () => (plans ? [...plans].sort((a, b) => a.price - b.price) : []),
    [plans]
  );

  const choosePlan = async (plan: MembershipDTO) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusyPlanId(plan.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "membership",
          itemId: plan.id,
          itemName: plan.name,
          price: plan.price,
          quantity: 1,
          imageUrl: null,
        }),
      });
      const data = (await res.json()) as { message?: string; duplicated?: boolean };
      if (!res.ok) throw new Error("add failed");
      await refreshCart();
      if (data.duplicated) {
        showToast("info", "Membership already in your cart!");
      } else {
        showToast("success", "Membership added to cart!");
        setDialogOpen(true);
      }
    } catch {
      showToast("error", "Error adding to cart. Please try again.");
    } finally {
      setBusyPlanId(null);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-900">
      {/* Page hero with speed lines */}
      <section className="relative overflow-hidden py-20 text-center text-white md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" aria-hidden />
        <motion.div
          aria-hidden
          className="absolute top-[30%] h-2 w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-90"
          initial={{ x: "100vw" }}
          animate={{ x: "-100vw" }}
          transition={{ duration: 9, delay: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-[55%] h-2 w-full bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-90"
          initial={{ x: "100vw" }}
          animate={{ x: "-100vw" }}
          transition={{ duration: 11, delay: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent md:text-6xl"
          >
            Choose Your Path to Greatness
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-gray-300 md:text-xl"
          >
            Find the perfect plan that aligns with your fitness goals. Each
            membership is a step towards a stronger, healthier you.
          </motion.p>
        </div>
      </section>

      {/* Plan rail */}
      <section className="bg-gray-900 pt-0 pb-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {plans === null ? (
            <div className="-mx-4 flex space-x-8 overflow-x-auto px-4 pb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full flex-shrink-0 space-y-6 rounded-3xl border border-slate-700/50 bg-slate-800/30 p-8 sm:w-[320px]"
                >
                  <Skeleton className="h-8 w-3/4 bg-slate-700" />
                  <Skeleton className="h-12 w-1/2 bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full bg-slate-700" />
                    <Skeleton className="h-4 w-full bg-slate-700" />
                    <Skeleton className="h-4 w-5/6 bg-slate-700" />
                  </div>
                  <Skeleton className="h-12 w-full bg-slate-700" />
                </div>
              ))}
            </div>
          ) : (
            <div className="scrollbar-hidden -mx-4 flex space-x-8 overflow-x-auto px-4 pb-8">
              {sorted.map((plan, index) => (
                <PlanRailCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  onChoose={choosePlan}
                  busy={busyPlanId === plan.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cross-sell dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {crossSell.length > 0 ? (
          <DialogContent className="rounded-3xl border-2 border-white/10 bg-gray-900/80 text-white shadow-2xl backdrop-blur-2xl sm:max-w-3xl">
            <DialogHeader className="pt-4 text-center">
              <DialogTitle className="text-3xl font-bold">
                Complete Your Setup
              </DialogTitle>
              <DialogDescription className="pt-2 text-gray-300">
                Members who bought this plan also love these items.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
              {crossSell.map((product) => (
                <CrossSellCard
                  key={product.id}
                  product={product}
                  onAdd={() => setDialogOpen(false)}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 pb-4">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="hover:bg-white/10 hover:text-white"
              >
                No, Thanks
              </Button>
              <Link href="/Cart">
                <Button className="font-semibold text-white" onClick={() => setDialogOpen(false)}>
                  <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
                  Go to Cart
                </Button>
              </Link>
              <Link href="/Shop">
                <Button
                  className="bg-blue-600 font-semibold hover:bg-blue-700"
                  onClick={() => setDialogOpen(false)}
                >
                  Explore Full Store
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
