import { db } from "@/lib/db";
import { accommodations, pricelist } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export async function getAccommodationsByLandlord(landlordId: string) {
  return db
    .select({
      id: accommodations.id,
      name: accommodations.name,
      brojSoba: accommodations.brojSoba,
      brojKreveta: accommodations.brojKreveta,
      brojPomocnihLezajeva: accommodations.brojPomocnihLezajeva,
      maxOsoba: accommodations.maxOsoba,
      vrstaApartmana: accommodations.vrstaApartmana,
      hasPricelist: sql<boolean>`count(${pricelist.id}) > 0`,
    })
    .from(accommodations)
    .leftJoin(pricelist, eq(pricelist.accommodationId, accommodations.id))
    .where(eq(accommodations.landlordId, landlordId))
    .groupBy(accommodations.id)
    .orderBy(asc(accommodations.createdAt));
}

export async function createAccommodation(
  data: typeof accommodations.$inferInsert,
) {
  const [accommodation] = await db
    .insert(accommodations)
    .values(data)
    .returning();
  return accommodation;
}

export async function updateAccommodation(
  id: string,
  data: Partial<typeof accommodations.$inferInsert>,
) {
  const [accommodation] = await db
    .update(accommodations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(accommodations.id, id))
    .returning();
  return accommodation;
}

export async function deleteAccommodation(id: string) {
  await db.delete(accommodations).where(eq(accommodations.id, id));
}

export type AccommodationRow = Awaited<
  ReturnType<typeof getAccommodationsByLandlord>
>[number];

export async function getAccommodationById(id: string) {
  const result = await db
    .select()
    .from(accommodations)
    .where(eq(accommodations.id, id))
    .limit(1);
  return result[0] ?? null;
}
