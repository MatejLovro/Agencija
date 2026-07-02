"use client";

import { useFieldArray, useWatch, useController } from "react-hook-form";
import type {
  Control,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import type { OfferFormValues } from "@/lib/validations/offer";
import type { ServiceForOffer } from "@/lib/db/queries/offers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CirclePlus, CircleX } from "lucide-react";

interface Props {
  control: Control<OfferFormValues>;
  services: ServiceForOffer[];
  setValue: UseFormSetValue<OfferFormValues>;
  getValues: UseFormGetValues<OfferFormValues>;
}

function calcIznos(kolicina: number, cijena: number, rabat: number): number {
  return kolicina * cijena * (1 - rabat / 100);
}

function calcBruto(iznos: number, taxStopa: number): number {
  return iznos * (1 + taxStopa / 100);
}

function DodatniOpisField({
  index,
  control,
  setValue,
}: {
  index: number;
  control: Control<OfferFormValues>;
  setValue: UseFormSetValue<OfferFormValues>;
}) {
  const { field } = useController({
    control,
    name: `stavke.${index}.dodatniOpis`,
  });

  return (
    <Textarea
      className="mt-1 text-xs min-h-[60px]"
      placeholder="Dodajte opis stavke"
      value={field.value ?? ""}
      onChange={(e) => field.onChange(e.target.value || null)}
      autoFocus
    />
  );
}

// Combobox za odabir usluge s pretragom
function ServiceCombobox({
  services,
  value,
  onChange,
}: {
  services: ServiceForOffer[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = services.filter((s) =>
    s.naziv.toLowerCase().includes(query.toLowerCase()),
  );

  const selected = services.find((s) => s.id === value);

  // Zatvori na klik izvan
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Prikazni red — klik otvara dropdown */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <span
          className={selected ? "text-sm" : "text-sm text-muted-foreground"}
        >
          {selected ? selected.naziv : "Odaberi uslugu"}
        </span>
        <svg
          className="h-4 w-4 text-muted-foreground shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-white border border-slate-200 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži..."
              className="h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  handleSelect(filtered[0].id);
                }
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Nema rezultata.
              </div>
            )}
            {filtered.map((s) => (
              <div
                key={s.id}
                className="px-3 py-2 cursor-pointer hover:bg-slate-100 text-sm"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s.id);
                }}
              >
                <div>{s.naziv}</div>
                {s.cijena && (
                  <div className="text-xs text-muted-foreground">
                    €{parseFloat(s.cijena).toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Jedan redak tablice stavki
function StavkaRow({
  index,
  services,
  control,
  setValue,
  getValues,
  onRemove,
}: {
  index: number;
  services: ServiceForOffer[];
  control: Control<OfferFormValues>;
  setValue: UseFormSetValue<OfferFormValues>;
  getValues: UseFormGetValues<OfferFormValues>;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Watch vrijednosti za reaktivan prikaz
  const serviceId = useWatch({ control, name: `stavke.${index}.serviceId` });
  const opisOpen = useWatch({ control, name: `stavke.${index}.opisOpen` });
  const kolicina = useWatch({ control, name: `stavke.${index}.kolicina` });
  const cijena = useWatch({ control, name: `stavke.${index}.cijena` });
  const rabat = useWatch({ control, name: `stavke.${index}.rabat` });
  const iznos = useWatch({ control, name: `stavke.${index}.iznos` });
  const bruto = useWatch({ control, name: `stavke.${index}.bruto` });
  const taxStopa = useWatch({ control, name: `stavke.${index}.taxStopa` });
  const taxId = useWatch({ control, name: `stavke.${index}.taxId` });
  const dodatniOpis = useWatch({
    control,
    name: `stavke.${index}.dodatniOpis`,
  });

  function recalc(
    overrides: Partial<{
      kolicina: number;
      cijena: number;
      rabat: number;
      taxStopa: number;
    }> = {},
  ) {
    const k = overrides.kolicina ?? (parseFloat(String(kolicina)) || 0);
    const c = overrides.cijena ?? (parseFloat(String(cijena)) || 0);
    const r = overrides.rabat ?? (parseFloat(String(rabat)) || 0);
    const t = overrides.taxStopa ?? (parseFloat(String(taxStopa)) || 0);
    const i = calcIznos(k, c, r);
    const b = calcBruto(i, t);
    setValue(`stavke.${index}.iznos`, i);
    setValue(`stavke.${index}.bruto`, b);
  }

  function handleServiceChange(id: string) {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const c = parseFloat(service.cijena ?? "0");
    const t = parseFloat(service.taxStopa ?? "0");
    const k = parseFloat(String(getValues(`stavke.${index}.kolicina`))) || 1;
    const r = parseFloat(String(getValues(`stavke.${index}.rabat`))) || 0;
    setValue(`stavke.${index}.serviceId`, id);
    setValue(`stavke.${index}.serviceText`, service.naziv);
    setValue(`stavke.${index}.cijena`, c);
    setValue(`stavke.${index}.taxId`, service.taxId);
    setValue(`stavke.${index}.taxStopa`, t);
    recalc({ cijena: c, taxStopa: t, kolicina: k, rabat: r });
  }

  const izonosVal = parseFloat(String(iznos)) || 0;
  const brutoVal = parseFloat(String(bruto)) || 0;

  return (
    <>
      <tr
        className="border-b last:border-0 hover:bg-muted/20"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* NAZIV */}
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ServiceCombobox
                services={services}
                value={serviceId}
                onChange={handleServiceChange}
              />
            </div>
            {/* ➕ ikona — on hover, samo ako je usluga odabrana */}
            {hovered && serviceId && !opisOpen && (
              <button
                type="button"
                onClick={() => setValue(`stavke.${index}.opisOpen`, true)}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Dodaj opis stavke"
              >
                <CirclePlus className="h-4 w-4" />
              </button>
            )}
            {/* ✖ ikona kad je opis otvoren */}
            {opisOpen && (
              <button
                type="button"
                onClick={() => setValue(`stavke.${index}.opisOpen`, false)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Zatvori opis"
              >
                <CircleX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Polje za dodatni opis — expandable */}
          {opisOpen && (
            <DodatniOpisField
              index={index}
              control={control}
              setValue={setValue}
            />
          )}
        </td>

        {/* KOLIČINA */}
        <td className="px-3 py-2">
          <Input
            className="h-7 text-xs text-right w-full"
            value={kolicina}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setValue(`stavke.${index}.kolicina`, val);
              recalc({ kolicina: val });
            }}
          />
        </td>

        {/* CIJENA */}
        <td className="px-3 py-2">
          <Input
            className="h-7 text-xs text-right w-full"
            value={cijena}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setValue(`stavke.${index}.cijena`, val);
              recalc({ cijena: val });
            }}
          />
        </td>

        {/* POPUST */}
        <td className="px-3 py-2">
          <Input
            className="h-7 text-xs text-right w-full"
            value={rabat}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setValue(`stavke.${index}.rabat`, val);
              recalc({ rabat: val });
            }}
          />
        </td>

        {/* IZNOS BEZ PDV-a */}
        <td className="px-3 py-2 text-right text-sm font-medium tabular-nums">
          {izonosVal.toFixed(2)}
        </td>

        {/* POREZ */}
        <td className="px-3 py-2 text-sm text-muted-foreground">
          {taxId ? `${parseFloat(String(taxStopa)).toFixed(0)}%` : "—"}
        </td>

        {/* UKUPNO */}
        <td className="px-3 py-2 text-right text-sm font-medium tabular-nums">
          {brutoVal.toFixed(2)}
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
    </>
  );
}

// Glavna komponenta
export default function PonudaStavkeTable({
  control,
  services,
  setValue,
  getValues,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stavke",
  });

  function handleAddRow() {
    append({
      serviceId: "",
      serviceText: "",
      dodatniOpis: null,
      opisOpen: false,
      kolicina: 1,
      cijena: 0,
      rabat: 0,
      iznos: 0,
      taxId: null,
      taxStopa: 0,
      bruto: 0,
    });
  }

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
          {fields.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="text-center text-muted-foreground py-6 text-sm"
              >
                Nema stavki. Klikni "Dodaj novi red" za dodavanje.
              </td>
            </tr>
          )}
          {fields.map((field, index) => (
            <StavkaRow
              key={field.id}
              index={index}
              services={services}
              control={control}
              setValue={setValue}
              getValues={getValues}
              onRemove={() => remove(index)}
            />
          ))}
        </tbody>
      </table>

      <div className="px-4 py-3 border-t bg-muted/30 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
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
