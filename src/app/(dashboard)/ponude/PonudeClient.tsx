"use client";

import type { OfferTableRow } from "@/lib/db/queries/offers";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Send } from "lucide-react";

import { useState } from "react";

interface Props {
  ponude: OfferTableRow[];
}

function isoToHr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

export default function PonudeClient({ ponude }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = ponude.find((p) => p.id === selectedId) ?? null;

  function handleIspisj() {
    if (!selected) return;
    window.open(`/api/ponude/${selected.id}/pdf`, "_blank");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Naslov */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-base font-semibold text-slate-800 tracking-wide">
          Ponude
        </h1>
        <span className="text-xs text-slate-400">{ponude.length} zapisa</span>
      </div>

      {/* Tablica */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-12">
                Broj
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200 w-24">
                Datum ponude
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200 w-24">
                Vrijedi do
              </th>
              <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-16">
                Br. rez.
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                Prezime
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                Ime
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                Partner
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                Iznajmljivač
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                Smještaj
              </th>
              <th className="px-3 py-2 text-left font-medium border-b border-slate-200 w-36">
                Od-Do
              </th>
              <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-20">
                Cijena
              </th>
              <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-20">
                Avans
              </th>
              <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-20">
                Uplaćeno
              </th>
              <th className="px-3 py-2 text-center font-medium border-b border-slate-200 w-16">
                Poslana
              </th>
            </tr>
          </thead>
          <tbody>
            {ponude.length === 0 && (
              <tr>
                <td
                  colSpan={14}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nema ponuda.
                </td>
              </tr>
            )}
            {ponude.map((row) => (
              <tr
                key={row.id}
                onClick={() =>
                  setSelectedId(row.id === selectedId ? null : row.id)
                }
                className={[
                  "cursor-pointer border-b border-slate-100",
                  row.id === selectedId
                    ? "ring-2 ring-inset ring-slate-400 bg-slate-50"
                    : "hover:bg-slate-50",
                ].join(" ")}
              >
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {row.broj}
                </td>
                <td className="px-3 py-1.5 tabular-nums">
                  {isoToHr(row.datum)}
                </td>
                <td className="px-3 py-1.5 tabular-nums">
                  {row.doDatuma ? isoToHr(row.doDatuma) : "—"}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {row.rezervacijaBroj}
                </td>
                <td className="px-3 py-1.5 font-medium">{row.guestSurname}</td>
                <td className="px-3 py-1.5">{row.guestName}</td>
                <td className="px-3 py-1.5">{row.partnerNaziv ?? "—"}</td>
                <td className="px-3 py-1.5">
                  {row.landlordSurname} {row.landlordName}
                </td>
                <td className="px-3 py-1.5">{row.accommodationName}</td>
                <td className="px-3 py-1.5 tabular-nums">
                  {isoToHr(row.dateFrom)} - {isoToHr(row.dateTo)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {row.cijena.toFixed(2)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {row.predujam ? parseFloat(row.predujam).toFixed(2) : "—"}
                </td>
                <td className="px-3 py-1.5 text-right">—</td>
                <td className="px-3 py-1.5 text-center">
                  {row.poslana ? "✓" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dugmad */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex gap-3">
        <Button
          variant="default"
          size="sm"
          disabled={!selected}
          onClick={handleIspisj}
        >
          <Printer className="h-4 w-4 mr-1" />
          Ispiši
        </Button>
        <Button variant="default" size="sm" disabled={!selected}>
          <Eye className="h-4 w-4 mr-1" />
          Prikaži
        </Button>
        <Button variant="default" size="sm" disabled={!selected}>
          <Send className="h-4 w-4 mr-1" />
          Pošalji
        </Button>
      </div>
    </div>
  );
}
