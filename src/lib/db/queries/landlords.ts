import { db } from "@/lib/db";
import { landlords, cities } from "@/lib/db/schema";
import { asc, eq, and, ne } from "drizzle-orm";

export async function getLandlords() {
  return db
    .select({
      id: landlords.id,
      surname: landlords.surname,
      name: landlords.name,
      oib: landlords.oib,
      address: landlords.address,
      phone: landlords.phone,
      vrstaIznajmljivaca: landlords.vrstaIznajmljivaca,
      tipProvizije: landlords.tipProvizije,
      iznos: landlords.iznos,
      city: {
        name: cities.name,
        zip: cities.zip,
      },
    })
    .from(landlords)
    .innerJoin(cities, eq(cities.id, landlords.cityId))
    .orderBy(asc(landlords.createdAt));
}

export async function createLandlord(data: typeof landlords.$inferInsert) {
  const [landlord] = await db.insert(landlords).values(data).returning();
  return landlord;
}

export async function updateLandlord(
  id: string,
  data: Partial<typeof landlords.$inferInsert>,
) {
  const [landlord] = await db
    .update(landlords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(landlords.id, id))
    .returning();
  return landlord;
}

export async function getLandlordById(id: string) {
  const result = await db
    .select()
    .from(landlords)
    .where(eq(landlords.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getLandlordByOib(oib: string, excludeId?: string) {
  const agencyId = process.env.AGENCY_ID!;

  const conditions = excludeId
    ? and(
        eq(landlords.oib, oib),
        eq(landlords.agencyId, agencyId),
        ne(landlords.id, excludeId),
      )
    : and(eq(landlords.oib, oib), eq(landlords.agencyId, agencyId));

  const result = await db
    .select({
      id: landlords.id,
      surname: landlords.surname,
      name: landlords.name,
    })
    .from(landlords)
    .where(conditions)
    .limit(1);

  return result[0] ?? null;
}

export type LandlordRow = Awaited<ReturnType<typeof getLandlords>>[number];
