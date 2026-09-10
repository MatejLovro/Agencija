import type { AccommodationFormValues } from "@/lib/validations/accomodation";
import type { getAccommodationById } from "@/lib/db/queries/accommodations";

type AccommodationDbRow = NonNullable<
  Awaited<ReturnType<typeof getAccommodationById>>
>;

/**
 * Mapira puni DB row (getAccommodationById) u AccommodationFormValues oblik
 * koji RHF forma koristi. Isti mapping koji UrediIznajmljivacClient koristi
 * za EDIT (handleEditAccommodation) — izdvojen ovdje da ga CREATE-mode copy
 * flow može reuseati bez dupliciranja.
 */
export function mapAccommodationToFormValues(
  acc: AccommodationDbRow,
): AccommodationFormValues {
  return {
    name: acc.name,
    fullName: acc.fullName ?? "",
    vrstaApartmana: acc.vrstaApartmana,
    cityId: acc.cityId,
    address: acc.address,
    webUrl: acc.webUrl ?? "",
    brojZvjezdica: acc.brojZvjezdica,
    kategorizacijskiBroj: acc.kategorizacijskiBroj ?? "",
    brojSoba: acc.brojSoba,
    brojKreveta: acc.brojKreveta,
    brojPomocnihLezajeva: acc.brojPomocnihLezajeva ?? undefined,
    maxOsoba: acc.maxOsoba ?? undefined,
    aktivan: acc.aktivan,
    prioritetan: acc.prioritetan,
    cistiAgencija: acc.cistiAgencija,
    opis: acc.opis ?? "",
    imaKlima: acc.imaKlima,
    imaParking: acc.imaParking,
    imaWifi: acc.imaWifi,
    imaRostilj: acc.imaRostilj,
    imaTerasu: acc.imaTerasu,
    pogledNaMore: acc.pogledNaMore,
    kucniLjubimac: acc.kucniLjubimac,
    nepusaci: acc.nepusaci,
    pristupacnoInvalidima: acc.pristupacnoInvalidima,
    imaKuhinju: acc.imaKuhinju,
    imaCajnuKuhinju: acc.imaCajnuKuhinju,
    brojKupaonica: acc.brojKupaonica ?? undefined,
    kupаonaTus: acc.kupаonaTus,
    imaJacuzzi: acc.imaJacuzzi,
    kat: acc.kat ?? undefined,
    imaBasen: acc.imaBasen,
    imaSpa: acc.imaSpa,
    imaFitness: acc.imaFitness,
    imaRestoran: acc.imaRestoran,
    imaPunjacAuta: acc.imaPunjacAuta,
    udaljenostMore: acc.udaljenostMore ?? undefined,
    udaljenostCentar: acc.udaljenostCentar ?? undefined,
    udaljenostTrgovina: acc.udaljenostTrgovina ?? undefined,
    aktivnostBicikliranje: acc.aktivnostBicikliranje,
    aktivnostRonjenje: acc.aktivnostRonjenje,
    aktivnostPlaninarenje: acc.aktivnostPlaninarenje,
    katastarskaOpcina: acc.katastarskaOpcina ?? "",
    katastarskaCestica: acc.katastarskaCestica ?? "",
  };
}

/**
 * EXPLICIT ALLOW-LIST za "Kopiraj podatke od X" (CREATE mod, ApartmanModal).
 *
 * Dodavanje novog polja u accommodationSchema NE smije automatski dospjeti
 * ovdje — svaki novi podatak zahtijeva svjesnu odluku treba li biti dio
 * copy contracta. Vidi docs/modules/accommodations.md.
 *
 * Namjerno se NE koristi `{ ...source }` niti drugi mehanizam koji bi
 * kopirao polja mimo ovog popisa.
 */
const ACCOMMODATION_COPY_FIELDS = [
  // Kartica 1 — Osnovni podaci
  "vrstaApartmana",
  "cityId",
  "address",
  "brojZvjezdica",
  "opis",
  "aktivan",
  "prioritetan",
  "cistiAgencija",

  // Kartica 2 — Sadržaji
  "imaKlima",
  "imaParking",
  "imaWifi",
  "imaRostilj",
  "imaTerasu",
  "pogledNaMore",
  "kucniLjubimac",
  "nepusaci",
  "imaKuhinju",
  "imaCajnuKuhinju",
  "kupаonaTus",

  // Kartica 3 — Lokacija i aktivnosti (sve postojeće)
  "imaBasen",
  "imaSpa",
  "imaFitness",
  "imaRestoran",
  "imaPunjacAuta",
  "udaljenostMore",
  "udaljenostCentar",
  "udaljenostTrgovina",
  "aktivnostBicikliranje",
  "aktivnostRonjenje",
  "aktivnostPlaninarenje",

  // Kartica 4 — Ostalo (samo ova dva polja, ne "sva polja kartice")
  "katastarskaOpcina",
  "katastarskaCestica",
] as const satisfies readonly (keyof AccommodationFormValues)[];

export type AccommodationCopyField = (typeof ACCOMMODATION_COPY_FIELDS)[number];

/**
 * Vraća samo allow-list polja iz source vrijednosti, spremna za
 * form.setValue() po polju u CREATE formi. Nikad ne kopira id,
 * agencyId, landlordId, createdAt, updatedAt niti bilo koji podatak
 * izvan AccommodationFormValues (cjenik, rezervacije, boravci...).
 */
export function buildAccommodationCopy(
  source: AccommodationFormValues,
): Pick<AccommodationFormValues, AccommodationCopyField> {
  const copy = {} as Pick<AccommodationFormValues, AccommodationCopyField>;
  for (const field of ACCOMMODATION_COPY_FIELDS) {
    // TS ne može suziti heterogeni union kroz keyof-indexed petlju na
    // kompatibilan par (field, value) — polje i vrijednost su svejedno
    // uvijek istog tipa jer oboje dolaze s istog field imena iz iste
    // AccommodationFormValues sheme.
    (copy as never)[field] = source[field] as never;
  }
  return copy;
}
