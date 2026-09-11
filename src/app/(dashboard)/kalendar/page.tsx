// src/app/(dashboard)/kalendar/page.tsx
import KalendarClient from "./KalendarClient";
import { getCities } from "@/lib/db/queries/cities";
import { getLandlords } from "@/lib/db/queries/landlords";

export default async function KalendarPage() {
  const [cities, landlords] = await Promise.all([
    getCities(),
    getLandlords(),
  ]);

  return <KalendarClient cities={cities} landlords={landlords} />;
}
