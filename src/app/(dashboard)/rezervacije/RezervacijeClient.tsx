// src/app/(dashboard)/rezervacije/RezervacijeClient.tsx
"use client";

import { useState, useEffect } from "react";
import { actionGetReservations } from "@/lib/actions/reservations";
import { RezervacijaTableRow } from "@/lib/db/queries/reservations";
import { isoToHrDate } from "@/lib/utils/dates";
import {
  FileText,
  CheckCircle,
  Ticket,
  LogIn,
  Ban,
  Trash2,
  Search,
  X,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRowStyle(row: RezervacijaTableRow): string {
  if (row.stornirana) return "bg-red-100 text-red-800";
  if (row.realizirana) return "bg-emerald-100 text-emerald-800";
  if (row.status === "potvrdjena") return "bg-amber-100 text-amber-800";
  return "bg-white text-slate-800";
}

function statusLabel(row: RezervacijaTableRow): string {
  if (row.stornirana) return "Stornirana";
  if (row.realizirana) return "Realizirana";
  if (row.status === "potvrdjena") return "Potvrđena";
  return "Aktivna";
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
function ToolbarButton({
  icon: Icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border-none",
        "bg-transparent cursor-pointer transition-colors duration-150",
        "hover:bg-white/10",
        danger ? "text-red-400" : "text-neutral-400",
      ].join(" ")}
    >
      <Icon size={13} aria-hidden="true" />
      {label}
    </button>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 bg-neutral-800 rounded-full px-1 py-1">
      {children}
    </div>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-neutral-300/30 mx-1" />;
}

function Toolbar() {
  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-t border-slate-200 bg-slate-50">
      {/* Grupa 1 */}
      <ToolbarGroup>
        <ToolbarButton icon={FileText} label="Izrada ponude" />
        <ToolbarButton icon={CheckCircle} label="Potvrda prijave" />
        <ToolbarButton icon={Ticket} label="Voucher" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Grupa 2 */}
      <ToolbarGroup>
        <ToolbarButton icon={LogIn} label="Izrada prijave" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Grupa 3 */}
      <ToolbarGroup>
        <ToolbarButton icon={Ban} label="Storno" danger />
        <ToolbarButton icon={Trash2} label="Brisanje" danger />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Grupa 4 */}
      <ToolbarGroup>
        <ToolbarButton icon={Search} label="Traži" />
        <ToolbarButton icon={X} label="Odustani" />
      </ToolbarGroup>
    </div>
  );
}

// ─── Komponenta ──────────────────────────────────────────────────────────────

export default function RezervacijeClient() {
  const [rezervacije, setRezervacije] = useState<RezervacijaTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await actionGetReservations();
        setRezervacije(data);
      } catch {
        setError("Greška pri učitavanju rezervacija.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const selected = rezervacije.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-full">
      {/* Naslov */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-base font-semibold text-slate-800 tracking-wide">
          Rezervacije
        </h1>
        <span className="text-xs text-slate-400">
          {!isLoading && `${rezervacije.length} zapisa`}
        </span>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-100 bg-white text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-white border border-slate-300" />
          Aktivne
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
          Potvrđene
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
          Realizirane
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
          Stornirane
        </span>
      </div>

      {/* Tablica */}
      <div className="flex-1 overflow-auto bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <div className="text-sm text-slate-500">Učitavanje...</div>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-32 text-sm text-red-500">
            {error}
          </div>
        )}
        {!error && !isLoading && (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-14">
                  Br.
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200 w-24">
                  Vrijedi do
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200 w-24">
                  Status
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                  Prezime
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                  Ime
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                  Iznajmljivač
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200">
                  Kapacitet
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200 w-24">
                  Datum od
                </th>
                <th className="px-3 py-2 text-left font-medium border-b border-slate-200 w-24">
                  Datum do
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-12">
                  Odrasl.
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-10">
                  &lt;18
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-10">
                  Djeca
                </th>
                <th className="px-3 py-2 text-right font-medium border-b border-slate-200 w-20">
                  Iznos (€)
                </th>
              </tr>
            </thead>
            <tbody>
              {rezervacije.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Nema rezervacija.
                  </td>
                </tr>
              )}
              {rezervacije.map((row) => (
                <tr
                  key={row.id}
                  onClick={() =>
                    setSelectedId(row.id === selectedId ? null : row.id)
                  }
                  className={[
                    getRowStyle(row),
                    "cursor-pointer border-b border-slate-100",
                    row.id === selectedId
                      ? "ring-2 ring-inset ring-slate-400"
                      : "hover:brightness-95",
                  ].join(" ")}
                >
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {row.redniBroj}
                  </td>
                  <td className="px-3 py-1.5">
                    {row.rezervationValid
                      ? isoToHrDate(row.rezervationValid)
                      : "—"}
                  </td>
                  <td className="px-3 py-1.5">{statusLabel(row)}</td>
                  <td className="px-3 py-1.5 font-medium">
                    {row.guestSurname}
                  </td>
                  <td className="px-3 py-1.5">{row.guestName}</td>
                  <td className="px-3 py-1.5">
                    {row.landlordSurname} {row.landlordName}
                  </td>
                  <td className="px-3 py-1.5">{row.accommodationName}</td>
                  <td className="px-3 py-1.5 tabular-nums">
                    {isoToHrDate(row.dateFrom)}
                  </td>
                  <td className="px-3 py-1.5 tabular-nums">
                    {isoToHrDate(row.dateTo)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {row.adults}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {row.teens18}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {row.children}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {row.price ? Number(row.price).toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Canvas — detalji odabrane rezervacije */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 min-h-[140px]">
        {selected ? (
          <div className="text-xs text-slate-400 italic">
            Detalji rezervacije #{selected.redniBroj} — canvas dolazi ovdje
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Odaberite rezervaciju za prikaz detalja.
          </div>
        )}
      </div>

      {/* Toolbar */}
      <Toolbar />
    </div>
  );
}
