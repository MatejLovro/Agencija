import { z } from "zod";

export const landlordSchema = z
  .object({
    surname: z.string().min(1, "Prezime je obavezno").max(30),
    name: z.string().min(1, "Ime je obavezno").max(30),
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
    vrstaIznajmljivaca: z.enum(["fizicka_osoba", "obrt", "tvrtka"]),
    rjesenje: z.string().max(30).optional().or(z.literal("")),
    brUgovora: z.string().max(30).optional().or(z.literal("")),
    eVisitName: z.string().max(30).optional().or(z.literal("")),
    eVisitPass: z.string().max(30).optional().or(z.literal("")),
    prioritetan: z.boolean().default(false),
  })
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
