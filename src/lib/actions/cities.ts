"use server";

import { createCity, getCities } from "@/lib/db/queries/cities";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { cities } from "@/lib/db/schema";

export async function actionGetCities() {
  return await getCities();
}

const DUPLICATE_CITY_MESSAGE = "Grad s ovim nazivom već postoji.";

export async function actionCreateCity(data: { name: string; zip?: string }) {
  const name = data.name.trim();

  // Brza aplikacijska provjera radi boljeg UX-a — konačna zaštita od
  // race conditiona je case-insensitive unique index (cities_name_lower_unique)
  // na bazi, čije kršenje hvatamo niže.
  const existing = await db
    .select({ id: cities.id })
    .from(cities)
    .where(sql`lower(trim(${cities.name})) = lower(trim(${name}))`)
    .limit(1);

  if (existing.length > 0) {
    return { error: DUPLICATE_CITY_MESSAGE };
  }

  try {
    const city = await createCity({ name, zip: data.zip });
    return { data: city };
  } catch (error) {
    // Postgres unique_violation — dva istovremena zahtjeva su prošla
    // gornju provjeru prije nego je prvi commitao svoj insert.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return { error: DUPLICATE_CITY_MESSAGE };
    }
    throw error;
  }
}
