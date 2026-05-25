import { db } from "@/lib/db";
import { accommodations } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getAccommodationsByLandlord(landlordId: string) {
  return db
    .select({
      id: accommodations.id,
      name: accommodations.name,
      brojSoba: accommodations.brojSoba,
      brojKreveta: accommodations.brojKreveta,
      maxOsoba: accommodations.maxOsoba,
      vrstaApartmana: accommodations.vrstaApartmana,
    })
    .from(accommodations)
    .where(eq(accommodations.landlordId, landlordId))
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
