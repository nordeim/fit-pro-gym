"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Dumbbell,
  House,
  Menu,
  ShoppingCart,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Home", url: "/Home", icon: House },
  { title: "Memberships", url: "/Memberships", icon: CreditCard },
  { title: "Shop", url: "/Shop", icon: ShoppingBag },
] as const;

/**
 * App chrome header — pixel-matched to the reference:
 * - sticky, backdrop-blur, border-b white/10, h-16, max-w-7xl container.
 * - Logo: gradient rounded-xl Dumbbell chip + "FitnessPro / Premium Gym".
 * - Desktop nav (hidden md:flex) with active pill (bg-white/10).
 * - Cart ghost button with blue count badge.
 * - Avatar initial + Logout (desktop), hamburger + collapsible menu (mobile).
 *
 * Tailwind v4 mobile-menu safety (skills/nextjs16-tailwind4 §9 + §10):
 * - Symmetric breakpoints: `hidden md:flex` nav vs `md:hidden` trigger/menu.
 * - The menu is CONDITIONALLY RENDERED from React state — never toggled via
 *   the `hidden` HTML attribute (v4: `hidden` overrides display utilities).
 * - Closes on pathname change (usePathname effect) and on link tap.
 * - Touch targets ≥ 44px (py-3 + icons 20px).
 */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cartCount, logout, refreshCart } = useApp();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Close the mobile menu on route change — React's documented
  // "adjust state during render" pattern (the set-state-in-effect
  // alternative): when pathname changes mid-render we reset both the
  // tracked pathname and the menu in the same commit.
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  // Keep the badge honest after login/logout transitions.
  React.useEffect(() => {
    void refreshCart();
  }, [user, refreshCart]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initial = user ? (user.name?.[0] || user.email[0].toUpperCase()) : "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-transparent text-white backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/Home" className="flex items-center space-x-2" aria-label="FitnessPro Premium Gym">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-green-500">
              <Dumbbell className="h-6 w-6 text-white" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FitnessPro</h1>
              <p className="text-xs text-gray-400">Premium Gym</p>
            </div>
          </Link>

          {/* Desktop nav — symmetric breakpoint with the mobile trigger below */}
          <nav aria-label="Primary" className="hidden space-x-6 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.url;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            <Link href="/Cart" className="relative" aria-label={`Cart, ${cartCount} items`}>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-white/10"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                {cartCount > 0 ? (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-800 bg-blue-500 text-xs leading-none text-white">
                    {cartCount}
                  </span>
                ) : null}
              </Button>
            </Link>

            {/* Desktop user cluster */}
            <div className="hidden items-center space-x-3 md:flex">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500">
                      <span className="text-sm font-medium text-white">{initial}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Login
                </Button>
              )}
            </div>

            {/* Mobile hamburger — md:hidden, toggles the collapsible menu.
                NEVER uses the `hidden` attribute (Tailwind v4: attribute
                beats display utilities). */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 md:hidden"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu — conditionally rendered (state-driven), md:hidden */}
      {menuOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-gray-900/90 backdrop-blur-lg md:hidden"
        >
          <div className="space-y-2 px-4 py-3">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.url;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-3 transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5"
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
            <div className="border-t border-white/10 pt-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-3">
                    <User className="h-5 w-5 text-gray-400" aria-hidden />
                    <span className="text-sm text-white">{user.name || user.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
