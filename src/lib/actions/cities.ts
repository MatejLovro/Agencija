"use server";

import { createCity, getCities } from "@/lib/db/queries/cities";
import { revalidatePath } from "next/cache";

export async function actionGetCities() {
  return await getCities();
}

export async function actionCreateCity(name: string, zip?: string) {
  const city = await createCity(name, zip);
  revalidatePath("/iznajmljivaci");
  return city;
}
