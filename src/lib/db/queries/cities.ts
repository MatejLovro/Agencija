import { db } from "@/lib/db";
import { cities } from "@/lib/db/schema";

export type CityRow = Awaited<ReturnType<typeof getCities>>[number];

export async function getCities() {
  return await db.select().from(cities).orderBy(cities.name);
}

export async function createCity(name: string, zip?: string) {
  const [city] = await db.insert(cities).values({ name, zip }).returning();
  return city;
}
