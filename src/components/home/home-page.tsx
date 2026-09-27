import { prisma } from "@/lib/db";
import { serializeMembership, serializeProduct } from "@/lib/serialize";
import type { MembershipDTO, ProductDTO } from "@/components/providers";

import { CTASection } from "@/components/home/cta-section";
import { Hero } from "@/components/home/hero";
import { PlansPreview } from "@/components/home/plans-preview";
import { ShopPreview } from "@/components/home/shop-preview";
import { WhyChoose } from "@/components/home/why-choose";

export const dynamic = "force-dynamic";

/**
 * Home (the reference app's main page): hero → why-choose → plan preview →
 * shop preview → CTA band. Data is read server-side (SEO + first paint);
 * the animated sections are client components.
 */
export async function HomePage() {
  const [membershipRows, productRows] = await Promise.all([
    prisma.membershipPlan.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const memberships: MembershipDTO[] = membershipRows.map(serializeMembership);
  const products: ProductDTO[] = productRows.map(serializeProduct);

  return (
    <>
      <Hero />
      <WhyChoose />
      <PlansPreview memberships={memberships} />
      <ShopPreview products={products} />
      <CTASection />
    </>
  );
}
