import { NotFoundPage } from "@/components/not-found-page";

export const metadata = { title: "Signup" };

// The reference never built a signup page — its /signup route renders the
// app's 404 ("The page \"signup\" could not be found in this application.")
// while keeping the route's own title. Mirrored here: the page serves HTTP
// 200 with the 404 content, exactly like the reference's SPA shell.
export default function SignupPage() {
  return <NotFoundPage pageName="signup" />;
}
