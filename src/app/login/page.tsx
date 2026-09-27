import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  // Authenticated visits skip the login screen (reference parity).
  const user = await getSessionUser();
  if (user) redirect("/Home");
  return <AuthForm mode="signin" />;
}
