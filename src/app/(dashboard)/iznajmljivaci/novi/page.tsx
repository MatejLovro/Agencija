import { getCities } from "@/lib/db/queries/cities";
import { NoviIznajmljivacClient } from "./NoviIznajmljivacClient";

export const metadata = {
  title: "Novi iznajmljivač",
};

export default async function NoviIznajmljivacPage() {
  const cities = await getCities();
  return <NoviIznajmljivacClient cities={cities} />;
}
