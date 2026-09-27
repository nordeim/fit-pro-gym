import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serialize";
import type { ProductDTO } from "@/components/providers";
import { ShopPage } from "@/components/shop/shop-page";

export const metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

/** `/Shop` — server-rendered catalog handed to the interactive grid. */
export default async function Page() {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const products: ProductDTO[] = rows.map(serializeProduct);

  return <ShopPage products={products} />;
}
