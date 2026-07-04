"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CirclePlus, CircleX } from "lucide-react";
import {
  ServiceCombobox,
  type ServiceOption,
} from "@/components/line-items/ServiceCombobox";
import { Textarea } from "@/components/ui/textarea";

// ─── Tipovi ───────────────────────────────────────────────────────────────────

export type StavkaRow = {
  id: string; // lokalni id za key prop
  serviceId: string;
  serviceText: string;
  dodatniOpis: string | null;
  kolicina: number;
  cijena: number;
  rabat: number;
  iznos: number;
  taxId: string | null;
  taxStopa: number;
  taxNaziv: string | null;
  bruto: number;
};

interface Props {
  services: ServiceOption[];
  onChange: (stavke: StavkaRow[]) => void;
  onAddNewService?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcIznos(kolicina: number, cijena: number, rabat: number): number {
  return kolicina * cijena * (1 - rabat / 100);
}

function calcBruto(iznos: number, taxStopa: number): number {
  return iznos * (1 + taxStopa / 100);
}

function newStavka(): StavkaRow {
  return {
    id: crypto.randomUUID(),
    serviceId: "",
    serviceText: "",
    dodatniOpis: null,
    kolicina: 1,
    cijena: 0,
    rabat: 0,
    iznos: 0,
    taxId: null,
    taxStopa: 0,
    taxNaziv: null,
    bruto: 0,
  };
}

// ─── NumericInput ─────────────────────────────────────────────────────────────

function NumericInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (val: number) => void;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(String(value));

  return (
    <input
      className={
        className ??
        "h-7 text-xs text-right w-full border rounded px-2 bg-background"
      }
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={() => {
        const parsed = parseFloat(localValue);
        const final = isNaN(parsed) ? 0 : parsed;
        setLocalValue(String(final));
        onChange(final);
      }}
    />
  );
}

// ─── StavkaRowComponent ───────────────────────────────────────────────────────

