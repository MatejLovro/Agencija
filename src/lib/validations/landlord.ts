import { z } from "zod"

export const landlordSchema = z.object({
  surname: z
    .string()
    .min(1, "Prezime je obavezno")
    .max(30, "Prezime može imati najviše 30 znakova"),
  name: z
    .string()
    .min(1, "Ime je obavezno")
    .max(30, "Ime može imati najviše 30 znakova"),
  vrstaIznajmljivaca: z.enum(["fizicka_osoba", "obrt", "tvrtka"], {
    required_error: "Vrsta iznajmljivača je obavezna",
  }),
  oib: z
    .string()
    .length(11, "OIB mora imati točno 11 znamenki")
    .regex(/^\d{11}$/, "OIB smije sadržavati samo znamenke"),
  cityId: z.coerce
    .number({ required_error: "Grad je obavezan" })
    .int("Odaberite valjani grad")
    .positive("Odaberite grad"),
  address: z
    .string()
    .min(1, "Adresa je obavezna")
    .max(100, "Adresa može imati najviše 100 znakova"),
  phone: z
    .string()
    .min(1, "Telefon je obavezan")
    .max(50, "Broj telefona može imati najviše 50 znakova"),
  iban: z
    .string()
    .min(1, "IBAN je obavezan")
    .max(50, "IBAN može imati najviše 50 znakova"),
  rjesenje: z
    .string()
    .max(30, "Rješenje može imati najviše 30 znakova")
    .optional()
    .or(z.literal("")),
  brUgovora: z
    .string()
    .max(30, "Broj ugovora može imati najviše 30 znakova")
    .optional()
    .or(z.literal("")),
  tipProvizije: z.enum(["P", "I"], {
    required_error: "Tip provizije je obavezan",
  }),
  iznos: z.coerce
    .number({ required_error: "Iznos provizije je obavezan" })
    .positive("Iznos mora biti veći od 0")
    .max(999999.99, "Iznos je prevelik"),
  eVisitName: z
    .string()
    .max(30, "eVisit korisničko ime može imati najviše 30 znakova")
    .optional()
    .or(z.literal("")),
  eVisitPass: z
    .string()
    .max(30, "eVisit lozinka može imati najviše 30 znakova")
    .optional()
    .or(z.literal("")),
})

export type LandlordFormValues = z.infer<typeof landlordSchema>
