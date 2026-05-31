import { db } from "@/lib/db";
import { cities } from "@/lib/db/schema";

export type CityRow = Awaited<ReturnType<typeof getCities>>[number];

export async function getCities() {
  return await db.select().from(cities).orderBy(cities.name);
}

export async function createCity(data: { name: string; zip?: string | null }) {
  const result = await db
    .insert(cities)
    .values({
      name: data.name,
      zip: data.zip || null,
    })
    .returning();

  return result[0];
}
