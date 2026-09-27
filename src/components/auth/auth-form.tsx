"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";

import { useApp } from "@/components/providers";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Google "G" mark (inline SVG, no external asset). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * Auth surface, mirroring the reference's login card 1:1 (DOM extracted
 * from the live app): the gradient slate canvas, the real logo image in a
 * ring chip, "Continue with Google" with the -ml-4 icon wrapper, the
 * uppercase OR divider, slate icon inputs, the dark slate-900 submit, and
 * the bottom "Forgot password? / Need an account? Sign up" row — both
 * plain grey buttons, inert exactly like the reference's. Errors render in
 * the reference's red Alert box ("Invalid email or password").
 *
 * The reference has no signup page (its /signup route renders the 404), so
 * this form is sign-in only; /api/auth/register remains as an API surface.
 */
export function AuthForm() {
  const router = useRouter();
  const { refreshUser, refreshCart, showToast } = useApp();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Invalid email or password");
        return;
      }
      await refreshUser();
      await refreshCart();
      showToast("success", "Signed in successfully");
      router.push("/Home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = () => {
    showToast(
      "info",
      "Google sign-in is not configured in this environment — use email and password."
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-card-foreground relative overflow-hidden rounded-2xl border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
          <div className="p-8 sm:p-10 md:px-10 md:pt-12 md:pb-10">
            <div className="flex flex-col items-center space-y-6 text-center sm:space-y-8">
              {/* Logo — the reference's image in the ring chip with glow blob */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-40" />
                <span className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full shadow-lg ring-4 ring-white/50 transition-all duration-300 group-hover:shadow-xl sm:h-24 sm:w-24">
                  <img
                    className="aspect-square h-full w-full object-cover"
                    alt="FitPro GYM App logo"
                    src="/login-logo.png"
                  />
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome to FitPro GYM App
                </h1>
                <p className="text-sm font-medium text-slate-500 sm:text-base">
                  Sign in to continue
                </p>
              </div>

              <div className="w-full">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onGoogle}
                    className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-[16px] font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                  >
                    <div className="-ml-4 transition-transform duration-200">
                      <GoogleIcon className="h-5 w-5" />
                    </div>
                    <span>Continue with Google</span>
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden>
                    <div className="h-[1px] w-full shrink-0 bg-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 font-medium tracking-wider text-slate-500">
                      or
                    </span>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5">
                      {/* S7-R7: the reference's login labels are PLAIN <label>
                          elements (its login shell renders
                          peer-disabled:cursor-not-allowed peer-disabled:
                          opacity-70 text-sm font-medium text-slate-700 —
                          no leading-none, computed line-height 20px), unlike
                          its checkout form which uses the shadcn Label. */}
                      <label
                        htmlFor="email"
                        className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700"
                      >
                        Email
                      </label>
                      <div className="relative mt-1.5">
                        <Mail
                          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
                          aria-hidden
                        />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus:ring-slate-400 sm:h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700"
                      >
                        Password
                      </label>
                      <div className="relative mt-1.5">
                        <Lock
                          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
                          aria-hidden
                        />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={8}
                          autoComplete="current-password"
                          className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus:ring-slate-400 sm:h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {error ? (
                    <Alert className="rounded-xl border-red-200 bg-red-50/70">
                      <div className="[&_p]:leading-relaxed text-sm text-red-700">
                        {error}
                      </div>
                    </Alert>
                  ) : null}

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-11 w-full rounded-xl bg-slate-900 font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 sm:h-12"
                    >
                      {submitting ? "Signing in..." : "Sign in"}
                    </Button>
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-0">
                      {/* Inert on the reference — mirrored. */}
                      <button
                        type="button"
                        className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                      >
                        Forgot password?
                      </button>
                      {/* Inert on the reference (its /signup is a 404) — mirrored. */}
                      <button
                        type="button"
                        className="text-sm text-slate-500 transition-colors hover:text-slate-700"
                      >
                        Need an account?{" "}
                        <span className="font-medium text-slate-700">Sign up</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
