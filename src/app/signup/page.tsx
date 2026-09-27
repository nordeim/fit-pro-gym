import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/auth";

export const metadata = { title: "Create account" };

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/Home");
  return <AuthForm mode="signup" />;
}
