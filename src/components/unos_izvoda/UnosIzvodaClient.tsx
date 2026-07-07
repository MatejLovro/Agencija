"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { isoToHrDate } from "@/lib/utils/dates";
import {
  actionUcitajIzvod,
  actionPovezRezervaciju,
  actionProknjizi,
} from "@/lib/actions/izvod";
import { IzvodTmpRow } from "@/lib/db/queries/izvod-tmp";
import { RezervacijaCombobox, RezervacijaOption } from "./RezervacijaCombobox";

type Props = {
  initialRows: IzvodTmpRow[];
  reservations: Array<{
    id: string;
    redniBroj: number;
    guestName: string;
    guestSurname: string;
    dateFrom: string;
  }>;
};

function formatOfferBroj(row: IzvodTmpRow): string {
  if (!row.offerBroj || !row.offerYear) return "";
  const year = row.offerYear.slice(0, 4);
  return `${year}/${row.offerBroj}`;
}

export function UnosIzvodaClient({ initialRows, reservations }: Props) {
  const [rows, setRows] = useState<IzvodTmpRow[]>(initialRows);
  const [samoUplate, setSamoUplate] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reservationOptions: RezervacijaOption[] = reservations;

  function refreshRows() {
    // Server actions already revalidatePath("/unos_izvoda"); router refresh
    // nije dovoljan za server-fetched initial rows u client komponenti,
    // pa ručno tražimo svježe podatke preko iste akcije korištene na serveru.
    // Napomena: ovo zahtijeva da actionGetIzvodTmp bude pozivljiv i s klijenta
    // (već jest, "use server" export).
    import("@/lib/actions/izvod").then(({ actionGetIzvodTmp }) => {
      actionGetIzvodTmp().then(setRows);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await actionUcitajIzvod(formData);
      if (result.success) {
        setMessage({
          type: "success",
          text: `Učitano ${result.count} stavki iz izvoda.`,
        });
        refreshRows();
      } else {
        setMessage({ type: "error", text: result.error });
      }
      e.target.value = "";
    });
  }

  function handleRezervacijaChange(
    row: IzvodTmpRow,
    rezervationId: string | null,
  ) {
    // Optimistic update
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, rezervationId } : r)),
    );

    startTransition(async () => {
      const result = await actionPovezRezervaciju(row.id, rezervationId);
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        refreshRows(); // vrati stvarno stanje ako je spremanje palo
      }
    });
  }

  function handleProknjizi() {
    startTransition(async () => {
      const result = await actionProknjizi();
      if (result.success) {
        setMessage({
          type: "success",
          text:
            result.insertedCount < result.linkedCount
              ? `Proknjiženo ${result.insertedCount} od ${result.linkedCount} povezanih uplata — ostale su već ranije proknjižene.`
              : `Proknjiženo ${result.insertedCount} uplata.`,
        });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  const visibleRows = samoUplate
    ? rows.filter((r) => Number(r.uplaceno) >= 0)
    : rows;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unos izvoda</h1>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={samoUplate}
            onCheckedChange={(v) => setSamoUplate(!!v)}
          />
          Prikaži samo uplate
        </label>
      </div>

      {message && (
        <div
          className={cn(
            "text-sm rounded-md px-3 py-2",
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700",
          )}
        >
          {message.text}
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Broj izvoda</th>
              <th className="p-2 text-left">Datum</th>
              <th className="p-2 text-left">Uplatitelj</th>
              <th className="p-2 text-left">Poziv na broj</th>
              <th className="p-2 text-left">Opis plaćanja</th>
              <th className="p-2 text-right">Uplaćeno</th>
              <th className="p-2 text-left">Rezervacija</th>
              <th className="p-2 text-left">Ponuda</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const isNegative = Number(row.uplaceno) < 0;
              return (
                <tr
                  key={row.id}
                  className={cn("border-t", isNegative && "bg-red-50")}
                >
                  <td className="p-2">
                    {row.year}/{row.brojIzvoda}
                  </td>
                  <td className="p-2">{isoToHrDate(row.datum)}</td>
                  <td className="p-2">{row.platitelj}</td>
                  <td className="p-2">{row.pozivNaBroj}</td>
                  <td className="p-2">{row.opisPlacanja}</td>
                  <td className="p-2 text-right">
                    {Number(row.uplaceno).toFixed(2)}
                  </td>
                  <td className="p-2 min-w-[280px]">
                    <RezervacijaCombobox
                      options={reservationOptions}
                      value={row.rezervationId}
                      onChange={(id) => handleRezervacijaChange(row, id)}
                    />
                  </td>
                  <td className="p-2 bg-muted/50 text-muted-foreground">
                    {formatOfferBroj(row)}
                  </td>
                </tr>
              );
            })}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-4 text-center text-muted-foreground"
                >
                  Nema učitanih podataka. Učitaj izvod da započneš.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          Učitaj izvod
        </Button>
        <Button
          onClick={handleProknjizi}
          disabled={isPending || rows.every((r) => !r.rezervationId)}
        >
          Proknjiži
        </Button>
      </div>
    </div>
  );
}
