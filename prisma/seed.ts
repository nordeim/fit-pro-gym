// Seed: mirrors the reference app's demo catalog (FitPro GYM App).
// Idempotent: clears domain tables, then inserts the canonical demo data.
// Run: bunx tsx prisma/seed.ts  (or: bun prisma/seed.ts)

import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  // Idempotency: wipe domain data, keep schema.
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.product.deleteMany();
  await db.membershipPlan.deleteMany();
  await db.user.deleteMany();

  // ---- Demo login (matches tests/e2e/helpers.ts) ---------------------------
  await db.user.create({
    data: {
      email: "demo@fitpro.app",
      name: "Demo User",
      passwordHash: hashPassword("Demo1234!"),
    },
  });

  // ---- Membership plans (reference "Membership" entities) ------------------
  // The reference's real entity dates (fetched live): two tie groups —
  // Basic Fit + Pro Athlete share 2025-07-01T14:15:08.501Z and Starter +
  // Family Pack share 2025-07-30T10:57:17.701Z. Its -created_date tie
  // order descends [Family Pack, Starter, Pro Athlete, Basic Fit]; the
  // millisecond offsets in PLAN_CREATED break the ties exactly that way,
  // so Membership.list("-created_date", 3) = [Family Pack, Starter, Pro
  // Athlete] and the home preview's hardcoded middle card replaces slot 3
  // (see src/lib/home-featured-plan.ts). The array below is in creation
  // (chronological) order and PLAN_CREATED matches it index-for-index.
  const plans: Array<{
    name: string;
    description: string;
    price: number;
    durationMonths: number;
    features: string[];
    popular?: boolean;
    colorScheme: string;
    sortOrder: number;
  }> = [
    {
      name: "Basic Fit",
      description: "Perfect for getting started on your fitness journey",
      price: 39,
      durationMonths: 12,
      features: [
        "Access to gym equipment",
        "Locker room facilities",
        "Basic fitness assessment",
        "Mobile app access",
      ],
      colorScheme: "blue",
      sortOrder: 2,
    },
    {
      name: "Pro Athlete",
      description: "Comprehensive training for serious fitness enthusiasts",
      price: 59,
      durationMonths: 12,
      features: [
        "24/7 gym access",
        "Personal trainer sessions (4/month)",
        "Group fitness classes",
        "Nutrition consultation",
        "Recovery room access",
        "Mobile app with workout plans",
      ],
      popular: true,
      colorScheme: "green",
      sortOrder: 1,
    },
    {
      name: "Starter",
      description: "Perfect for beginners to get started on their fitness journey.",
      price: 29,
      durationMonths: 1,
      features: ["Basic gym access", "Locker room access", "1 free group class"],
      colorScheme: "orange",
      sortOrder: 4,
    },
    {
      name: "Family Pack",
      description: "Get the whole family fit! Access for up to 4 members.",
      price: 149,
      durationMonths: 1,
      features: [
        "Full access for 4 members",
        "24/7 gym access",
        "Unlimited group classes",
        "Kid's play area access",
        "2 personal trainer sessions/month",
      ],
      colorScheme: "purple",
      sortOrder: 3,
    },
  ];

  // Index-matched to the plans array (chronological). Fixed dates mirror the
  // reference's own entities and make re-seeds fully deterministic — SQLite
  // millisecond ties would otherwise flip "-created_date" ordering on rowid.
  const PLAN_CREATED = [
    new Date("2025-07-01T14:15:08.000Z"), // Basic Fit (tie group 2025-07-01)
    new Date("2025-07-01T14:15:08.501Z"), // Pro Athlete (the reference's exact ms)
    new Date("2025-07-30T10:57:17.000Z"), // Starter (tie group 2025-07-30)
    new Date("2025-07-30T10:57:17.701Z"), // Family Pack (the reference's exact ms)
  ];
  for (const [i, plan] of plans.entries()) {
    await db.membershipPlan.create({
      data: { ...plan, features: JSON.stringify(plan.features), createdAt: PLAN_CREATED[i] },
    });
  }

  // ---- Shop products (reference "Product" entities) -------------------------
  const products: Array<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stockQuantity: number;
    featured: boolean;
  }> = [
    {
      name: "Yoga Mat Premium",
      description: "Non-slip yoga mat with superior grip and comfort",
      price: 79,
      category: "accessories",
      imageUrl:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      stockQuantity: 30,
      featured: true,
    },
    {
      name: "Professional Dumbbells Set",
      description: "Premium rubber-coated dumbbells for home or gym use",
      price: 299,
      category: "equipment",
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      stockQuantity: 15,
      featured: true,
    },
    {
      name: "Pre-Workout Energy",
      description: "Natural pre-workout supplement for enhanced performance",
      price: 34,
      category: "supplements",
      imageUrl:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      stockQuantity: 35,
      featured: true,
    },
    {
      name: "Whey Protein Powder",
      description: "High-quality protein supplement for muscle recovery",
      price: 49,
      category: "supplements",
      imageUrl:
        "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      stockQuantity: 50,
      featured: true,
    },
  ];

  // SESSION-6 PARITY FIX (S6-R1): the catalog is the reference's REAL entity
  // data, fetched live from its base44 entity API — exactly FOUR products
  // (Pre-Workout Energy / Yoga Mat Premium / Professional Dumbbells Set /
  // Whey Protein Powder, all featured). The four extra demo rows this seed
  // used to carry (Resistance Bands Set / Smart Fitness Watch / Kettlebell
  // Cast Iron 16kg / Gym Duffel Bag) never existed on the reference and
  // made the Shop grid render 8 cards against the reference's 4 real ones.
  // (The reference's injected "XSS-INJECT-TEST" junk row remains
  // deliberately absent — data-hygiene stance.)

  // SESSION-8 PARITY FIX (S8-R1): the reference's four original featured
  // products share ONE timestamp (2025-07-01T14:15:08.553Z); its -created_date
  // tie order is SERVER-DRIFTABLE and was re-audited live on 2026-09-28
  // (stable across 3 consecutive fetches): the real products now render
  // [Yoga Mat, Dumbbells, Pre-Workout, Whey] (newest first) — flipped from
  // the session-5 order [Pre-Workout, Yoga Mat, Dumbbells, Whey]. The
  // reference's injected "XSS-INJECT-TEST" junk row (featured, created
  // 2026-05-15) now holds slot 1 of its featured&-created_date&limit=4 home
  // preview and displaces Whey from the window; it remains deliberately
  // absent from this seed (data-hygiene stance, pinned by the home e2e
  // spec), so the clone renders all four REAL products with Whey filling
  // the slot the junk row occupies on the reference. The 200ms stagger
  // below pins createdAt desc to the array order so SQLite ties can never
  // flip it. The Shop page is unaffected (it sorts alphabetically
  // client-side, mirroring the reference).
  const PRODUCT_ANCHOR = new Date("2025-07-01T14:15:08.553Z").getTime();
  const productCreated = (i: number) => new Date(PRODUCT_ANCHOR - i * 200);
  for (const [i, product] of products.entries()) {
    await db.product.create({ data: { ...product, createdAt: productCreated(i) } });
  }

  console.log("Seeded FitPro demo data: 1 user, 4 membership plans, 4 products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
