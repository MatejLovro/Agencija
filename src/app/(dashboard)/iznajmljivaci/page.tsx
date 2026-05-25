import { getLandlords } from "@/lib/db/queries/landlords";
import { getAccommodationsByLandlord } from "@/lib/db/queries/accommodations";
import { getPricelistByAccommodation } from "@/lib/db/queries/pricelist";
import { IznajmljivaciClient } from "./iznajmljivaci-client";

export default async function IznajmljivaciPage() {
  const landlords = await getLandlords();

  // Inicijalni podaci za prvog iznajmljivača
  const firstLandlord = landlords[0] ?? null;
  const initialAccommodations = firstLandlord
    ? await getAccommodationsByLandlord(firstLandlord.id)
    : [];
  const firstAccommodation = initialAccommodations[0] ?? null;
  const initialPricelist = firstAccommodation
    ? await getPricelistByAccommodation(firstAccommodation.id)
    : [];

  return (
    <IznajmljivaciClient
      landlords={landlords}
      initialAccommodations={initialAccommodations}
      initialPricelist={initialPricelist}
    />
  );
}
