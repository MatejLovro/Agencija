import { db } from "@/lib/db";
import { landlords, cities } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

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

export type LandlordRow = Awaited<ReturnType<typeof getLandlords>>[number];
