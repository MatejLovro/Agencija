import { notFound } from "next/navigation";
import { getCities } from "@/lib/db/queries/cities";
import { getLandlordById } from "@/lib/db/queries/landlords";
import { LandlordForm } from "@/components/iznajmljivaci/LandlordForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Uredi iznajmljivača",
};

export default async function UrediIznajmljivacaPage({ params }: Props) {
  const { id } = await params;
  const [cities, landlord] = await Promise.all([
    getCities(),
    getLandlordById(id),
  ]);

  if (!landlord) notFound();

  // Map DB record to form default values
  const defaultValues = {
    vrstaIznajmljivaca: landlord.vrstaIznajmljivaca,
    surname: landlord.surname,
    name: landlord.name ?? "",
    datumRodjenja: landlord.datumRodjenja ?? "",
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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Uredi: {displayName}</h1>
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Obavezno polje
        </p>
      </div>

      <LandlordForm
        cities={cities}
        defaultValues={defaultValues}
        landlordId={id}
      />
    </div>
  );
}
