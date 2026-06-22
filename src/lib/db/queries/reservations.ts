// src/lib/db/queries/reservations.ts
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema/reservations";
import { accommodations } from "@/lib/db/schema/accommodations";
import { landlords } from "@/lib/db/schema/landlords";
import { stays } from "@/lib/db/schema/stays";
import { eq, desc } from "drizzle-orm";

// ─── Dohvat apartmana + iznajmljivača za prikaz na formi rezervacije ───────

export type AccommodationWithLandlord = {
  accommodationId: string;
  accommodationNaziv: string;
  landlordId: string;
  landlordSurname: string;
  landlordName: string;
  landlordPhone: string | null;
};

export async function getAccommodationWithLandlord(
  accommodationId: string,
): Promise<AccommodationWithLandlord | null> {
  const rows = await db
    .select({
      accommodationId: accommodations.id,
      accommodationNaziv: accommodations.name,
      landlordId: landlords.id,
      landlordSurname: landlords.surname,
      landlordName: landlords.name,
      landlordPhone: landlords.phone,
    })
    .from(accommodations)
    .innerJoin(landlords, eq(accommodations.landlordId, landlords.id))
    .where(eq(accommodations.id, accommodationId))
    .limit(1);

  return rows[0] ?? null;
}

// ─── Kreiranje nove rezervacije ──────────────────────────────────────────────

export type CreateReservationInput = {
  agencyId: string;
  accommodationId: string;
  guestName: string;
  guestSurname: string;
  email: string;
  phone: string | null;
  dateFrom: string; // ISO
  dateTo: string; // ISO
  adults: number;
  teens18: number;
  children: number;
  rezervationValid: string; // ISO
  remark: string | null;
  partnerId: string | null;
};

export async function createReservation(input: CreateReservationInput) {
  const [created] = await db
    .insert(reservations)
    .values({
      agencyId: input.agencyId,
      accommodationId: input.accommodationId,
      guestName: input.guestName,
      guestSurname: input.guestSurname,
      email: input.email,
      phone: input.phone,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      adults: input.adults,
      teens18: input.teens18,
      children: input.children,
      rezervationValid: input.rezervationValid,
      remark: input.remark,
      partnerId: input.partnerId,
      // redniBroj — auto (bigserial)
      // status — default "nepotvrdjena" iz sheme
      // price, avansPercent, avansAmount — ostaju null
    })
    .returning();

  return created;
}

// ─── Dohvat svih rezervacija za tablicu ─────────────────────────────────────

export type RezervacijaTableRow = {
  id: string;
  redniBroj: number;
  rezervationValid: string | null; // ISO date
  status: "nepotvrdjena" | "potvrdjena";
  stornirana: boolean;
  realizirana: boolean; // izvodi se: stays zapis postoji
  guestSurname: string;
  guestName: string;
  landlordSurname: string;
  landlordName: string;
  accommodationName: string; // kratki naziv
  dateFrom: string; // ISO date
  dateTo: string; // ISO date
  adults: number;
  teens18: number;
  children: number;
  price: string | null; // numeric dolazi kao string iz Drizzle
};

export async function getReservations(
  agencyId: string,
): Promise<RezervacijaTableRow[]> {
  const rows = await db
    .select({
      id: reservations.id,
      redniBroj: reservations.redniBroj,
      rezervationValid: reservations.rezervationValid,
      status: reservations.status,
      stornirana: reservations.stornirana,
      guestSurname: reservations.guestSurname,
      guestName: reservations.guestName,
      dateFrom: reservations.dateFrom,
      dateTo: reservations.dateTo,
      adults: reservations.adults,
      teens18: reservations.teens18,
      children: reservations.children,
      price: reservations.price,
      accommodationName: accommodations.name,
      landlordSurname: landlords.surname,
      landlordName: landlords.name,
      stayId: stays.id, // null ako nema prijave
    })
    .from(reservations)
    .innerJoin(
      accommodations,
      eq(reservations.accommodationId, accommodations.id),
    )
    .innerJoin(landlords, eq(accommodations.landlordId, landlords.id))
    .leftJoin(stays, eq(stays.reservationId, reservations.id))
    .where(eq(reservations.agencyId, agencyId))
    .orderBy(desc(reservations.createdAt));

  return rows.map((row) => ({
    id: row.id,
    redniBroj: row.redniBroj,
    rezervationValid: row.rezervationValid,
    status: row.status,
    stornirana: row.stornirana,
    realizirana: row.stayId !== null,
    guestSurname: row.guestSurname,
    guestName: row.guestName,
    accommodationName: row.accommodationName,
    landlordSurname: row.landlordSurname,
    landlordName: row.landlordName,
    dateFrom: row.dateFrom,
    dateTo: row.dateTo,
    adults: row.adults,
    teens18: row.teens18,
    children: row.children,
    price: row.price,
  }));
}
