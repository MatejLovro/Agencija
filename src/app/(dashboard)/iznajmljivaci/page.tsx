"use client";

import { useState } from "react";
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

// ---------------------------------------------------------------------------
// Tipovi
// ---------------------------------------------------------------------------

type SortField = "surname" | "name" | "oib" | "city";
type SortDir = "asc" | "desc";

interface City {
  zip: string;
  name: string;
}

interface Landlord {
  id: string;
  surname: string;
  name: string;
  oib: string;
  city: City;
  address: string;
  vrstaIznajmljivaca: string;
  phone: string;
  tipProvizije: string;
  iznos: string;
}

interface Accommodation {
  id: string;
  name: string;
  brojSoba: number;
  brojKreveta: number;
  maxOsoba: number | null;
  vrstaApartmana: string;
}

interface PricelistEntry {
  id: string;
  dateFrom: string;
  dateTo: string;
  pricePerNight: string;
}

// ---------------------------------------------------------------------------
// Fiktivni podaci za UI testiranje
// ---------------------------------------------------------------------------

const MOCK_LANDLORDS: Landlord[] = [
  {
    id: "1",
    surname: "Šošić",
    name: "Renata",
    oib: "88454806149",
    city: { zip: "21322", name: "Brela" },
    address: "Šćit 40",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "091 234 5678",
    tipProvizije: "P",
    iznos: "12.00",
  },
  {
    id: "2",
    surname: "Bekavac",
    name: "Ante",
    oib: "42299630551",
    city: { zip: "21322", name: "Brela" },
    address: "Frankopanska 62",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "098 345 6789",
    tipProvizije: "P",
    iznos: "12.00",
  },
  {
    id: "3",
    surname: "Batinić",
    name: "Ivan",
    oib: "99825824836",
    city: { zip: "21320", name: "Baška Voda" },
    address: "Naputica 21",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "091 781 6578",
    tipProvizije: "P",
    iznos: "12.00",
  },
  {
    id: "4",
    surname: "Mavindra",
    name: "d.o.o.",
    oib: "22400552273",
    city: { zip: "21320", name: "Baška Voda" },
    address: "Prilaz Gradini 2",
    vrstaIznajmljivaca: "tvrtka",
    phone: "021 611 222",
    tipProvizije: "P",
    iznos: "16.00",
  },
  {
    id: "5",
    surname: "Višak",
    name: "Zrinka",
    oib: "65962643101",
    city: { zip: "21320", name: "Baška Voda" },
    address: "Makarska 85",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "095 456 7890",
    tipProvizije: "P",
    iznos: "14.00",
  },
  {
    id: "6",
    surname: "Carević",
    name: "Stanka",
    oib: "62004468739",
    city: { zip: "21322", name: "Brela" },
    address: "Frankopanska 28",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "059 900 0065",
    tipProvizije: "P",
    iznos: "12.00",
  },
  {
    id: "7",
    surname: "Čagalj",
    name: "Dalibor",
    oib: "49452834778",
    city: { zip: "21300", name: "Makarska" },
    address: "Don M. Pavlinovića 13",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "095 831 4237",
    tipProvizije: "P",
    iznos: "0.00",
  },
  {
    id: "8",
    surname: "Radeljić",
    name: "Suzana",
    oib: "22630405413",
    city: { zip: "21322", name: "Brela" },
    address: "Ivana Gundulića 22",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "095 822 5008",
    tipProvizije: "P",
    iznos: "8.00",
  },
  {
    id: "9",
    surname: "Krželj",
    name: "Mijo",
    oib: "05830314844",
    city: { zip: "21322", name: "Brela" },
    address: "Frankopanska 54",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "+1 516 476 9309",
    tipProvizije: "P",
    iznos: "15.00",
  },
  {
    id: "10",
    surname: "Žamić",
    name: "Anamarija",
    oib: "62330380531",
    city: { zip: "21322", name: "Brela" },
    address: "Frankopanska 8A",
    vrstaIznajmljivaca: "fizicka_osoba",
    phone: "092 567 8901",
    tipProvizije: "P",
    iznos: "12.00",
  },
];

