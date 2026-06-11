import { notFound } from "next/navigation";
import { getCities } from "@/lib/db/queries/cities";
import { getLandlordById } from "@/lib/db/queries/landlords";
import { getAccommodationsByLandlord } from "@/lib/db/queries/accommodations";
import { isoToHrDate } from "@/lib/utils/dates";
import { UrediIznajmljivacClient } from "./UrediIznajmljivacClient";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Uredi iznajmljivača",
};

export default async function UrediIznajmljivacaPage({ params }: Props) {
  const { id } = await params;
  const [cities, landlord, accommodations] = await Promise.all([
    getCities(),
    getLandlordById(id),
    getAccommodationsByLandlord(id),
  ]);

  if (!landlord) notFound();

  const defaultValues = {
    vrstaIznajmljivaca: landlord.vrstaIznajmljivaca,
    surname: landlord.surname,
    name: landlord.name ?? "",
    datumRodjenja: isoToHrDate(landlord.datumRodjenja),
    oib: landlord.oib,
    cityId: landlord.cityId,
    address: landlord.address,
    phone: landlord.phone ?? "",
    email: landlord.email ?? "",
    iban: landlord.iban,
    rjesenje: landlord.rjesenje ?? "",
    brUgovora: landlord.brUgovora ?? "",
    tipProvizije: landlord.tipProvizije,
    iznos: parseFloat(landlord.iznos),
    eVisitName: landlord.eVisitName ?? "",
    eVisitPass: landlord.eVisitPass ?? "",
    prioritetan: landlord.prioritetan,
  };

  const displayName =
    landlord.vrstaIznajmljivaca === "tvrtka" ||
    landlord.vrstaIznajmljivaca === "obrt"
      ? landlord.surname
      : `${landlord.surname} ${landlord.name ?? ""}`.trim();

  return (
    <UrediIznajmljivacClient
      cities={cities}
      landlordId={id}
      tipProvizije={landlord.tipProvizije}
      defaultValues={defaultValues}
      displayName={displayName}
      initialAccommodations={accommodations}
    />
  );
}
