import { getCities } from "@/lib/db/queries/cities";
import { LandlordForm } from "@/components/iznajmljivaci/LandlordForm";

export const metadata = {
  title: "Novi iznajmljivač",
};

export default async function NoviIznajmljivacPage() {
  const cities = await getCities();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Novi iznajmljivač</h1>
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Obavezno polje
        </p>
      </div>

      <LandlordForm cities={cities} />
    </div>
  );
}
