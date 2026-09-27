/**
 * DB row → API DTO serialization. The SQLite layer stores JSON-shaped
 * fields as strings (features, order items, shipping address); the API
 * boundary converts them back to the reference app's shapes.
 */

import type { MembershipPlan, Product, CartItem, Order, User } from "@prisma/client";

export interface MembershipApiDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMonths: number;
  features: string[];
  popular: boolean;
  colorScheme: string;
}

export interface ProductApiDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  stockQuantity: number;
  featured: boolean;
}

export interface CartItemApiDTO {
  id: string;
  userEmail: string;
  itemType: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface OrderApiDTO {
  id: string;
  userEmail: string;
  totalAmount: number;
  items: Array<{ name: string; type: string; price: number; quantity: number }>;
  shippingAddress: { street: string; city: string; state: string; zip: string };
  status: string;
  createdAt: Date;
}

export interface UserApiDTO {
  id: string;
  email: string;
  name: string;
}

export function parseFeatures(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((f) => typeof f === "string") : [];
  } catch {
    return [];
  }
}

export function serializeMembership(plan: MembershipPlan): MembershipApiDTO {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    durationMonths: plan.durationMonths,
    features: parseFeatures(plan.features),
    popular: plan.popular,
    colorScheme: plan.colorScheme,
  };
}

export function serializeProduct(product: Product): ProductApiDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    stockQuantity: product.stockQuantity,
    featured: product.featured,
  };
}

export function serializeCartItem(item: CartItem): CartItemApiDTO {
  return {
    id: item.id,
    userEmail: item.userEmail,
    itemType: item.itemType,
    itemId: item.itemId,
    itemName: item.itemName,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
  };
}

export function serializeOrder(order: Order): OrderApiDTO {
  let items: OrderApiDTO["items"] = [];
  try {
    items = JSON.parse(order.items);
  } catch {
    items = [];
  }
  let shippingAddress: OrderApiDTO["shippingAddress"] = {
    street: "",
    city: "",
    state: "",
    zip: "",
  };
  try {
    shippingAddress = JSON.parse(order.shippingAddress);
  } catch {
    /* keep empty address */
  }
  return {
    id: order.id,
    userEmail: order.userEmail,
    totalAmount: order.totalAmount,
    items,
    shippingAddress,
    status: order.status,
    createdAt: order.createdAt,
  };
}

export function serializeUser(user: User): UserApiDTO {
  return { id: user.id, email: user.email, name: user.name };
}
