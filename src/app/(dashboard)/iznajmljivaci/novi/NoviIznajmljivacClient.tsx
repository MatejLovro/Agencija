"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandlordForm } from "@/components/iznajmljivaci/LandlordForm";
import { ApartmanModal } from "@/components/iznajmljivaci/ApartmanModal";
import {
  CjenikModal,
  type PricelistRow,
} from "@/components/iznajmljivaci/CjenikModal";
import { isoToHrDate } from "@/lib/utils/dates";
import { actionGetAccommodationById } from "@/lib/actions/landlords";
import type { AccommodationFormValues } from "@/lib/validations/accomodation";

interface City {
  id: number;
  name: string;
  zip?: string | null;
}

interface AccommodationRow {
  id: string;
  name: string;
  vrstaApartmana: string;
  brojSoba: number;
  brojKreveta: number;
  brojPomocnihLezajeva: number | null;
}

const vrstaApartmanaLabels: Record<string, string> = {
  apartman: "Apartman",
  soba: "Soba",
  studio: "Studio",
  vila: "Vila",
  kuca: "Kuća",
  mobilna_kucica: "Mobilna kućica",
};

interface NoviIznajmljivacClientProps {
  cities: City[];
}

export function NoviIznajmljivacClient({
  cities,
}: NoviIznajmljivacClientProps) {
  const [savedLandlord, setSavedLandlord] = useState<{
    id: string;
    tipProvizije: "P" | "I";
    cityId: number;
    address: string;
  } | null>(null);

  const [accommodations, setAccommodations] = useState<AccommodationRow[]>([]);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<
    string | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<{
    id: string;
    values: AccommodationFormValues;
  } | null>(null);

  const [cjenikModalOpen, setCjenikModalOpen] = useState(false);
  const [pricelist, setPricelist] = useState<Record<string, PricelistRow[]>>(
    {},
  );
  const [nextDateFrom, setNextDateFrom] = useState<string>("");
  const [selectedPricelistEntryId, setSelectedPricelistEntryId] = useState<
    string | null
  >(null);
  const [editingPricelistEntry, setEditingPricelistEntry] =
    useState<PricelistRow | null>(null);

  const isLandlordSaved = savedLandlord !== null;

  const currentPricelist = selectedAccommodationId
    ? (pricelist[selectedAccommodationId] ?? [])
    : [];

  function handleLandlordSaved(
    landlordId: string,
    tipProvizije: "P" | "I",
    cityId: number,
    address: string,
  ) {
    setSavedLandlord({ id: landlordId, tipProvizije, cityId, address });
  }

  function getNextDateFrom(): string {
    if (!selectedAccommodationId) return "";
    const entries = pricelist[selectedAccommodationId] ?? [];
    if (entries.length === 0) return "";
    const lastEntry = entries.reduce((latest, entry) =>
      entry.dateTo > latest.dateTo ? entry : latest,
    );
    const lastDate = new Date(lastEntry.dateTo);
    lastDate.setDate(lastDate.getDate() + 1);
    const yyyy = lastDate.getFullYear();
    const mm = String(lastDate.getMonth() + 1).padStart(2, "0");
    const dd = String(lastDate.getDate()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy}.`;
  }

  async function handleEditAccommodation() {
    if (!selectedAccommodationId) return;
    const acc = await actionGetAccommodationById(selectedAccommodationId);
    if (!acc) return;

    setEditingAccommodation({
      id: acc.id,
      values: {
        name: acc.name,
        fullName: acc.fullName ?? "",
        vrstaApartmana: acc.vrstaApartmana,
        cityId: acc.cityId,
        address: acc.address,
        webUrl: acc.webUrl ?? "",
        brojZvjezdica: acc.brojZvjezdica,
        kategorizacijskiBroj: acc.kategorizacijskiBroj ?? "",
        brojSoba: acc.brojSoba,
        brojKreveta: acc.brojKreveta,
        brojPomocnihLezajeva: acc.brojPomocnihLezajeva ?? undefined,
        maxOsoba: acc.maxOsoba ?? undefined,
        aktivan: acc.aktivan,
        prioritetan: acc.prioritetan,
        cistiAgencija: acc.cistiAgencija,
        opis: acc.opis ?? "",
        imaKlima: acc.imaKlima,
        imaParking: acc.imaParking,
        imaWifi: acc.imaWifi,
        imaRostilj: acc.imaRostilj,
        imaTerasu: acc.imaTerasu,
        pogledNaMore: acc.pogledNaMore,
        kucniLjubimac: acc.kucniLjubimac,
        nepusaci: acc.nepusaci,
        pristupacnoInvalidima: acc.pristupacnoInvalidima,
        imaKuhinju: acc.imaKuhinju,
        imaCajnuKuhinju: acc.imaCajnuKuhinju,
        brojKupaonica: acc.brojKupaonica ?? undefined,
        kupаonaTus: acc.kupаonaTus,
        imaJacuzzi: acc.imaJacuzzi,
        kat: acc.kat ?? undefined,
        imaBasen: acc.imaBasen,
        imaSpa: acc.imaSpa,
        imaFitness: acc.imaFitness,
        imaRestoran: acc.imaRestoran,
        imaPunjacAuta: acc.imaPunjacAuta,
        udaljenostMore: acc.udaljenostMore ?? undefined,
        udaljenostCentar: acc.udaljenostCentar ?? undefined,
        udaljenostTrgovina: acc.udaljenostTrgovina ?? undefined,
        aktivnostBicikliranje: acc.aktivnostBicikliranje,
        aktivnostRonjenje: acc.aktivnostRonjenje,
        aktivnostPlaninarenje: acc.aktivnostPlaninarenje,
        katastarskaOpcina: acc.katastarskaOpcina ?? "",
        katastarskaCestica: acc.katastarskaCestica ?? "",
      },
    });
    setModalOpen(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Novi iznajmljivač</h1>
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Obavezno polje
        </p>
      </div>

      <LandlordForm
        cities={cities}
        onSaved={handleLandlordSaved}
        submitDisabled={isLandlordSaved}
      />

      <div className="mt-8 mb-6 border-t" />

      <div className="grid grid-cols-2 gap-6">
        {/* LIJEVO — Tablica apartmana */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Apartmani
            </h2>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!isLandlordSaved || !selectedAccommodationId}
                onClick={handleEditAccommodation}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Uredi
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={!isLandlordSaved || !selectedAccommodationId}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Briši
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!isLandlordSaved}
                onClick={() => {
                  setEditingAccommodation(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Dodaj
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                    Naziv
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                    Vrsta
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-muted-foreground">
                    Sobe
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-muted-foreground">
                    Kreveta
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-muted-foreground">
                    Pom. l.
                  </th>
                </tr>
              </thead>
              <tbody>
                {accommodations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-muted-foreground py-8 text-sm"
                    >
                      {isLandlordSaved
                        ? "Nema apartmana. Pritisnite Dodaj."
                        : "Najprije spremite podatke o iznajmljivaču."}
                    </td>
                  </tr>
                ) : (
                  accommodations.map((acc) => (
                    <tr
                      key={acc.id}
                      onClick={() => {
                        setSelectedAccommodationId(acc.id);
                        setSelectedPricelistEntryId(null);
                      }}
                      className={`cursor-pointer border-b last:border-0 transition-colors ${
                        selectedAccommodationId === acc.id
                          ? "bg-primary/10"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <td className="px-3 py-2">{acc.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {vrstaApartmanaLabels[acc.vrstaApartmana] ??
                          acc.vrstaApartmana}
                      </td>
                      <td className="px-3 py-2 text-center">{acc.brojSoba}</td>
                      <td className="px-3 py-2 text-center">
                        {acc.brojKreveta}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {acc.brojPomocnihLezajeva ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DESNO — Tablica cjenika */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {selectedAccommodationId
                ? `Cjenik — ${accommodations.find((a) => a.id === selectedAccommodationId)?.name ?? ""}`
                : "Cjenik"}
            </h2>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!selectedPricelistEntryId}
                onClick={() => {
                  const entry = currentPricelist.find(
                    (e) => e.id === selectedPricelistEntryId,
                  );
                  if (entry) {
                    setEditingPricelistEntry(entry);
                    setCjenikModalOpen(true);
                  }
                }}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Uredi
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={!selectedPricelistEntryId}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Briši
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!selectedAccommodationId}
                onClick={() => {
                  setEditingPricelistEntry(null);
                  setNextDateFrom(getNextDateFrom());
                  setCjenikModalOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Upiši cjenik
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                    Datum od
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                    Datum do
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    Cijena (€)
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    Cijena Izn.
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPricelist.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-muted-foreground py-8 text-sm"
                    >
                      {selectedAccommodationId
                        ? "Nema cjenika."
                        : "Odaberite apartman."}
                    </td>
                  </tr>
                ) : (
                  currentPricelist.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedPricelistEntryId(entry.id)}
                      className={`cursor-pointer border-b last:border-0 transition-colors ${
                        selectedPricelistEntryId === entry.id
                          ? "bg-primary/10"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <td className="px-3 py-2">
                        {isoToHrDate(entry.dateFrom)}
                      </td>
                      <td className="px-3 py-2">{isoToHrDate(entry.dateTo)}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        {parseFloat(entry.pricePerNight).toFixed(2)} €
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {entry.landlordPrice
                          ? `${parseFloat(entry.landlordPrice).toFixed(2)} €`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modali */}
      {savedLandlord && (
        <ApartmanModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingAccommodation(null);
          }}
          onSaved={(row) => {
            if (editingAccommodation) {
              setAccommodations((prev) =>
                prev.map((a) => (a.id === row.id ? row : a)),
              );
            } else {
              setAccommodations((prev) => [...prev, row]);
              setSelectedAccommodationId(row.id);
            }
            setModalOpen(false);
            setEditingAccommodation(null);
          }}
          landlordId={savedLandlord.id}
          tipProvizije={savedLandlord.tipProvizije}
          landlordCityId={savedLandlord.cityId}
          landlordAddress={savedLandlord.address}
          cities={cities}
          defaultValues={editingAccommodation?.values}
          accommodationId={editingAccommodation?.id}
        />
      )}

      {savedLandlord && selectedAccommodationId && (
        <CjenikModal
          open={cjenikModalOpen}
          onClose={() => {
            setCjenikModalOpen(false);
            setEditingPricelistEntry(null);
          }}
          onSaved={(row) => {
            setPricelist((prev) => ({
              ...prev,
              [selectedAccommodationId]: editingPricelistEntry
                ? (prev[selectedAccommodationId] ?? []).map((e) =>
                    e.id === row.id ? row : e,
                  )
                : [...(prev[selectedAccommodationId] ?? []), row],
            }));
            setCjenikModalOpen(false);
            setEditingPricelistEntry(null);
          }}
          accommodationId={selectedAccommodationId}
          tipProvizije={savedLandlord.tipProvizije}
          nextDateFrom={editingPricelistEntry ? undefined : nextDateFrom}
          defaultValues={editingPricelistEntry ?? undefined}
        />
      )}
    </div>
  );
}