function StavkaRowComponent({
  stavka,
  services,
  onUpdate,
  onRemove,
  onAddNewService,
}: {
  stavka: StavkaRow;
  services: ServiceOption[];
  onUpdate: (updated: StavkaRow) => void;
  onRemove: () => void;
  onAddNewService?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [opisOpen, setOpisOpen] = useState(false);

  function update(partial: Partial<StavkaRow>) {
    const next = { ...stavka, ...partial };
    // Rekalkulacija
    const iznos = calcIznos(next.kolicina, next.cijena, next.rabat);
    const bruto = calcBruto(iznos, next.taxStopa);
    onUpdate({ ...next, iznos, bruto });
  }

  function handleServiceChange(id: string) {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const cijena = parseFloat(service.cijena ?? "0");
    const taxStopa = parseFloat(service.taxStopa ?? "0");
    const iznos = calcIznos(stavka.kolicina, cijena, stavka.rabat);
    const bruto = calcBruto(iznos, taxStopa);
    onUpdate({
      ...stavka,
      serviceId: id,
      serviceText: service.naziv,
      cijena,
      taxId: service.taxId,
      taxStopa,
      taxNaziv: service.taxNaziv,
      iznos,
      bruto,
    });
  }

  return (
    <tr className="border-b last:border-0 hover:bg-muted/20">
      {/* NAZIV */}
      <td className="px-3 py-2">
        <div
          className="flex items-center gap-2"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex-1">
            <ServiceCombobox
              services={services}
              value={stavka.serviceId}
              onChange={handleServiceChange}
              onAddNew={onAddNewService}
            />
          </div>
          {hovered && stavka.serviceId && !opisOpen && (
            <button
              type="button"
              onClick={() => setOpisOpen(true)}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Dodaj opis stavke"
            >
              <CirclePlus className="h-4 w-4" />
            </button>
          )}
          {opisOpen && (
            <button
              type="button"
              onClick={() => setOpisOpen(false)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Zatvori opis"
            >
              <CircleX className="h-4 w-4" />
            </button>
          )}
        </div>
        {opisOpen && (
          <Textarea
            className="mt-1 text-xs min-h-[60px]"
            placeholder="Dodajte opis stavke"
            value={stavka.dodatniOpis ?? ""}
            onChange={(e) =>
              onUpdate({ ...stavka, dodatniOpis: e.target.value || null })
            }
            autoFocus
          />
        )}
      </td>

      {/* KOLIČINA */}
      <td className="px-3 py-2">
        <NumericInput
          value={stavka.kolicina}
          onChange={(val) => update({ kolicina: val })}
        />
      </td>

      {/* CIJENA */}
      <td className="px-3 py-2">
        <NumericInput
          value={stavka.cijena}
          onChange={(val) => update({ cijena: val })}
        />
      </td>

      {/* POPUST */}
      <td className="px-3 py-2">
        <NumericInput
          value={stavka.rabat}
          onChange={(val) => update({ rabat: val })}
        />
      </td>

      {/* IZNOS BEZ PDV-a */}
      <td className="px-3 py-2 text-right text-sm tabular-nums font-medium">
        {stavka.iznos.toFixed(2)}
      </td>

      {/* POREZ */}
      <td className="px-3 py-2 text-sm text-muted-foreground">
        {stavka.taxId ? `${stavka.taxStopa.toFixed(0)}%` : "—"}
      </td>

      {/* UKUPNO */}
      <td className="px-3 py-2 text-right text-sm tabular-nums font-medium">
        {stavka.bruto.toFixed(2)}
      </td>

      {/* BRISANJE */}
      <td className="px-3 py-2 text-center">
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
          title="Ukloni stavku"
        >
          <CircleX className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// ─── PonudaStavkeTable ────────────────────────────────────────────────────────

export default function PonudaStavkeTable({
  services,
  onChange,
  onAddNewService,
}: Props) {
  const [stavke, setStavke] = useState<StavkaRow[]>([]);

  function updateStavke(next: StavkaRow[]) {
    setStavke(next);
    onChange(next);
  }

  function handleAdd() {
    updateStavke([...stavke, newStavka()]);
  }

  function handleUpdate(index: number, updated: StavkaRow) {
    const next = stavke.map((s, i) => (i === index ? updated : s));
    updateStavke(next);
  }

  function handleRemove(index: number) {
    updateStavke(stavke.filter((_, i) => i !== index));
  }

  const lastHasService =
    stavke.length === 0 || stavke[stavke.length - 1].serviceId !== "";

  return (
    <div className="border rounded-lg overflow-visible">
      <div className="bg-muted px-4 py-2">
        <span className="text-sm font-semibold">Tablica stavke</span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-3 py-2 w-[30%]">NAZIV</th>
            <th className="text-right px-3 py-2 w-[9%]">KOLIČINA</th>
            <th className="text-right px-3 py-2 w-[10%]">CIJENA</th>
            <th className="text-right px-3 py-2 w-[9%]">POPUST %</th>
            <th className="text-right px-3 py-2 w-[12%]">IZNOS BEZ PDV-a</th>
            <th className="text-left px-3 py-2 w-[10%]">POREZ</th>
            <th className="text-right px-3 py-2 w-[10%]">UKUPNO</th>
            <th className="px-3 py-2 w-[5%]"></th>
          </tr>
        </thead>
        <tbody>
          {stavke.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="text-center text-muted-foreground py-6 text-sm"
              >
                Nema stavki. Klikni "Dodaj novi red" za dodavanje.
              </td>
            </tr>
          )}
          {stavke.map((stavka, index) => (
            <StavkaRowComponent
              key={stavka.id}
              stavka={stavka}
              services={services}
              onUpdate={(updated) => handleUpdate(index, updated)}
              onRemove={() => handleRemove(index)}
              onAddNewService={onAddNewService}
            />
          ))}
        </tbody>
      </table>

      <div className="px-4 py-3 border-t bg-muted/30 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!lastHasService}
        >
          <Plus className="h-4 w-4 mr-1" />
          Dodaj novi red
        </Button>
        <Button type="button" variant="outline" size="sm">
          Izračunaj smještaj
        </Button>
      </div>
    </div>
  );
}
