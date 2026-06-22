// src/lib/actions/partners.ts
"use server";

import {
  getPartners,
  quickCreatePartner,
  PartnerOption,
} from "@/lib/db/queries/partners";
import {
  partnerQuickCreateSchema,
  PartnerQuickCreateFormValues,
} from "@/lib/validations/partner";

export async function actionGetPartners(): Promise<PartnerOption[]> {
  return getPartners(process.env.AGENCY_ID!);
}

export type QuickCreatePartnerResult =
  | { success: true; partner: PartnerOption }
  | { success: false; error: string };

export async function actionQuickCreatePartner(
  values: PartnerQuickCreateFormValues,
): Promise<QuickCreatePartnerResult> {
  const parsed = partnerQuickCreateSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Naziv partnera je obavezan." };
  }

  try {
    const partner = await quickCreatePartner({
      agencyId: process.env.AGENCY_ID!,
      name: parsed.data.name,
      unknownCityId: parseInt(process.env.UNKNOWN_CITY_ID!, 10),
    });
    return { success: true, partner };
  } catch (e) {
    return {
      success: false,
      error: "Greška pri spremanju partnera. Pokušajte ponovno.",
    };
  }
}
