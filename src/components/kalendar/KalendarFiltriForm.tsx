// src/components/kalendar/KalendarFiltriForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search } from "lucide-react";
import { KalendarFiltri } from "@/types/kalendar";

interface KalendarFiltriFormProps {
  onSearch: (filtri: KalendarFiltri) => void;
  isLoading?: boolean;
  defaultDatumOd: string; // ISO string iz parent komponente
  defaultDatumDo: string; // ISO string iz parent komponente
}

// ─── Date helpers ─────────────────────────────────────────────────────────

function isoToHr(iso: string): string {
  if (!iso || iso.length < 10) return "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}.${mm}.${yyyy}.`;
}

function hrToIso(hr: string): string {
  const clean = hr.replace(/\./g, "");
  if (clean.length !== 8) return "";
  const dd = clean.slice(0, 2);
  const mm = clean.slice(2, 4);
  const yyyy = clean.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

function autoFormatHrDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    result += digits[i];
    if (i === 1 || i === 3) result += ".";
  }
  if (digits.length === 8) result += ".";
  return result;
}

// ─── Komponenta ──────────────────────────────────────────────────────────────

export default function KalendarFiltriForm({
  onSearch,
  isLoading = false,
  defaultDatumOd,
  defaultDatumDo,
}: KalendarFiltriFormProps) {
  const [datumOd, setDatumOd] = useState(isoToHr(defaultDatumOd));
  const [datumDo, setDatumDo] = useState(isoToHr(defaultDatumDo));
  const [brojSoba, setBrojSoba] = useState("");
  const [brojKreveta, setBrojKreveta] = useState("");
  const [brojPomLezajeva, setBrojPomLezajeva] = useState("");
  const [tipRezervacije, setTipRezervacije] = useState<"sve" | "potvrdjene" | "nepotvrdjene">("sve");
  const [imaKlima, setImaKlima] = useState(false);
  const [imaParking, setImaParking] = useState(false);
  const [imaWifi, setImaWifi] = useState(false);
  const [kucniLjubimac, setKucniLjubimac] = useState(false);
  const [pogledNaMore, setPogledNaMore] = useState(false);
  const [samoPrioritetan, setSamoPrioritetan] = useState(false);

  // Sinkroniziramo s parent datumima kad se promijene (npr. inicijalni load)
  useEffect(() => {
    setDatumOd(isoToHr(defaultDatumOd));
  }, [defaultDatumOd]);

  useEffect(() => {
    setDatumDo(isoToHr(defaultDatumDo));
  }, [defaultDatumDo]);

  function handleSearch() {
    const isoOd = hrToIso(datumOd);
    const isoDo = hrToIso(datumDo);
    if (!isoOd || !isoDo) return;

    onSearch({
      gradId: null,
      landlordId: null,
      datumOd: isoOd,
      datumDo: isoDo,
      brojSoba: brojSoba ? parseInt(brojSoba) : null,
      brojKreveta: brojKreveta ? parseInt(brojKreveta) : null,
      brojPomocnihLezajeva: brojPomLezajeva ? parseInt(brojPomLezajeva) : null,
      samoPotvrdjene: tipRezervacije === "potvrdjene",
      samoNepotvrdjene: tipRezervacije === "nepotvrdjene",
      imaKlima,
      imaParking,
      imaWifi,
      kucniLjubimac,
      pogledNaMore,
      samoPrioritetan,
    });
  }

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">

        {/* Datumi */}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-500">Od datuma</Label>
            <Input
              className="h-8 w-28 text-sm font-mono"
              value={datumOd}
              onChange={(e) => setDatumOd(autoFormatHrDate(e.target.value))}
              placeholder="dd.mm.gggg."
              maxLength={11}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-500">Do datuma</Label>
            <Input
              className="h-8 w-28 text-sm font-mono"
              value={datumDo}
              onChange={(e) => setDatumDo(autoFormatHrDate(e.target.value))}
              placeholder="dd.mm.gggg."
              maxLength={11}
            />
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* Kapaciteti */}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-500">Soba</Label>
            <Input
              className="h-8 w-14 text-sm text-center"
              type="number"
              min={0}
              value={brojSoba}
              onChange={(e) => setBrojSoba(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-500">Kreveta</Label>
            <Input
              className="h-8 w-14 text-sm text-center"
              type="number"
              min={0}
              value={brojKreveta}
              onChange={(e) => setBrojKreveta(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-500">Pom. ležajeva</Label>
            <Input
              className="h-8 w-14 text-sm text-center"
              type="number"
              min={0}
              value={brojPomLezajeva}
              onChange={(e) => setBrojPomLezajeva(e.target.value)}
            />
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* Amenities */}
        <div className="flex items-center gap-4">
          {[
            { label: "Klima", value: imaKlima, set: setImaKlima },
            { label: "Parking", value: imaParking, set: setImaParking },
            { label: "WiFi", value: imaWifi, set: setImaWifi },
            { label: "Ljubimac", value: kucniLjubimac, set: setKucniLjubimac },
            { label: "Pogled na more", value: pogledNaMore, set: setPogledNaMore },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Checkbox
                id={`cb-${label}`}
                checked={value}
                onCheckedChange={(v) => set(Boolean(v))}
                className="h-4 w-4"
              />
              <Label htmlFor={`cb-${label}`} className="text-xs text-slate-600 cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* Tip rezervacije */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-slate-500">Prikaz</Label>
          <RadioGroup
            value={tipRezervacije}
            onValueChange={(v) => setTipRezervacije(v as typeof tipRezervacije)}
            className="flex items-center gap-3"
          >
            {[
              { value: "sve", label: "Sve" },
              { value: "potvrdjene", label: "Samo potvrđene" },
              { value: "nepotvrdjene", label: "Samo nepotvrđene" },
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center gap-1.5">
                <RadioGroupItem value={value} id={`radio-${value}`} className="h-3.5 w-3.5" />
                <Label htmlFor={`radio-${value}`} className="text-xs text-slate-600 cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* Prioritetni */}
        <div className="flex items-center gap-1.5 pb-0.5">
          <Checkbox
            id="cb-prioritetan"
            checked={samoPrioritetan}
            onCheckedChange={(v) => setSamoPrioritetan(Boolean(v))}
            className="h-4 w-4"
          />
          <Label htmlFor="cb-prioritetan" className="text-xs text-slate-600 cursor-pointer">
            Samo prioritetni
          </Label>
        </div>

        {/* Dugme Traži */}
        <div className="flex-1 flex justify-end">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="h-8 px-5 text-sm gap-2 bg-slate-700 hover:bg-slate-800 text-white"
          >
            <Search className="h-3.5 w-3.5" />
            Traži
          </Button>
        </div>
      </div>
    </div>
  );
}
