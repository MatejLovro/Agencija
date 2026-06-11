"use client";

import { useState, useTransition } from "react";
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
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po prezimenu ili imenu..."
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-36 cursor-pointer select-none hover:bg-accent"
                onClick={() => toggleSort("surname")}
              >
                Prezime {sortIndicator("surname")}
              </TableHead>
              <TableHead
                className="w-32 cursor-pointer select-none hover:bg-accent"
                onClick={() => toggleSort("name")}
              >
                Ime {sortIndicator("name")}
              </TableHead>
              <TableHead
                className="w-32 cursor-pointer select-none hover:bg-accent"
                onClick={() => toggleSort("oib")}
              >
                OIB {sortIndicator("oib")}
              </TableHead>
              <TableHead className="w-16">PTT</TableHead>
              <TableHead
                className="w-32 cursor-pointer select-none hover:bg-accent"
                onClick={() => toggleSort("city")}
              >
                Grad {sortIndicator("city")}
              </TableHead>
              <TableHead>Adresa</TableHead>
              <TableHead className="w-32">Vrsta</TableHead>
              <TableHead className="w-36">Telefon</TableHead>
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
                className={
                  selectedLandlord?.id === landlord.id
                    ? "bg-accent cursor-pointer"
                    : "cursor-pointer hover:bg-muted/50"
                }
                onClick={() => handleSelectLandlord(landlord)}
              >
                <TableCell className="font-medium">
                  {landlord.surname}
                </TableCell>
                <TableCell>{landlord.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  {landlord.oib}
                </TableCell>
                <TableCell>{landlord.city?.zip}</TableCell>
                <TableCell>{landlord.city?.name}</TableCell>
                <TableCell>{landlord.address}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vrstaLabel(landlord.vrstaIznajmljivaca)}
                </TableCell>
                <TableCell>{landlord.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Donje dvije tablice */}
      <div
        className={`grid grid-cols-[3fr_2fr] gap-4 ${isPending ? "opacity-60" : ""}`}
      >
        {/* Kapaciteti */}
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kapaciteti — {selectedLandlord?.surname} {selectedLandlord?.name}
          </h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead className="w-24 text-center">Br. soba</TableHead>
                  <TableHead className="w-24 text-center">
                    Br. kreveta
                  </TableHead>
                  <TableHead className="w-24 text-center">
                    Maks. osoba
                  </TableHead>
                  <TableHead className="w-32">Tip smještaja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accommodations.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Nema apartmana.
                    </TableCell>
                  </TableRow>
                )}
                {accommodations.map((apt) => (
                  <TableRow
                    key={apt.id}
                    className={
                      selectedAccommodation?.id === apt.id
                        ? "bg-accent cursor-pointer"
                        : "cursor-pointer hover:bg-muted/50"
                    }
                    onClick={() => handleSelectAccommodation(apt)}
                  >
                    <TableCell className="font-medium">{apt.name}</TableCell>
                    <TableCell className="text-center">
                      {apt.brojSoba}
                    </TableCell>
                    <TableCell className="text-center">
                      {apt.brojKreveta}
                    </TableCell>
                    <TableCell className="text-center">
                      {apt.maxOsoba ?? "—"}
                    </TableCell>
                    <TableCell className="capitalize text-sm text-muted-foreground">
                      {apt.vrstaApartmana}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Cjenik */}
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cjenik — {selectedAccommodation?.name ?? "—"}
          </h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum od</TableHead>
                  <TableHead>Datum do</TableHead>
                  <TableHead className="text-right">Cijena (€)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricelist.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
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
                      {parseFloat(entry.pricePerNight).toFixed(2)}
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
