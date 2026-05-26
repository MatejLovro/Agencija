import { z } from "zod";

export const landlordSchema = z
  .object({
    // Common fields
    oib: z
      .string()
      .length(11, "OIB mora imati točno 11 znakova")
      .regex(/^\d+$/, "OIB smije sadržavati samo brojeve"),
    cityId: z.number().min(1, "Grad je obavezan"),
    address: z.string().min(1, "Adresa je obavezna").max(100),
    phone: z.string().max(50).optional().or(z.literal("")),
    email: z
      .string()
      .email("Neispravan format email adrese")
      .max(100)
      .optional()
      .or(z.literal("")),
    iban: z.string().min(1, "IBAN je obavezan").max(50),
    rjesenje: z.string().max(30).optional().or(z.literal("")),
    brUgovora: z.string().max(30).optional().or(z.literal("")),
    eVisitName: z.string().max(30).optional().or(z.literal("")),
    eVisitPass: z.string().max(30).optional().or(z.literal("")),
    prioritetan: z.boolean().default(false),
  })
  .and(
    z.discriminatedUnion("vrstaIznajmljivaca", [
      // Fizička osoba — ime i prezime obavezni, datum rođenja obavezan
      z.object({
        vrstaIznajmljivaca: z.literal("fizicka_osoba"),
        surname: z.string().min(1, "Prezime je obavezno").max(30),
        name: z.string().min(1, "Ime je obavezno").max(30),
        datumRodjenja: z.string().min(1, "Datum rođenja je obavezan"),
      }),
      // Fizička osoba PDV — isto kao fizička osoba
      z.object({
        vrstaIznajmljivaca: z.literal("fizicka_osoba_pdv"),
        surname: z.string().min(1, "Prezime je obavezno").max(30),
        name: z.string().min(1, "Ime je obavezno").max(30),
        datumRodjenja: z.string().min(1, "Datum rođenja je obavezan"),
      }),
      // Obrt — naziv i vlasnik obavezni, datum rođenja nije obavezan
      z.object({
        vrstaIznajmljivaca: z.literal("obrt"),
        surname: z.string().min(1, "Naziv obrta je obavezan").max(30),
        name: z.string().min(1, "Ime vlasnika je obavezno").max(30),
        datumRodjenja: z.string().optional(),
      }),
      // Tvrtka — samo naziv obavezan, ime nije obavezno, datum rođenja nije obavezan
      z.object({
        vrstaIznajmljivaca: z.literal("tvrtka"),
        surname: z.string().min(1, "Naziv tvrtke je obavezan").max(30),
        name: z.string().max(30).optional().or(z.literal("")),
        datumRodjenja: z.string().optional(),
      }),
    ]),
  )
  .and(
    z.discriminatedUnion("tipProvizije", [
      z.object({
        tipProvizije: z.literal("P"),
        iznos: z
          .number()
          .positive("Iznos mora biti veći od 0")
          .max(99.99, "Postotak mora biti manji od 100"),
      }),
      z.object({
        tipProvizije: z.literal("I"),
        iznos: z.literal(0),
      }),
    ]),
  );

export type LandlordFormValues = z.infer<typeof landlordSchema>;
