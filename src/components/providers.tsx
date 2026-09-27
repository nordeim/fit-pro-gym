"use client";

import * as React from "react";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface CartItemDTO {
  id: string;
  userEmail: string;
  itemType: "product" | "membership";
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  stockQuantity: number;
  featured: boolean;
}

export interface MembershipDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMonths: number;
  features: string[];
  popular: boolean;
  colorScheme: string;
}

export type ToastType = "success" | "info" | "error";

export interface ToastMessage {
  type: ToastType;
  text: string;
}

interface AppContextValue {
  user: SessionUser | null;
  userLoading: boolean;
  cartCount: number;
  toast: ToastMessage | null;
  refreshUser: () => Promise<void>;
  refreshCart: () => Promise<void>;
  logout: () => Promise<void>;
  showToast: (type: ToastType, text: string) => void;
}

const AppContext = React.createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/**
 * Client-side app state: the logged-in user, the header cart badge count,
 * and a single-slot toast (the reference app shows one message at a time,
 * auto-dismissing after 3 seconds). The SERVER stays the source of truth —
 * every mutation goes through the API routes and then refreshes here.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [userLoading, setUserLoading] = React.useState(true);
  const [cartCount, setCartCount] = React.useState(0);
  const [toast, setToast] = React.useState<ToastMessage | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshUser = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: SessionUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }, []);

  const refreshCart = React.useCallback(async () => {
    try {
      const res = await fetch("/api/cart/count", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { count: number };
      setCartCount(data.count ?? 0);
    } catch {
      // keep the last known count — the badge is best-effort chrome
    }
  }, []);

  // Bootstrap fetch on mount: user + cart count. setState happens in the
  // async continuations (after await) — the canonical external-system sync
  // pattern; the synchronous-call heuristic of
  // react-hooks/set-state-in-effect does not apply.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUser();
    void refreshCart();
  }, [refreshUser, refreshCart]);

  // Re-pull the badge count whenever the user identity changes (login /
  // logout transitions swap the server-side cart).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) void refreshCart();
  }, [user, refreshCart]);

  const showToast = React.useCallback((type: ToastType, text: string) => {
    setToast({ type, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  React.useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setCartCount(0);
    }
  }, []);

  const value = React.useMemo<AppContextValue>(
    () => ({ user, userLoading, cartCount, toast, refreshUser, refreshCart, logout, showToast }),
    [user, userLoading, cartCount, toast, refreshUser, refreshCart, logout, showToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
