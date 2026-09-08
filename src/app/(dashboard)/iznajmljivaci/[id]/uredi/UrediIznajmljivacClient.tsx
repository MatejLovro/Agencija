"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandlordForm } from "@/components/iznajmljivaci/LandlordForm";
import {
  ApartmanModal,
  type AccommodationRow,
} from "@/components/iznajmljivaci/ApartmanModal";
import {
  CjenikModal,
  type PricelistRow,
} from "@/components/iznajmljivaci/CjenikModal";
import {
  actionGetPricelistByAccommodation,
  actionGetAccommodationById,
} from "@/lib/actions/landlords";
import { isoToHrDate } from "@/lib/utils/dates";
import {
  selectableTableHeaderClass,
  selectableTableRowClass,
} from "@/lib/utils";
import type { AccommodationFormValues } from "@/lib/validations/accomodation";

interface City {
  id: number;
  name: string;
  zip?: string | null;
}

interface UrediIznajmljivacClientProps {
  cities: City[];
  landlordId: string;
  tipProvizije: "P" | "I";
  defaultValues: any;
  displayName: string;
  initialAccommodations: AccommodationRow[];
}

const vrstaApartmanaLabels: Record<string, string> = {
  apartman: "Apartman",
  soba: "Soba",
  studio: "Studio",
  vila: "Vila",
  kuca: "Kuća",
  mobilna_kucica: "Mobilna kućica",
};

export function UrediIznajmljivacClient({
  cities,
  landlordId,
  tipProvizije,
  defaultValues,
  displayName,
  initialAccommodations,
}: UrediIznajmljivacClientProps) {
  const [accommodations, setAccommodations] = useState<AccommodationRow[]>(
    initialAccommodations,
  );
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<
    string | null
  >(initialAccommodations.length > 0 ? initialAccommodations[0].id : null);
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
  const [isPendingPricelist, startPricelistTransition] = useTransition();

  const currentPricelist = selectedAccommodationId
    ? (pricelist[selectedAccommodationId] ?? [])
    : [];

  function handleSelectAccommodation(id: string) {
    setSelectedAccommodationId(id);
    setSelectedPricelistEntryId(null);
    if (!pricelist[id]) {
      startPricelistTransition(async () => {
        const entries = await actionGetPricelistByAccommodation(id);
        setPricelist((prev) => ({
          ...prev,
          [id]: entries.map((e) => ({
            id: e.id,
            dateFrom: e.dateFrom,
            dateTo: e.dateTo,
            pricePerNight: e.pricePerNight,
            landlordPrice: e.landlordPrice ?? null,
          })),
        }));
      });
    }
  }

  useEffect(() => {
    if (initialAccommodations.length > 0) {
      handleSelectAccommodation(initialAccommodations[0].id);
    }
  }, []);

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
    <div className="max-w-[1200px] w-full mx-auto px-4 py-6 bg-background">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Uredi: {displayName}</h1>
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Obavezno polje
        </p>
      </div>

      <LandlordForm
        cities={cities}
        defaultValues={defaultValues}
        landlordId={landlordId}
      />

      <div className="mt-8 mb-6" />

      <div className="grid grid-cols-2 gap-6">
        {/* LIJEVO — Tablica smještajnih jedinica */}
        <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Smještajne jedinice</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!selectedAccommodationId}
                onClick={handleEditAccommodation}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Uredi
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={!selectedAccommodationId}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Briši
              </Button>
              <Button
                type="button"
                size="sm"
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

          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className={selectableTableHeaderClass}>
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Naziv</th>
                  <th className="text-left px-3 py-2 font-medium">Vrsta</th>
                  <th className="text-center px-3 py-2 font-medium">Sobe</th>
                  <th className="text-center px-3 py-2 font-medium">
                    Kreveta
                  </th>
                  <th className="text-center px-3 py-2 font-medium">
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
                      Nema apartmana. Pritisnite Dodaj.
                    </td>
                  </tr>
                ) : (
                  accommodations.map((acc) => (
                    <tr
                      key={acc.id}
                      onClick={() => handleSelectAccommodation(acc.id)}
                      className={selectableTableRowClass(
                        selectedAccommodationId === acc.id,
                      )}
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
        <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">
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
                Upiši cijenu
              </Button>
            </div>
          </div>

          <div
            className={`border border-border rounded-md overflow-hidden ${isPendingPricelist ? "opacity-60" : ""}`}
          >
            <table className="w-full text-sm">
              <thead className={selectableTableHeaderClass}>
                <tr>
                  <th className="text-left px-3 py-2 font-medium">
                    Datum od
                  </th>
                  <th className="text-left px-3 py-2 font-medium">
                    Datum do
                  </th>
                  <th className="text-right px-3 py-2 font-medium">
                    Cijena (€)
                  </th>
                  <th className="text-right px-3 py-2 font-medium">
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
                      className={selectableTableRowClass(
                        selectedPricelistEntryId === entry.id,
                      )}
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
        landlordId={landlordId}
        tipProvizije={tipProvizije}
        landlordCityId={defaultValues.cityId}
        landlordAddress={defaultValues.address}
        cities={cities}
        defaultValues={editingAccommodation?.values}
        accommodationId={editingAccommodation?.id}
      />

      {selectedAccommodationId && (
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
          tipProvizije={tipProvizije}
          nextDateFrom={editingPricelistEntry ? undefined : nextDateFrom}
          defaultValues={editingPricelistEntry ?? undefined}
        />
      )}
    </div>
  );
}
