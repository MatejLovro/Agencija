import { db } from "@/lib/db";
import { pricelist } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getPricelistByAccommodation(accommodationId: string) {
  return db
    .select({
      id: pricelist.id,
      dateFrom: pricelist.dateFrom,
      dateTo: pricelist.dateTo,
      pricePerNight: pricelist.pricePerNight,
    })
    .from(pricelist)
    .where(eq(pricelist.accommodationId, accommodationId))
    .orderBy(asc(pricelist.dateFrom));
}

export async function createPricelistEntry(
  data: typeof pricelist.$inferInsert,
) {
  const [entry] = await db.insert(pricelist).values(data).returning();
  return entry;
}

export async function updatePricelistEntry(
  id: string,
  data: Partial<typeof pricelist.$inferInsert>,
) {
  const [entry] = await db
    .update(pricelist)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pricelist.id, id))
    .returning();
  return entry;
}

export async function deletePricelistEntry(id: string) {
  await db.delete(pricelist).where(eq(pricelist.id, id));
}

export type PricelistRow = Awaited<
  ReturnType<typeof getPricelistByAccommodation>
>[number];
