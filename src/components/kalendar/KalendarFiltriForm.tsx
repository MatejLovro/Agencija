// src/components/kalendar/KalendarFiltriForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { KalendarFiltri } from "@/types/kalendar.types";
import type { CityRow } from "@/lib/db/queries/cities";
import type { LandlordRow } from "@/lib/db/queries/landlords";

interface KalendarFiltriFormProps {
  onSearch: (filtri: KalendarFiltri) => void;
  isLoading?: boolean;
  defaultDatumOd: string; // ISO string iz parent komponente
  defaultDatumDo: string; // ISO string iz parent komponente
  cities: CityRow[];
  landlords: LandlordRow[];
}

const VRSTE_APARTMANA = [
  { value: "apartman", label: "Apartman" },
  { value: "soba", label: "Soba" },
  { value: "studio", label: "Studio" },
  { value: "vila", label: "Vila" },
  { value: "kuca", label: "Kuća" },
  { value: "mobilna_kucica", label: "Mobilna kućica" },
] as const;

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
  cities,
  landlords,
}: KalendarFiltriFormProps) {
  const [gradId, setGradId] = useState<number | null>(null);
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [datumOd, setDatumOd] = useState(isoToHr(defaultDatumOd));
  const [datumDo, setDatumDo] = useState(isoToHr(defaultDatumDo));
  const [brojSoba, setBrojSoba] = useState("");
  const [brojKreveta, setBrojKreveta] = useState("");
  const [brojPomLezajeva, setBrojPomLezajeva] = useState("");
  const [tipRezervacije, setTipRezervacije] = useState<"sve" | "potvrdjene" | "nepotvrdjene">("sve");
  const [samoPrioritetan, setSamoPrioritetan] = useState(false);
  const [detaljnije, setDetaljnije] = useState(false);

  // Amenities
  const [imaKlima, setImaKlima] = useState(false);
  const [imaParking, setImaParking] = useState(false);
  const [imaWifi, setImaWifi] = useState(false);
  const [kucniLjubimac, setKucniLjubimac] = useState(false);
  const [imaTerasu, setImaTerasu] = useState(false);
  const [pogledNaMore, setPogledNaMore] = useState(false);
  const [imaPunjacAuta, setImaPunjacAuta] = useState(false);

  // Udaljenosti
  const [udaljenostMoreOd, setUdaljenostMoreOd] = useState("");
  const [udaljenostMoreDo, setUdaljenostMoreDo] = useState("");
  const [udaljenostCentarOd, setUdaljenostCentarOd] = useState("");
  const [udaljenostCentarDo, setUdaljenostCentarDo] = useState("");
  const [udaljenostTrgovinaOd, setUdaljenostTrgovinaOd] = useState("");
  const [udaljenostTrgovinaDo, setUdaljenostTrgovinaDo] = useState("");

  // Aktivnosti
  const [aktivnostBicikliranje, setAktivnostBicikliranje] = useState(false);
  const [aktivnostRonjenje, setAktivnostRonjenje] = useState(false);
  const [aktivnostPlaninarenje, setAktivnostPlaninarenje] = useState(false);

  // Vrsta / zvjezdice
  const [vrstaApartmana, setVrstaApartmana] = useState<string>("");
  const [brojZvjezdica, setBrojZvjezdica] = useState<string>("");

  // Sinkroniziramo s parent datumima kad se promijene (npr. inicijalni load)
  useEffect(() => {
    setDatumOd(isoToHr(defaultDatumOd));
  }, [defaultDatumOd]);

  useEffect(() => {
    setDatumDo(isoToHr(defaultDatumDo));
  }, [defaultDatumDo]);

  function handleDetaljnijeChange(checked: boolean) {
    if (!checked) {
      setImaKlima(false);
      setImaParking(false);
      setImaWifi(false);
      setKucniLjubimac(false);
      setImaTerasu(false);
      setPogledNaMore(false);
      setImaPunjacAuta(false);
      setUdaljenostMoreOd("");
      setUdaljenostMoreDo("");
      setUdaljenostCentarOd("");
      setUdaljenostCentarDo("");
      setUdaljenostTrgovinaOd("");
      setUdaljenostTrgovinaDo("");
      setAktivnostBicikliranje(false);
      setAktivnostRonjenje(false);
      setAktivnostPlaninarenje(false);
      setVrstaApartmana("");
      setBrojZvjezdica("");
    }
    setDetaljnije(checked);
  }

  function handleSearch() {
    const isoOd = hrToIso(datumOd);
    const isoDo = hrToIso(datumDo);
    if (!isoOd || !isoDo) return;

    onSearch({
      gradId,
      landlordId,
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
      imaTerasu,
      imaPunjacAuta,
      aktivnostBicikliranje,
      aktivnostRonjenje,
      aktivnostPlaninarenje,
      vrstaApartmana: vrstaApartmana
        ? (vrstaApartmana as KalendarFiltri["vrstaApartmana"])
        : null,
      brojZvjezdica: brojZvjezdica ? parseInt(brojZvjezdica) : null,
      udaljenostMoreOd: udaljenostMoreOd ? parseInt(udaljenostMoreOd) : null,
      udaljenostMoreDo: udaljenostMoreDo ? parseInt(udaljenostMoreDo) : null,
      udaljenostCentarOd: udaljenostCentarOd
        ? parseInt(udaljenostCentarOd)
        : null,
      udaljenostCentarDo: udaljenostCentarDo
        ? parseInt(udaljenostCentarDo)
        : null,
      udaljenostTrgovinaOd: udaljenostTrgovinaOd
        ? parseInt(udaljenostTrgovinaOd)
        : null,
      udaljenostTrgovinaDo: udaljenostTrgovinaDo
        ? parseInt(udaljenostTrgovinaDo)
        : null,
    });
  }

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">

        {/* Grad / Iznajmljivač */}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-500">Grad</Label>
            <Combobox
              className="h-8 w-36 text-sm"
              value={gradId}
              onChange={(v) => setGradId(v === null ? null : Number(v))}
              options={cities.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Svi gradovi"
              clearLabel="Svi gradovi"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-500">Iznajmljivač</Label>
            <Combobox
              className="h-8 w-44 text-sm"
              value={landlordId}
              onChange={(v) => setLandlordId(v === null ? null : String(v))}
              options={landlords.map((l) => ({
                value: l.id,
                label: `${l.surname} ${l.name}`,
              }))}
              placeholder="Svi iznajmljivači"
              clearLabel="Svi iznajmljivači"
            />
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

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

        {/* Detaljnije toggle */}
        <div className="flex items-center gap-1.5 pb-0.5">
          <Checkbox
            id="cb-detaljnije"
            checked={detaljnije}
            onCheckedChange={(v) => handleDetaljnijeChange(Boolean(v))}
            className="h-4 w-4"
          />
          <Label htmlFor="cb-detaljnije" className="text-xs text-slate-600 cursor-pointer">
            Detaljnije:
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

      {/* Detaljnije panel */}
      {detaljnije && (
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3 pt-3 mt-3 border-t border-slate-100">
          {/* Amenities */}
          <div className="flex items-center gap-4">
            {[
              { label: "Ima klimu", value: imaKlima, set: setImaKlima },
              { label: "Ima parking", value: imaParking, set: setImaParking },
              { label: "Internet pristup", value: imaWifi, set: setImaWifi },
              { label: "Kućni ljubimac", value: kucniLjubimac, set: setKucniLjubimac },
              { label: "Ima terasu", value: imaTerasu, set: setImaTerasu },
              { label: "Pogled na more", value: pogledNaMore, set: setPogledNaMore },
              { label: "Punjač el. automobila", value: imaPunjacAuta, set: setImaPunjacAuta },
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

          {/* Udaljenosti */}
          <div className="flex items-end gap-4">
            {[
              { label: "Od mora", od: udaljenostMoreOd, setOd: setUdaljenostMoreOd, do_: udaljenostMoreDo, setDo: setUdaljenostMoreDo },
              { label: "Od centra", od: udaljenostCentarOd, setOd: setUdaljenostCentarOd, do_: udaljenostCentarDo, setDo: setUdaljenostCentarDo },
              { label: "Od trgovine", od: udaljenostTrgovinaOd, setOd: setUdaljenostTrgovinaOd, do_: udaljenostTrgovinaDo, setDo: setUdaljenostTrgovinaDo },
            ].map(({ label, od, setOd, do_, setDo }) => (
              <div key={label} className="flex flex-col gap-1">
                <Label className="text-xs text-slate-500">{label}</Label>
                <div className="flex items-center gap-1">
                  <Input
                    className="h-8 w-16 text-sm text-center"
                    type="number"
                    min={0}
                    value={od}
                    onChange={(e) => setOd(e.target.value)}
                  />
                  <span className="text-xs text-slate-400">-</span>
                  <Input
                    className="h-8 w-16 text-sm text-center"
                    type="number"
                    min={0}
                    value={do_}
                    onChange={(e) => setDo(e.target.value)}
                  />
                  <span className="text-xs text-slate-400">m</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Aktivnosti */}
          <div className="flex items-center gap-4">
            {[
              { label: "Biciklizam", value: aktivnostBicikliranje, set: setAktivnostBicikliranje },
              { label: "Ronjenje", value: aktivnostRonjenje, set: setAktivnostRonjenje },
              { label: "Planinarenje", value: aktivnostPlaninarenje, set: setAktivnostPlaninarenje },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Checkbox
                  id={`cb-akt-${label}`}
                  checked={value}
                  onCheckedChange={(v) => set(Boolean(v))}
                  className="h-4 w-4"
                />
                <Label htmlFor={`cb-akt-${label}`} className="text-xs text-slate-600 cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Vrsta apartmana / zvjezdice */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-slate-500">Vrsta apartmana</Label>
              <Select value={vrstaApartmana} onValueChange={setVrstaApartmana}>
                <SelectTrigger className="h-8 w-36 text-sm">
                  <SelectValue placeholder="Sve vrste" />
                </SelectTrigger>
                <SelectContent>
                  {VRSTE_APARTMANA.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-slate-500">Broj zvjezdica</Label>
              <Select value={brojZvjezdica} onValueChange={setBrojZvjezdica}>
                <SelectTrigger className="h-8 w-24 text-sm">
                  <SelectValue placeholder="Sve" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
