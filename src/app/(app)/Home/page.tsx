import { HomePage } from "@/components/home/home-page";

/** `/Home` — the canonical nav URL for the landing page (reference parity). */
export const dynamic = "force-dynamic";

export default function Page() {
  return <HomePage />;
}
