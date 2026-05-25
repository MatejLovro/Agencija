"use server";

import { getAccommodationsByLandlord } from "@/lib/db/queries/accommodations";
import { getPricelistByAccommodation } from "@/lib/db/queries/pricelist";

export async function fetchAccommodations(landlordId: string) {
  return getAccommodationsByLandlord(landlordId);
}

export async function fetchPricelist(accommodationId: string) {
  return getPricelistByAccommodation(accommodationId);
}
