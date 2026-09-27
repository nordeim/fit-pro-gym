import type { MembershipDTO } from "@/components/providers";

/**
 * The reference's home "Choose Your Perfect Plan" preview pins its MIDDLE
 * card to a hardcoded Pro Athlete object (extracted verbatim from its JS
 * bundle). The entity's own row differs — the reference's Membership
 * "Pro Athlete" entity lists six features (Recovery room access, Mobile app
 * with workout plans) while the hardcoded home card lists five, with
 * "Premium equipment access" in the fourth slot:
 *
 *   24/7 gym access · Personal trainer sessions (4/month) ·
 *   Group fitness classes · Premium equipment access ·
 *   Nutrition consultation
 *
 * The reference renders [e[0], this, e[1]] over `e` = the three newest
 * entities (Membership.list("-created_date", 3)) — the third fetched entity
 * is never displayed. Mirrored here; pinned by home-featured-plan.test.ts.
 */
export const HOME_FEATURED_PLAN: MembershipDTO = {
  id: "home-featured-plan",
  name: "Pro Athlete",
  description: "Comprehensive training for serious fitness enthusiasts",
  price: 59,
  durationMonths: 1,
  features: [
    "24/7 gym access",
    "Personal trainer sessions (4/month)",
    "Group fitness classes",
    "Premium equipment access",
    "Nutrition consultation",
  ],
  popular: true,
  colorScheme: "blue",
};

/**
 * The reference's slot algorithm (its bundle: `s = e.length >= 2 ?
 * [e[0], n, e[1]] : [n, ...e]`): the newest entity, the hardcoded featured
 * plan, then the second-newest entity. With fewer than two entities the
 * hardcoded card leads.
 */
export function homePlanSlots(entities: MembershipDTO[]): MembershipDTO[] {
  if (entities.length >= 2) {
    return [entities[0], HOME_FEATURED_PLAN, entities[1]];
  }
  return [HOME_FEATURED_PLAN, ...entities];
}