const MOCK_ACCOMMODATIONS: Record<string, Accommodation[]> = {
  "1": [
    {
      id: "a1",
      name: "Apartman Sunce",
      brojSoba: 2,
      brojKreveta: 4,
      maxOsoba: 6,
      vrstaApartmana: "apartman",
    },
    {
      id: "a2",
      name: "Studio More",
      brojSoba: 1,
      brojKreveta: 2,
      maxOsoba: 3,
      vrstaApartmana: "studio",
    },
  ],
  "3": [
    {
      id: "a3",
      name: "ST2-5",
      brojSoba: 1,
      brojKreveta: 2,
      maxOsoba: null,
      vrstaApartmana: "apartman",
    },
    {
      id: "a4",
      name: "S2-6",
      brojSoba: 1,
      brojKreveta: 2,
      maxOsoba: null,
      vrstaApartmana: "soba",
    },
    {
      id: "a5",
      name: "S2-7",
      brojSoba: 1,
      brojKreveta: 2,
      maxOsoba: null,
      vrstaApartmana: "soba",
    },
  ],
  "5": [
    {
      id: "a6",
      name: "Vila Zrinka",
      brojSoba: 4,
      brojKreveta: 8,
      maxOsoba: 10,
      vrstaApartmana: "vila",
    },
  ],
};

const MOCK_PRICELIST: Record<string, PricelistEntry[]> = {
  a1: [
    {
      id: "p1",
      dateFrom: "2025-06-01",
      dateTo: "2025-06-30",
      pricePerNight: "80.00",
    },
    {
      id: "p2",
      dateFrom: "2025-07-01",
      dateTo: "2025-08-31",
      pricePerNight: "120.00",
    },
    {
      id: "p3",
      dateFrom: "2025-09-01",
      dateTo: "2025-09-30",
      pricePerNight: "90.00",
    },
  ],
  a3: [
    {
      id: "p4",
      dateFrom: "2025-07-01",
      dateTo: "2025-08-31",
      pricePerNight: "65.00",
    },
  ],
  a6: [
    {
      id: "p5",
      dateFrom: "2025-06-01",
      dateTo: "2025-08-31",
      pricePerNight: "350.00",
    },
  ],
};

// ---------------------------------------------------------------------------
// Pomoćne funkcije
// ---------------------------------------------------------------------------

function vrstaLabel(vrsta: string): string {
  const map: Record<string, string> = {
    fizicka_osoba: "Fizička osoba",
    obrt: "Obrt",
    tvrtka: "Tvrtka",
  };
  return map[vrsta] ?? vrsta;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

// ---------------------------------------------------------------------------
// Komponenta
// ---------------------------------------------------------------------------

export default function IznajmljivaciPage() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("surname");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord>(
    MOCK_LANDLORDS[0],
  );
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<Accommodation | null>(MOCK_ACCOMMODATIONS["1"]?.[0] ?? null);

  // Sortiranje i filtriranje
  const filtered = MOCK_LANDLORDS.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.surname.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
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
      av = a.city.name;
      bv = b.city.name;
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

  const accommodations = MOCK_ACCOMMODATIONS[selectedLandlord.id] ?? [];
  const pricelist = selectedAccommodation
    ? (MOCK_PRICELIST[selectedAccommodation.id] ?? [])
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* Gornja tablica — iznajmljivači                                       */}
      {/* ------------------------------------------------------------------ */}

      <div>
        {/* Toolbar */}
        <div className="mb-3 flex items-center justify-between">
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
            <Button variant="outline" size="sm">
              <Pencil className="mr-1.5 h-4 w-4" />
              Promijeni
            </Button>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Dodaj
            </Button>
          </div>
        </div>

        {/* Tablica */}
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
                    selectedLandlord.id === landlord.id
                      ? "bg-accent cursor-pointer"
                      : "cursor-pointer hover:bg-muted/50"
                  }
                  onClick={() => {
                    setSelectedLandlord(landlord);
                    const apts = MOCK_ACCOMMODATIONS[landlord.id] ?? [];
                    setSelectedAccommodation(apts[0] ?? null);
                  }}
                >
                  <TableCell className="font-medium">
                    {landlord.surname}
                  </TableCell>
                  <TableCell>{landlord.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {landlord.oib}
                  </TableCell>
                  <TableCell>{landlord.city.zip}</TableCell>
                  <TableCell>{landlord.city.name}</TableCell>
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
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Donje dvije tablice — Kapaciteti i Cjenik                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-[3fr_2fr] gap-4">
        {/* Kapaciteti */}
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kapaciteti — {selectedLandlord.surname} {selectedLandlord.name}
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
                    onClick={() => setSelectedAccommodation(apt)}
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
