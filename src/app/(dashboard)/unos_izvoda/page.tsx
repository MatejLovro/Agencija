import { actionGetIzvodTmp } from "@/lib/actions/izvod";
import { actionGetReservationsForCombobox } from "@/lib/actions/reservations";
import { UnosIzvodaClient } from "@/components/unos_izvoda/UnosIzvodaClient";

export default async function UnosIzvodaPage() {
  const [rows, reservations] = await Promise.all([
    actionGetIzvodTmp(),
    actionGetReservationsForCombobox(),
  ]);

  return <UnosIzvodaClient initialRows={rows} reservations={reservations} />;
}
