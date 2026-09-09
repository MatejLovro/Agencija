"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, ArrowLeft, ChevronDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LandlordForm } from "@/components/iznajmljivaci/LandlordForm";
import { UnsavedChangesDialog } from "@/components/iznajmljivaci/UnsavedChangesDialog";
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
import { formatHrDecimal } from "@/lib/utils/decimal";
import {
  selectableTableHeaderClass,
  selectableTableRowClass,
} from "@/lib/utils";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import type { AccommodationFormValues } from "@/lib/validations/accomodation";
import type { LandlordFormValues } from "@/lib/validations/landlord";

interface City {
  id: number;
  name: string;
  zip?: string | null;
}

interface UrediIznajmljivacClientProps {
  cities: City[];
  landlordId: string;
  tipProvizije: "P" | "I";
  defaultValues: LandlordFormValues;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDirty, setIsDirty] = useState(false);

  // Pročitano sinkrono pri prvom renderu (ne u useEffect-u) da
  // LandlordForm-ov mount-time autofocus efekt odmah dobije ispravnu
  // vrijednost. justCreated znači da smo upravo stigli s create ->
  // canonical edit prijelaza (LandlordForm.onSubmit), ne da je korisnik
  // stvarno kliknuo "Promijeni" — u tom slučaju edit-mode autofocus na
  // Prezime se preskače.
  const [skipInitialFocus] = useState(
    () => searchParams.get("justCreated") === "1",
  );
  const cleanedUrlRef = useRef(false);

  useEffect(() => {
    if (cleanedUrlRef.current) return;
    cleanedUrlRef.current = true;
    if (searchParams.get("justCreated") === "1") {
      router.replace(`/iznajmljivaci/${landlordId}/uredi`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToList = useCallback(() => {
    router.push(`/iznajmljivaci?selected=${landlordId}`);
  }, [router, landlordId]);

  const { dialogOpen, requestExit, cancelExit, confirmExit } =
    useUnsavedChangesGuard(isDirty, goToList);

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

  // "Kopiraj cjenik na prazne" je enabled samo ako označena jedinica ima
  // cjenik I postoji barem jedna druga jedinica istog iznajmljivača bez
  // cjenika. hasPricelist dolazi iz getAccommodationsByLandlord (agregat
  // preko JOIN-a) — ne iz lazy-loadanog pricelist state-a, jer taj state
  // za neodabrane jedinice ne postoji pa se ne smije tumačiti kao "prazan".
  const selectedAccommodation = accommodations.find(
    (a) => a.id === selectedAccommodationId,
  );
  const canCopyPricelistToEmpty =
    !!selectedAccommodation?.hasPricelist &&
    accommodations.some(
      (a) => a.id !== selectedAccommodationId && !a.hasPricelist,
    );

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

  function handleCopyPricelistToEmpty() {
    // Placeholder za 3. korak: confirmation dijalog + server action koji
    // kopira redove cjenika iz označene jedinice u sve jedinice istog
    // iznajmljivača koje trenutno nemaju nijedan redak cjenika.
  }

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 py-6 bg-background">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Uredi: {displayName}</h1>
        <Button type="button" variant="outline" size="sm" onClick={requestExit}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Povratak na popis
        </Button>
      </div>

      <LandlordForm
        cities={cities}
        defaultValues={defaultValues}
        landlordId={landlordId}
        onDirtyChange={setIsDirty}
        onRequestExit={requestExit}
        skipInitialFocus={skipInitialFocus}
      />

      <p className="text-sm text-muted-foreground mt-2">
        <span className="text-destructive">*</span> Obavezno polje
      </p>

      <div className="mt-8 mb-6" />

      <div className="grid grid-cols-[3fr_2fr] gap-6">
        {/* LIJEVO — Tablica smještajnih jedinica */}
        <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Smještajne jedinice</h2>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="sm" variant="outline">
                    Cjenik
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    disabled={!canCopyPricelistToEmpty}
                    onSelect={handleCopyPricelistToEmpty}
                  >
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Kopiraj cjenik na prazne
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <th className="text-left px-3 py-2 font-medium whitespace-nowrap w-px">
                    Datum od
                  </th>
                  <th className="text-left px-3 py-2 font-medium whitespace-nowrap w-px">
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
                      <td className="px-3 py-2 whitespace-nowrap">
                        {isoToHrDate(entry.dateFrom)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {isoToHrDate(entry.dateTo)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium whitespace-nowrap">
                        {formatHrDecimal(parseFloat(entry.pricePerNight), 2)} €
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground whitespace-nowrap">
                        {entry.landlordPrice
                          ? `${formatHrDecimal(parseFloat(entry.landlordPrice), 2)} €`
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
              prev.map((a) =>
                a.id === row.id ? { ...row, hasPricelist: a.hasPricelist } : a,
              ),
            );
          } else {
            setAccommodations((prev) => [
              ...prev,
              { ...row, hasPricelist: false },
            ]);
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
            if (!editingPricelistEntry) {
              setAccommodations((prev) =>
                prev.map((a) =>
                  a.id === selectedAccommodationId
                    ? { ...a, hasPricelist: true }
                    : a,
                ),
              );
            }
            setCjenikModalOpen(false);
            setEditingPricelistEntry(null);
          }}
          accommodationId={selectedAccommodationId}
          tipProvizije={tipProvizije}
          nextDateFrom={editingPricelistEntry ? undefined : nextDateFrom}
          defaultValues={editingPricelistEntry ?? undefined}
        />
      )}

      <UnsavedChangesDialog
        open={dialogOpen}
        onCancel={cancelExit}
        onConfirm={confirmExit}
      />
    </div>
  );
}
