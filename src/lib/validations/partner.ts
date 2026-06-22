// src/lib/validations/partner.ts
import { z } from "zod";

// Minimalna shema za brzi inline unos partnera (samo naziv).
// Ostala obavezna polja baze popunjavaju se placeholder vrijednostima
// u Server Actionu — korisnik ih kasnije dopunjava na stranici za partnere.
export const partnerQuickCreateSchema = z.object({
  name: z.string().min(1, "Naziv je obavezan"),
});

export type PartnerQuickCreateFormValues = z.infer<
  typeof partnerQuickCreateSchema
>;
