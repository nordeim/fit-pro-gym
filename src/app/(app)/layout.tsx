import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

/** Shared app chrome: sticky header (with mobile nav) + main + footer. */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <Header />
      <main className="flex-1 bg-gray-900">{children}</main>
      <Footer />
    </div>
  );
}
