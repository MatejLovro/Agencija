"use server";

import { createCity, getCities } from "@/lib/db/queries/cities";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cities } from "@/lib/db/schema";

export async function actionGetCities() {
  return await getCities();
}

export async function actionCreateCity(data: { name: string; zip?: string }) {
  const existing = await db
    .select()
    .from(cities)
    .where(eq(cities.name, data.name))
    .limit(1);

  if (existing.length > 0) {
    return { error: `Grad "${data.name}" već postoji.` };
  }

  const city = await createCity({ name: data.name, zip: data.zip });
  return { data: city };
}
