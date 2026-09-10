"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LandlordRow } from "@/lib/db/queries/landlords";
import type { AccommodationRow } from "@/lib/db/queries/accommodations";
import type { PricelistRow } from "@/lib/db/queries/pricelist";
import { fetchAccommodations, fetchPricelist } from "./actions";
import { formatHrDecimal } from "@/lib/utils/decimal";
import {
  cn,
  selectableTableHeaderClass,
  selectableTableRowClass,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  landlords: LandlordRow[];
  initialAccommodations: AccommodationRow[];
  initialPricelist: PricelistRow[];
}

// ---------------------------------------------------------------------------
// Pomoćne funkcije
// ---------------------------------------------------------------------------

type SortField = "surname" | "name" | "oib" | "city";
type SortDir = "asc" | "desc";

const vrstaApartmanaLabels: Record<string, string> = {
  apartman: "Apartman",
  soba: "Soba",
  studio: "Studio",
  vila: "Vila",
  kuca: "Kuća",
  mobilna_kucica: "Mobilna kućica",
};

function vrstaLabel(vrsta: string) {
  const map: Record<string, string> = {
    fizicka_osoba: "Fizička osoba",
    fizicka_osoba_pdv: "Fizička osoba (PDV)",
    obrt: "Obrt",
    tvrtka: "Tvrtka",
  };
  return map[vrsta] ?? vrsta;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

// ---------------------------------------------------------------------------
// Komponenta
// ---------------------------------------------------------------------------

export function IznajmljivaciClient({
  landlords,
  initialAccommodations,
  initialPricelist,
}: Props) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("surname");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selectedLandlord, setSelectedLandlord] = useState<LandlordRow>(
    landlords[0],
  );
  const [accommodations, setAccommodations] = useState<AccommodationRow[]>(
    initialAccommodations,
  );
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<AccommodationRow | null>(initialAccommodations[0] ?? null);
  const [pricelist, setPricelist] = useState<PricelistRow[]>(initialPricelist);

  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRowRef = useRef<HTMLTableRowElement>(null);
  const appliedSelectedParam = useRef(false);

  // Primjena ?selected=<id> pri povratku s detaljne forme iznajmljivača —
  // izvršava se točno jednom, neovisno o kasnijem čišćenju URL-a niže.
  useEffect(() => {
    if (appliedSelectedParam.current) return;
    appliedSelectedParam.current = true;

    const selectedId = searchParams.get("selected");
    if (!selectedId) return;

    const landlord = landlords.find((l) => l.id === selectedId);
    if (!landlord) return;

    handleSelectLandlord(landlord);
    router.replace("/iznajmljivaci", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedLandlord?.id]);

  // Odabir iznajmljivača — dohvati njegove apartmane
  function handleSelectLandlord(landlord: LandlordRow) {
    setSelectedLandlord(landlord);
    startTransition(async () => {
      const apts = await fetchAccommodations(landlord.id);
      setAccommodations(apts);
      const first = apts[0] ?? null;
      setSelectedAccommodation(first);
      if (first) {
        const prices = await fetchPricelist(first.id);
        setPricelist(prices);
      } else {
        setPricelist([]);
      }
    });
  }

  // Odabir apartmana — dohvati njegov cjenik
  function handleSelectAccommodation(apt: AccommodationRow) {
    setSelectedAccommodation(apt);
    startTransition(async () => {
      const prices = await fetchPricelist(apt.id);
      setPricelist(prices);
    });
  }

  // Sort i filter
  const filtered = landlords
    .filter((l) => {
      const q = search.toLowerCase();
      return (
        l.surname.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = "";
      let bv = "";
      if (sortField === "surname") {
        av = a.surname;
        bv = b.surname;
      }
      if (sortField === "name") {
        av = a.name;
        bv = b.name;
      }
      if (sortField === "oib") {
        av = a.oib;
        bv = b.oib;
      }
      if (sortField === "city") {
        av = a.city?.name ?? "";
        bv = b.city?.name ?? "";
      }
      return sortDir === "asc"
        ? av.localeCompare(bv, "hr")
        : bv.localeCompare(av, "hr");
    });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field)
      return <span className="ml-1 text-muted-foreground/40">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="flex h-full max-w-[1200px] w-full mx-auto flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po imenu, prezimenu ili OIB-u..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" disabled>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Briši
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedLandlord}
            onClick={() =>
              router.push(`/iznajmljivaci/${selectedLandlord.id}/uredi`)
            }
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Promijeni
          </Button>
          <Button size="sm" onClick={() => router.push("/iznajmljivaci/novi")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Dodaj
          </Button>
        </div>
      </div>

      {/* Tablica iznajmljivača */}
      <div className="mt-3 flex-1 min-h-0 overflow-y-auto rounded-md border bg-card">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow className={selectableTableHeaderClass}>
              <TableHead
                className="w-[140px] cursor-pointer select-none"
                onClick={() => toggleSort("surname")}
              >
                Prezime {sortIndicator("surname")}
              </TableHead>
              <TableHead
                className="w-[120px] cursor-pointer select-none"
                onClick={() => toggleSort("name")}
              >
                Ime {sortIndicator("name")}
              </TableHead>
              <TableHead
                className="w-[115px] cursor-pointer select-none text-left"
                onClick={() => toggleSort("oib")}
              >
                OIB {sortIndicator("oib")}
              </TableHead>
              <TableHead
                className="w-[120px] cursor-pointer select-none"
                onClick={() => toggleSort("city")}
              >
                Grad {sortIndicator("city")}
              </TableHead>
              <TableHead className="w-[190px]">Adresa</TableHead>
              <TableHead className="w-[130px] text-left">Telefon</TableHead>
              <TableHead className="w-[220px]">E-mail</TableHead>
              <TableHead className="w-[120px]">Vrsta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nema rezultata.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((landlord) => (
              <TableRow
                key={landlord.id}
                ref={
                  selectedLandlord?.id === landlord.id
                    ? selectedRowRef
                    : undefined
                }
                className={selectableTableRowClass(
                  selectedLandlord?.id === landlord.id,
                )}
                onClick={() => handleSelectLandlord(landlord)}
              >
                <TableCell className="font-medium">
                  {landlord.surname}
                </TableCell>
                <TableCell>{landlord.name}</TableCell>
                <TableCell className="text-left font-mono text-sm">
                  {landlord.oib}
                </TableCell>
                <TableCell>{landlord.city?.name}</TableCell>
                <TableCell
                  className="w-[190px] max-w-0 truncate"
                  title={landlord.address}
                >
                  {landlord.address}
                </TableCell>
                <TableCell className="text-left">{landlord.phone}</TableCell>
                <TableCell
                  className="w-[220px] max-w-0 truncate"
                  title={landlord.email ?? undefined}
                >
                  {landlord.email}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vrstaLabel(landlord.vrstaIznajmljivaca)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Donje dvije tablice */}
      <div
        className={cn(
          "mt-5 grid grid-cols-[3fr_2fr] items-stretch gap-4",
          isPending && "opacity-60",
        )}
      >
        {/* Smještajne jedinice */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Smještajne jedinice</h2>
            <span className="text-sm text-muted-foreground">
              {selectedLandlord?.surname} {selectedLandlord?.name}
            </span>
          </div>
          <div className="h-[190px] overflow-y-auto rounded-md border bg-card">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow className={selectableTableHeaderClass}>
                  <TableHead className="w-[22%]">Naziv</TableHead>
                  <TableHead className="w-[32%]">Vrsta</TableHead>
                  <TableHead className="w-[14%] text-right">Sobe</TableHead>
                  <TableHead className="w-[17%] text-right">
                    Kreveta
                  </TableHead>
                  <TableHead className="w-[15%] text-right">
                    Pom. l.
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accommodations.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Nema smještajnih jedinica.
                    </TableCell>
                  </TableRow>
                )}
                {accommodations.map((apt) => (
                  <TableRow
                    key={apt.id}
                    className={cn(
                      "h-9",
                      selectableTableRowClass(
                        selectedAccommodation?.id === apt.id,
                      ),
                    )}
                    onClick={() => handleSelectAccommodation(apt)}
                  >
                    <TableCell className="font-medium">{apt.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vrstaApartmanaLabels[apt.vrstaApartmana] ??
                        apt.vrstaApartmana}
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.brojSoba}
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.brojKreveta}
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.brojPomocnihLezajeva ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Cjenik */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Cjenik</h2>
            <span className="text-sm text-muted-foreground">
              {selectedAccommodation?.name ?? "—"}
            </span>
          </div>
          <div className="h-[190px] overflow-y-auto rounded-md border bg-card">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow className={selectableTableHeaderClass}>
                  <TableHead className="w-1/4">Datum od</TableHead>
                  <TableHead className="w-1/4">Datum do</TableHead>
                  <TableHead className="w-1/4 text-right">
                    Cijena (€)
                  </TableHead>
                  <TableHead className="w-1/4 text-right">
                    Cijena izn.
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricelist.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Nema cjenika.
                    </TableCell>
                  </TableRow>
                )}
                {pricelist.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.dateFrom)}</TableCell>
                    <TableCell>{formatDate(entry.dateTo)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatHrDecimal(parseFloat(entry.pricePerNight), 2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {entry.landlordPrice
                        ? formatHrDecimal(parseFloat(entry.landlordPrice), 2)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
