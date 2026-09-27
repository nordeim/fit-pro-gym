import { AuthForm } from "@/components/auth/auth-form";

// Plain app title (absolute — escapes the root layout's "%s | …" template,
// matching the reference, whose /login title is just "FitPro GYM App").
export const metadata = { title: { absolute: "FitPro GYM App" } };

// The reference renders the login form for authenticated visitors too —
// no redirect to /Home.
export default function LoginPage() {
  return <AuthForm />;
}
