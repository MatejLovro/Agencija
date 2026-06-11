"use server";

import { revalidatePath } from "next/cache";
import { createLandlord, updateLandlord } from "@/lib/db/queries/landlords";
import {
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from "@/lib/db/queries/accommodations";
import {
  createPricelistEntry,
  updatePricelistEntry,
  deletePricelistEntry,
} from "@/lib/db/queries/pricelist";
import { getLandlordByOib } from "@/lib/db/queries/landlords";
import { hrDateToIso } from "../utils/dates";
import type { LandlordFormValues } from "@/lib/validations/landlord";
import type { AccommodationFormValues } from "@/lib/validations/accomodation";
import type { PricelistEntryFormValues } from "@/lib/validations/pricelist";
import { getPricelistByAccommodation } from "@/lib/db/queries/pricelist";
import { getAccommodationById } from "@/lib/db/queries/accommodations";

const AGENCY_ID = process.env.AGENCY_ID!;

// --- Landlord actions ---

export async function actionCreateLandlord(data: LandlordFormValues) {
  // provjera postoji li iznajmljivač s tim OIB-om
  const existing = await getLandlordByOib(data.oib);
  if (existing) {
    return {
      error: `Iznajmljivač s OIB-om ${data.oib} je već upisan.`,
    };
  }

  const landlord = await createLandlord({
    agencyId: AGENCY_ID,
    surname: data.surname,
    name: data.name || "",
    datumRodjenja: hrDateToIso(data.datumRodjenja),
    oib: data.oib,
    cityId: data.cityId,
    address: data.address,
    phone: data.phone || undefined,
    email: data.email || null,
    iban: data.iban,
    vrstaIznajmljivaca: data.vrstaIznajmljivaca,
    rjesenje: data.rjesenje || null,
    brUgovora: data.brUgovora || null,
    tipProvizije: data.tipProvizije,
    iznos: String(data.iznos),
    eVisitName: data.eVisitName || null,
    eVisitPass: data.eVisitPass || null,
    prioritetan: data.prioritetan,
  });

  revalidatePath("/iznajmljivaci");
  return { data: landlord };
}

export async function actionUpdateLandlord(
  id: string,
  data: LandlordFormValues,
) {
  // provjera postoji li iznajmljivač s tim OIB-om
  const existing = await getLandlordByOib(data.oib, id);
  if (existing) {
    return {
      error: `Iznajmljivač s OIB-om ${data.oib} je već upisan.`,
    };
  }

  const landlord = await updateLandlord(id, {
    surname: data.surname,
    name: data.name || "",
    datumRodjenja: hrDateToIso(data.datumRodjenja),
    oib: data.oib,
    cityId: data.cityId,
    address: data.address,
    phone: data.phone || undefined,
    email: data.email || undefined,
    iban: data.iban,
    vrstaIznajmljivaca: data.vrstaIznajmljivaca,
    rjesenje: data.rjesenje || null,
    brUgovora: data.brUgovora || null,
    tipProvizije: data.tipProvizije,
    iznos: String(data.iznos),
    eVisitName: data.eVisitName || null,
    eVisitPass: data.eVisitPass || null,
    prioritetan: data.prioritetan,
  });

  revalidatePath("/iznajmljivaci");
  return { data: landlord };
}

// --- Accommodation actions ---

export async function actionCreateAccommodation(
  landlordId: string,
  data: AccommodationFormValues,
) {
  const accommodation = await createAccommodation({
    agencyId: AGENCY_ID,
    landlordId,
    name: data.name,
    fullName: data.fullName || null,
    vrstaApartmana: data.vrstaApartmana,
    cityId: data.cityId,
    address: data.address,
    webUrl: data.webUrl || null,
    brojZvjezdica: data.brojZvjezdica,
    kategorizacijskiBroj: data.kategorizacijskiBroj || null,
    brojSoba: data.brojSoba,
    brojKreveta: data.brojKreveta,
    brojPomocnihLezajeva: data.brojPomocnihLezajeva ?? null,
    maxOsoba: data.maxOsoba ?? null,
    aktivan: data.aktivan,
    prioritetan: data.prioritetan,
    cistiAgencija: data.cistiAgencija,
    opis: data.opis || null,
    imaKlima: data.imaKlima,
    imaParking: data.imaParking,
    imaWifi: data.imaWifi,
    imaRostilj: data.imaRostilj,
    imaTerasu: data.imaTerasu,
    pogledNaMore: data.pogledNaMore,
    kucniLjubimac: data.kucniLjubimac,
    nepusaci: data.nepusaci,
    pristupacnoInvalidima: data.pristupacnoInvalidima,
    imaKuhinju: data.imaKuhinju,
    imaCajnuKuhinju: data.imaCajnuKuhinju,
    brojKupaonica: data.brojKupaonica ?? null,
    kupаonaTus: data.kupаonaTus,
    imaJacuzzi: data.imaJacuzzi,
    kat: data.kat ?? null,
    imaBasen: data.imaBasen,
    imaSpa: data.imaSpa,
    imaFitness: data.imaFitness,
    imaRestoran: data.imaRestoran,
    imaPunjacAuta: data.imaPunjacAuta,
    udaljenostMore: data.udaljenostMore ?? null,
    udaljenostCentar: data.udaljenostCentar ?? null,
    udaljenostTrgovina: data.udaljenostTrgovina ?? null,
    aktivnostBicikliranje: data.aktivnostBicikliranje,
    aktivnostRonjenje: data.aktivnostRonjenje,
    aktivnostPlaninarenje: data.aktivnostPlaninarenje,
    katastarskaOpcina: data.katastarskaOpcina || null,
    katastarskaCestica: data.katastarskaCestica || null,
  });

  revalidatePath("/iznajmljivaci");
  return accommodation;
}

export async function actionUpdateAccommodation(
  id: string,
  data: AccommodationFormValues,
) {
  const accommodation = await updateAccommodation(id, {
    name: data.name,
    fullName: data.fullName || null,
    vrstaApartmana: data.vrstaApartmana,
    cityId: data.cityId,
    address: data.address,
    webUrl: data.webUrl || null,
    brojZvjezdica: data.brojZvjezdica,
    kategorizacijskiBroj: data.kategorizacijskiBroj || null,
    brojSoba: data.brojSoba,
    brojKreveta: data.brojKreveta,
    brojPomocnihLezajeva: data.brojPomocnihLezajeva ?? null,
    maxOsoba: data.maxOsoba ?? null,
    aktivan: data.aktivan,
    prioritetan: data.prioritetan,
    cistiAgencija: data.cistiAgencija,
    opis: data.opis || null,
    imaKlima: data.imaKlima,
    imaParking: data.imaParking,
    imaWifi: data.imaWifi,
    imaRostilj: data.imaRostilj,
    imaTerasu: data.imaTerasu,
    pogledNaMore: data.pogledNaMore,
    kucniLjubimac: data.kucniLjubimac,
    nepusaci: data.nepusaci,
    pristupacnoInvalidima: data.pristupacnoInvalidima,
    imaKuhinju: data.imaKuhinju,
    imaCajnuKuhinju: data.imaCajnuKuhinju,
    brojKupaonica: data.brojKupaonica ?? null,
    kupаonaTus: data.kupаonaTus,
    imaJacuzzi: data.imaJacuzzi,
    kat: data.kat ?? null,
    imaBasen: data.imaBasen,
    imaSpa: data.imaSpa,
    imaFitness: data.imaFitness,
    imaRestoran: data.imaRestoran,
    imaPunjacAuta: data.imaPunjacAuta,
    udaljenostMore: data.udaljenostMore ?? null,
    udaljenostCentar: data.udaljenostCentar ?? null,
    udaljenostTrgovina: data.udaljenostTrgovina ?? null,
    aktivnostBicikliranje: data.aktivnostBicikliranje,
    aktivnostRonjenje: data.aktivnostRonjenje,
    aktivnostPlaninarenje: data.aktivnostPlaninarenje,
    katastarskaOpcina: data.katastarskaOpcina || null,
    katastarskaCestica: data.katastarskaCestica || null,
  });

  revalidatePath("/iznajmljivaci");
  return accommodation;
}

export async function actionDeleteAccommodation(id: string) {
  await deleteAccommodation(id);
  revalidatePath("/iznajmljivaci");
}

export async function actionGetAccommodationById(id: string) {
  return await getAccommodationById(id);
}

// --- Pricelist actions ---

export async function actionCreatePricelistEntry(
  accommodationId: string,
  data: PricelistEntryFormValues,
) {
  const entry = await createPricelistEntry({
    accommodationId,
    dateFrom: data.dateFrom,
    dateTo: data.dateTo,
    pricePerNight: String(data.pricePerNight),
    landlordPrice: data.landlordPrice ? String(data.landlordPrice) : null,
  });

  revalidatePath("/iznajmljivaci");
  return entry;
}

export async function actionUpdatePricelistEntry(
  id: string,
  data: PricelistEntryFormValues,
) {
  const entry = await updatePricelistEntry(id, {
    dateFrom: data.dateFrom,
    dateTo: data.dateTo,
    pricePerNight: String(data.pricePerNight),
    landlordPrice: data.landlordPrice ? String(data.landlordPrice) : null,
  });

  revalidatePath("/iznajmljivaci");
  return entry;
}

export async function actionDeletePricelistEntry(id: string) {
  await deletePricelistEntry(id);
  revalidatePath("/iznajmljivaci");
}

export async function actionGetPricelistByAccommodation(
  accommodationId: string,
) {
  const entries = await getPricelistByAccommodation(accommodationId);
  return entries;
}
