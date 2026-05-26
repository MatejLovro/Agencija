import { z } from "zod";

export const accommodationSchema = z.object({
  // Basic info
  name: z.string().min(1, "Kratki naziv je obavezan").max(100),
  fullName: z.string().max(200).optional().or(z.literal("")),
  vrstaApartmana: z.enum([
    "apartman",
    "soba",
    "studio",
    "vila",
    "kuca",
    "mobilna_kucica",
  ]),
  cityId: z.number().min(1, "Grad je obavezan"),
  address: z.string().min(1, "Adresa je obavezna").max(100),
  webUrl: z
    .string()
    .url("Neispravan format URL-a")
    .max(255)
    .optional()
    .or(z.literal("")),
  brojZvjezdica: z
    .number()
    .int()
    .min(1, "Minimum 1 zvjezdica")
    .max(5, "Maksimum 5 zvjezdica"),
  kategorizacijskiBroj: z.string().max(50).optional().or(z.literal("")),

  // Capacity
  brojSoba: z.number().int().min(1, "Broj soba je obavezan"),
  brojKreveta: z.number().int().min(1, "Broj kreveta je obavezan"),
  brojPomocnihLezajeva: z.number().int().min(0).optional(),
  maxOsoba: z.number().int().min(1).optional(),

  // Status
  aktivan: z.boolean().default(true),
  prioritetan: z.boolean().default(false),
  cistiAgencija: z.boolean().default(false),

  // Description
  opis: z.string().optional().or(z.literal("")),

  // Amenities — kartica 2
  imaKlima: z.boolean().default(false),
  imaParking: z.boolean().default(false),
  imaWifi: z.boolean().default(false),
  imaRostilj: z.boolean().default(false),
  imaTerasu: z.boolean().default(false),
  pogledNaMore: z.boolean().default(false),
  kucniLjubimac: z.boolean().default(false),
  nepusaci: z.boolean().default(false),
  pristupacnoInvalidima: z.boolean().default(false),
  imaKuhinju: z.boolean().default(false),
  imaCajnuKuhinju: z.boolean().default(false),
  brojKupaonica: z.number().int().min(0).optional(),
  kupаonaTus: z.boolean().default(false),
  imaJacuzzi: z.boolean().default(false),
  kat: z.number().int().min(0).max(50).optional(),

  // Nearby / activities — kartica 3
  imaBasen: z.boolean().default(false),
  imaSpa: z.boolean().default(false),
  imaFitness: z.boolean().default(false),
  imaRestoran: z.boolean().default(false),
  imaPunjacAuta: z.boolean().default(false),
  udaljenostMore: z.number().int().min(0).optional(),
  udaljenostCentar: z.number().int().min(0).optional(),
  udaljenostTrgovina: z.number().int().min(0).optional(),
  aktivnostBicikliranje: z.boolean().default(false),
  aktivnostRonjenje: z.boolean().default(false),
  aktivnostPlaninarenje: z.boolean().default(false),
  katastarskaOpcina: z.string().max(100).optional().or(z.literal("")),
  katastarskaCestica: z.string().max(50).optional().or(z.literal("")),
});

export type AccommodationFormValues = z.infer<typeof accommodationSchema>;
