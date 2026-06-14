// src/components/kalendar/KalendarFiltri.tsx
"use client";

import { useState } from "react";
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
}

// Formatira Date u HR string za input "dd.mm.gggg."
function dateToHr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}.`;
}

// Parsira HR string "dd.mm.gggg." u ISO string
function hrToIso(hr: string): string {
  const clean = hr.replace(/\./g, "");
  if (clean.length !== 8) return "";
  const dd = clean.slice(0, 2);
  const mm = clean.slice(2, 4);
  const yyyy = clean.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

// Auto-format HR datuma dok korisnik tipka
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

const today = new Date();
const defaultOd = new Date(today.getFullYear(), today.getMonth(), 1);
const defaultDo = new Date(today.getFullYear(), today.getMonth() + 1, 0);

export default function KalendarFiltriForm({
  onSearch,
  isLoading = false,
}: KalendarFiltriFormProps) {
  const [datumOd, setDatumOd] = useState(dateToHr(defaultOd));
  const [datumDo, setDatumDo] = useState(dateToHr(defaultDo));
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
      {/* Glavni red filtera */}
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

        {/* Separator */}
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

        {/* Separator */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* Amenities checkboxovi */}
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

        {/* Separator */}
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

        {/* Separator */}
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

        {/* Dugme Traži — push to the right on large screens */}
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
