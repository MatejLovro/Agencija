// src/lib/actions/reservations.ts
"use server";

import {
  getAccommodationWithLandlord,
  createReservation,
  getReservations,
  AccommodationWithLandlord,
  RezervacijaTableRow,
} from "@/lib/db/queries/reservations";

import { getPartners, PartnerOption } from "@/lib/db/queries/partners";
import {
  reservationSchema,
  ReservationFormValues,
  hrDateToIso,
} from "@/lib/validations/reservation";
import { actionProvjeriMoguceRezerviranje } from "@/lib/actions/kalendar";
import { revalidatePath } from "next/cache";

import {
  getReservationsForCombobox,
  RezervacijaComboboxOption,
} from "@/lib/db/queries/reservations";

// ─── Dohvat podataka o apartmanu/iznajmljivaču ──────────────────────────────

export async function actionGetAccommodationWithLandlord(
  accommodationId: string,
): Promise<AccommodationWithLandlord | null> {
  return getAccommodationWithLandlord(accommodationId);
}

// ─── Dohvat partnera za combobox ─────────────────────────────────────────────

// export async function actionGetPartners(): Promise<PartnerOption[]> {
//   return getPartners(process.env.AGENCY_ID!);
// }

// ─── Kreiranje rezervacije ────────────────────────────────────────────────────

export type CreateReservationResult =
  | { success: true }
  | { success: false; error: string };

export async function actionCreateReservation(
  values: ReservationFormValues,
): Promise<CreateReservationResult> {
  // 1. Zod validacija (server-side, ne oslanjamo se samo na klijenta)
  const parsed = reservationSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Podaci na formi nisu ispravni. Provjerite unesene vrijednosti.",
    };
  }

  const data = parsed.data;
  const dateFromIso = hrDateToIso(data.dateFrom);
  const dateToIso = hrDateToIso(data.dateTo);
  const rezervationValidIso = hrDateToIso(data.rezervationValid);

  // 2. Race-condition provjera — period je mogao postati zauzet
  // dok je korisnik popunjavao formu
  const provjera = await actionProvjeriMoguceRezerviranje(
    data.accommodationId,
    dateFromIso,
    dateToIso,
  );
  if (!provjera.dozvoljeno) {
    return { success: false, error: provjera.poruka };
  }

  // 3. Spremanje
  try {
    await createReservation({
      agencyId: process.env.AGENCY_ID!,
      accommodationId: data.accommodationId,
      guestName: data.guestName,
      guestSurname: data.guestSurname,
      email: data.email,
      phone: data.phone && data.phone.length > 0 ? data.phone : null,
      dateFrom: dateFromIso,
      dateTo: dateToIso,
      adults: data.adults,
      teens18: data.teens18,
      children: data.children,
      rezervationValid: rezervationValidIso,
      remark: data.remark && data.remark.length > 0 ? data.remark : null,
      partnerId:
        data.partnerId && data.partnerId.length > 0 ? data.partnerId : null,
    });
  } catch (e) {
    return {
      success: false,
      error: "Greška pri spremanju rezervacije. Pokušajte ponovno.",
    };
  }

  revalidatePath("/kalendar");
  return { success: true };
}

// ─── Dohvat svih rezervacija za tablicu ─────────────────────────────────────

export async function actionGetReservations(): Promise<RezervacijaTableRow[]> {
  return getReservations(process.env.AGENCY_ID!);
}

export async function actionGetReservationsForCombobox(): Promise<
  RezervacijaComboboxOption[]
> {
  return getReservationsForCombobox(process.env.AGENCY_ID!);
}
