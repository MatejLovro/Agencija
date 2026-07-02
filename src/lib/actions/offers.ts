"use server";

import { revalidatePath } from "next/cache";
import {
  getReservationForOffer,
  getServicesForOffer,
  createOffer,
  type OfferInsert,
  type OfferStavkaInsert,
} from "@/lib/db/queries/offers";

const AGENCY_ID = process.env.AGENCY_ID!;

export async function actionGetReservationForOffer(rezervacijaId: string) {
  return await getReservationForOffer(rezervacijaId, AGENCY_ID);
}

export async function actionGetServicesForOffer() {
  return await getServicesForOffer(AGENCY_ID);
}

export async function actionCreateOffer(
  offer: Omit<OfferInsert, "agencyId">,
  stavke: Omit<OfferStavkaInsert, "offerId">[],
) {
  const offerId = await createOffer({ ...offer, agencyId: AGENCY_ID }, stavke);
  revalidatePath("/rezervacije");
  revalidatePath("/ponude");
  return { offerId };
}
