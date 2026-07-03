import { z } from "zod";

export const offerStavkaSchema = z.object({
  serviceId: z.string().min(1, "Odaberi uslugu"),
  serviceText: z.string().min(1, "Naziv je obavezan"),
  dodatniOpis: z.string().nullable(),
  opisOpen: z.boolean().default(false),
  kolicina: z.coerce.number().positive("Količina mora biti pozitivna"),
  cijena: z.coerce.number().min(0, "Cijena ne može biti negativna"),
  rabat: z.coerce.number().min(0).max(100).default(0),
  iznos: z.coerce.number().min(0),
  taxId: z.string().nullable(),
  taxStopa: z.coerce.number().min(0).default(0),
  bruto: z.coerce.number().min(0),
  hovered: z.boolean().default(false),
});

export const offerSchema = z.object({
  datum: z.string().min(1, "Datum je obavezan"),
  ponudaVrijedaDana: z.coerce.number().int().min(1).nullable(),
  doDatuma: z.string().nullable(),
  predujamPostotak: z.coerce.number().min(0).max(100).nullable(),
  predujam: z.coerce.number().min(0).nullable(),
  tekstNaDnu: z.string().nullable(),
  stavke: z.array(offerStavkaSchema).min(1, "Dodaj barem jednu stavku"),
});

export type OfferFormValues = z.infer<typeof offerSchema>;
export type OfferStavkaFormValues = z.infer<typeof offerStavkaSchema>;
