import { db } from "@/lib/db";
import { accommodations } from "@/lib/db/schema/accommodations";
import { landlords } from "@/lib/db/schema/landlords";
import { reservations } from "@/lib/db/schema/reservations";
import { stays } from "@/lib/db/schema/stays";
import { and, eq, lte, gte, or } from "drizzle-orm";
import { KalendarFiltri } from "@/types/kalendar";

export type KalendarQueryRow = {
  accommodationId: string;
  naziv: string;
  landlordId: string;
  landlordIme: string;
  // Iz reservations (nullable — apartman možda nema rezervacija)
  rezervacijaId: string | null;
  rezervacijaOd: string | null;
  rezervacijaDo: string | null;
  rezervacijaBroj: number | null;
  rezervacijaStatus: "potvrdjena" | "nepotvrdjena" | null;
  // Iz stays (nullable)
  stayId: string | null;
  stayOd: string | null;
  stayDo: string | null;
  stayBroj: number | null;
};

export async function getKalendarData(
  filtri: KalendarFiltri,
): Promise<KalendarQueryRow[]> {
  // Gradimo uvjete za accommodations
  const accUvjeti = [
    eq(accommodations.agencyId, process.env.AGENCY_ID!),
    eq(accommodations.aktivan, true),
  ];

  if (filtri.gradId !== null) {
    accUvjeti.push(eq(accommodations.cityId, filtri.gradId));
  }
  if (filtri.landlordId !== null) {
    accUvjeti.push(eq(accommodations.landlordId, filtri.landlordId));
  }
  if (filtri.brojSoba !== null) {
    accUvjeti.push(eq(accommodations.brojSoba, filtri.brojSoba));
  }
  if (filtri.brojKreveta !== null) {
    accUvjeti.push(eq(accommodations.brojKreveta, filtri.brojKreveta));
  }
  if (filtri.brojPomocnihLezajeva !== null) {
    accUvjeti.push(
      eq(accommodations.brojPomocnihLezajeva, filtri.brojPomocnihLezajeva),
    );
  }
  if (filtri.samoPrioritetan) {
    accUvjeti.push(eq(accommodations.prioritetan, true));
  }
  if (filtri.imaKlima) {
    accUvjeti.push(eq(accommodations.imaKlima, true));
  }
  if (filtri.imaParking) {
    accUvjeti.push(eq(accommodations.imaParking, true));
  }
  if (filtri.imaWifi) {
    accUvjeti.push(eq(accommodations.imaWifi, true));
  }
  if (filtri.kucniLjubimac) {
    accUvjeti.push(eq(accommodations.kucniLjubimac, true));
  }
  if (filtri.pogledNaMore) {
    accUvjeti.push(eq(accommodations.pogledNaMore, true));
  }

  // Uvjet preklapanja datuma: event.dateFrom <= filtri.datumDo AND event.dateTo >= filtri.datumOd
  const preklаpanjеRez = and(
    lte(reservations.dateFrom, filtri.datumDo),
    gte(reservations.dateTo, filtri.datumOd),
  );
  const preklapanjeStay = and(
    lte(stays.dateFrom, filtri.datumDo),
    gte(stays.dateTo, filtri.datumOd),
  );

  // Glavni query: apartments + landlords, LEFT JOIN reservations, LEFT JOIN stays
  const rows = await db
    .select({
      accommodationId: accommodations.id,
      naziv: accommodations.name,
      landlordId: landlords.id,
      landlordIme: landlords.surname,
      landlordName: landlords.name,
      rezervacijaId: reservations.id,
      rezervacijaOd: reservations.dateFrom,
      rezervacijaDo: reservations.dateTo,
      rezervacijaBroj: reservations.redniBroj,
      rezervacijaStatus: reservations.status,
      stayId: stays.id,
      stayOd: stays.dateFrom,
      stayDo: stays.dateTo,
      stayBroj: stays.redniBroj,
    })
    .from(accommodations)
    .innerJoin(landlords, eq(accommodations.landlordId, landlords.id))
    .leftJoin(
      reservations,
      and(
        eq(reservations.accommodationId, accommodations.id),
        preklаpanjеRez,
        // Poštujemo filter tipa rezervacije
        filtri.samoPotvrdjene
          ? eq(reservations.status, "potvrdjena")
          : filtri.samoNepotvrdjene
            ? eq(reservations.status, "nepotvrdjena")
            : undefined,
      ),
    )
    .leftJoin(
      stays,
      and(eq(stays.accommodationId, accommodations.id), preklapanjeStay),
    )
    .where(and(...accUvjeti))
    .orderBy(landlords.surname, landlords.name, accommodations.name);

  // Mapiramo landlordIme u puno prezime + ime (veliko slovo)
  return rows.map((r) => ({
    ...r,
    landlordIme: `${r.landlordIme.toUpperCase()} ${r.landlordName.toUpperCase()}`,
    rezervacijaStatus: r.rezervacijaStatus as
      | "potvrdjena"
      | "nepotvrdjena"
      | null,
  }));
}
