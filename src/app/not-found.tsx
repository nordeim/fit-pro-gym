import { NotFoundPage } from "@/components/not-found-page";

// The app-wide 404 — the reference's branded not-found page (no app chrome).
// Next.js serves this with HTTP 404 for genuinely unknown routes.
export default function NotFound() {
  return <NotFoundPage />;
}
