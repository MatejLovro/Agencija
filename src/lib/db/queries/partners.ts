// src/lib/db/queries/partners.ts
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema/partners";
import { eq, asc } from "drizzle-orm";

export type PartnerOption = {
  id: string;
  name: string;
};

export async function getPartners(agencyId: string): Promise<PartnerOption[]> {
  const rows = await db
    .select({
      id: partners.id,
      name: partners.name,
    })
    .from(partners)
    .where(eq(partners.agencyId, agencyId))
    .orderBy(asc(partners.name));

  return rows;
}

// ─── Brzo kreiranje partnera (minimalni unos, samo naziv) ───────────────────
// Ostala obavezna polja popunjavaju se placeholder vrijednostima.
// Korisnik ih kasnije dopunjava na zasebnoj stranici za partnere.

export type QuickCreatePartnerInput = {
  agencyId: string;
  name: string;
  unknownCityId: number;
};

export async function quickCreatePartner(
  input: QuickCreatePartnerInput,
): Promise<PartnerOption> {
  const [created] = await db
    .insert(partners)
    .values({
      agencyId: input.agencyId,
      name: input.name,
      type: "firma",
      oib: "00000000000",
      cityId: input.unknownCityId,
      address: "",
      state: "HRV",
      pdvStatus: "not_pdv",
      iban: "",
    })
    .returning({ id: partners.id, name: partners.name });

  return created;
}
