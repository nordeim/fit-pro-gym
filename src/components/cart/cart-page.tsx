"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useApp, type CartItemDTO } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cartTotal } from "@/lib/utils";

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

/** One cart line — image/fallback tile, qty stepper, line total, remove. */
function CartItemRow({
  item,
  updating,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItemDTO;
  updating: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden border border-white/10 bg-white/10 backdrop-blur-sm transition-colors hover:border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-700 to-gray-800">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.itemName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-green-500">
                <span className="text-sm font-semibold text-white">
                  {item.itemName[0]}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-white">{item.itemName}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/20 text-gray-300 capitalize"
              >
                {item.itemType}
              </Badge>
              <span className="text-lg font-bold text-white">${item.price}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              aria-label={`Decrease ${item.itemName} quantity`}
              className="h-8 w-8 rounded-md bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <Minus className="h-3 w-3" aria-hidden />
            </Button>
            <span className="w-8 text-center font-medium text-white">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={updating}
              aria-label={`Increase ${item.itemName} quantity`}
              className="h-8 w-8 rounded-md bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <Plus className="h-3 w-3" aria-hidden />
            </Button>
          </div>

          <div className="text-right">
            <div className="font-semibold text-white">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              disabled={updating}
              aria-label={`Remove ${item.itemName} from cart`}
              className="mt-1 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Shipping-address checkout form (street/city/state/zip → POST /api/orders). */
function CheckoutForm({
  total,
  isProcessing,
  onCheckout,
}: {
  total: number;
  isProcessing: boolean;
  onCheckout: (address: ShippingAddress) => void;
}) {
  const [address, setAddress] = React.useState<ShippingAddress>({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const set = (field: keyof ShippingAddress, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  const valid = Object.values(address).every((v) => v.trim() !== "");

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CreditCard className="h-5 w-5" aria-hidden />
          Checkout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCheckout(address);
          }}
          className="space-y-4"
        >
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Shipping Address</h3>

            <div>
              <Label htmlFor="street" className="text-gray-300">
                Street Address
              </Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) => set("street", e.target.value)}
                placeholder="123 Main Street"
                required
                autoComplete="street-address"
                className="border-white/20 bg-white/10 text-white placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city" className="text-gray-300">
                  City
                </Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="New York"
                  required
                  autoComplete="address-level2"
                  className="border-white/20 bg-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-gray-300">
                  State
                </Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="NY"
                  required
                  autoComplete="address-level1"
                  className="border-white/20 bg-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="zip" className="text-gray-300">
                ZIP Code
              </Label>
              <Input
                id="zip"
                value={address.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="10001"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                className="border-white/20 bg-white/10 text-white placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing || !valid}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 py-6 text-lg font-semibold text-white hover:from-blue-700 hover:to-green-700"
          >
            {isProcessing
              ? "Processing Order..."
              : `Complete Order - $${total.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Cart page: gradient canvas, animated heading, alert strip, item rail +
 * summary + checkout (the reference's JB layout).
 */
export function CartPage() {
  const router = useRouter();
  const { user, userLoading, refreshCart, showToast } = useApp();
  const [items, setItems] = React.useState<CartItemDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<Record<string, boolean>>({});
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userLoading && !user) {
        router.push("/login");
        return;
      }
      if (!user) return;
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) throw new Error("cart fetch failed");
        const data = (await res.json()) as CartItemDTO[];
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, userLoading, router]);

  const total = cartTotal(items);

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("update failed");
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
      await refreshCart();
      showToast("success", "Quantity updated in cart!");
    } catch {
      showToast("error", "Error updating quantity");
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const removeItem = async (id: string) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("remove failed");
      setItems((prev) => prev.filter((i) => i.id !== id));
      await refreshCart();
      showToast("success", "Item removed from cart");
    } catch {
      showToast("error", "Error removing item");
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const checkout = async (address: ShippingAddress) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: address }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "order failed");
      }
      setItems([]);
      await refreshCart();
      showToast(
        "success",
        "Order placed successfully! You will receive a confirmation email shortly."
      );
      setTimeout(() => router.push("/Home"), 3000);
    } catch {
      showToast("error", "Error placing order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-green-900/10"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Button>
          <h1 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            Your Cart
          </h1>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border border-white/10 bg-white/5 p-12 text-center backdrop-blur-lg">
              <CardContent>
                <ShoppingBag
                  className="mx-auto mb-4 h-16 w-16 text-gray-400"
                  aria-hidden
                />
                <h2 className="mb-2 text-2xl font-semibold text-white">
                  Your cart is empty
                </h2>
                <p className="mb-6 text-gray-400">
                  Start shopping to add items to your cart
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/Memberships">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse Memberships
                    </Button>
                  </Link>
                  <Link href="/Shop">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Shop Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Items rail */}
            <div className="space-y-4 lg:col-span-2">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ShoppingBag className="h-5 w-5" aria-hidden />
                    Cart Items ({items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <CartItemRow
                        item={item}
                        updating={updating[item.id] ?? false}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Summary + checkout */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border border-white/10 bg-white/5 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Shipping</span>
                        <span className="text-green-400">Free</span>
                      </div>
                      <div className="h-px bg-white/10" aria-hidden />
                      <div className="flex justify-between text-lg font-semibold text-white">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CheckoutForm
                  total={total}
                  isProcessing={processing}
                  onCheckout={checkout}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
