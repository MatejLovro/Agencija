// src/lib/mock/kalendarMock.ts
import { KalendarIznajmljivac } from "@/types/kalendar";

// Generira niz datuma između dva ISO datuma (uključivo)
export function generateDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export const MOCK_IZNAJMLJIVACI: KalendarIznajmljivac[] = [
  {
    landlordId: "1",
    ime: "AGIĆ ZRINKA",
    apartmani: [
      {
        accommodationId: "101",
        naziv: "ST22-6",
        dani: [
          { datum: "2026-06-02", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-03", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-04", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-05", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-06", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-07", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-08", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-09", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-10", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-11", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-12", tip: "rezervacija_potvrdjena", redniBroj: null, jeOdjava: false },
        ],
      },
      {
        accommodationId: "102",
        naziv: "AP22-5",
        dani: [
          { datum: "2026-06-02", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-03", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-04", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-05", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-06", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-07", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-08", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-09", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-10", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-11", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-12", tip: null, redniBroj: null, jeOdjava: false },
        ],
      },
    ],
  },
  {
    landlordId: "2",
    ime: "BATINIĆ IVAN",
    apartmani: [
      {
        accommodationId: "201",
        naziv: "ST2-5",
        dani: [
          { datum: "2026-06-02", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-03", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-04", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-05", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-06", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-07", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-08", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-09", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-10", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-11", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-12", tip: null, redniBroj: null, jeOdjava: false },
        ],
      },
      {
        accommodationId: "202",
        naziv: "S2-6",
        dani: [
          { datum: "2026-06-02", tip: "prijava", redniBroj: 699, jeOdjava: false },
          { datum: "2026-06-03", tip: "prijava", redniBroj: 699, jeOdjava: false },
          { datum: "2026-06-04", tip: "prijava", redniBroj: 699, jeOdjava: false },
          { datum: "2026-06-05", tip: "prijava", redniBroj: 699, jeOdjava: false },
          { datum: "2026-06-06", tip: "prijava", redniBroj: 699, jeOdjava: false },
          { datum: "2026-06-07", tip: "prijava", redniBroj: 699, jeOdjava: true },
          { datum: "2026-06-08", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-09", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-10", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-11", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-12", tip: null, redniBroj: null, jeOdjava: false },
        ],
      },
      {
        accommodationId: "203",
        naziv: "S2-7",
        dani: [
          { datum: "2026-06-02", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-03", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-04", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-05", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-06", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-07", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-08", tip: "rezervacija_potvrdjena", redniBroj: 700, jeOdjava: false },
          { datum: "2026-06-09", tip: "rezervacija_potvrdjena", redniBroj: 700, jeOdjava: false },
          { datum: "2026-06-10", tip: "rezervacija_potvrdjena", redniBroj: 700, jeOdjava: false },
          { datum: "2026-06-11", tip: "rezervacija_potvrdjena", redniBroj: 700, jeOdjava: false },
          { datum: "2026-06-12", tip: "rezervacija_potvrdjena", redniBroj: 700, jeOdjava: true },
        ],
      },
      {
        accommodationId: "204",
        naziv: "S2-8",
        dani: [
          { datum: "2026-06-02", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-03", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-04", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-05", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-06", tip: "rezervacija_nepotvrdjena", redniBroj: 701, jeOdjava: false },
          { datum: "2026-06-07", tip: "rezervacija_nepotvrdjena", redniBroj: 701, jeOdjava: false },
          { datum: "2026-06-08", tip: "rezervacija_nepotvrdjena", redniBroj: 701, jeOdjava: false },
          { datum: "2026-06-09", tip: "rezervacija_nepotvrdjena", redniBroj: 701, jeOdjava: true },
          { datum: "2026-06-10", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-11", tip: null, redniBroj: null, jeOdjava: false },
          { datum: "2026-06-12", tip: null, redniBroj: null, jeOdjava: false },
        ],
      },
    ],
  },
  {
    landlordId: "3",
    ime: "BEKAVAC ANTE",
    apartmani: [
      {
        accommodationId: "301",
        naziv: "A2-2+2",
        dani: Array.from({ length: 11 }, (_, i) => ({
          datum: new Date(2026, 5, 2 + i).toISOString().slice(0, 10),
          tip: null as null,
          redniBroj: null,
          jeOdjava: false,
        })),
      },
      {
        accommodationId: "302",
        naziv: "A1-2+2",
        dani: Array.from({ length: 11 }, (_, i) => ({
          datum: new Date(2026, 5, 2 + i).toISOString().slice(0, 10),
          tip: null as null,
          redniBroj: null,
          jeOdjava: false,
        })),
      },
    ],
  },
  {
    landlordId: "4",
    ime: "BEKAVAC KATICA",
    apartmani: [
      {
        accommodationId: "401",
        naziv: "AP22-1",
        dani: [
          { datum: "2026-06-02", tip: "preklapanje", redniBroj: null, jeOdjava: false },
          ...Array.from({ length: 10 }, (_, i) => ({
            datum: new Date(2026, 5, 3 + i).toISOString().slice(0, 10),
            tip: null as null,
            redniBroj: null,
            jeOdjava: false,
          })),
        ],
      },
      {
        accommodationId: "402",
        naziv: "AP4-2",
        dani: Array.from({ length: 11 }, (_, i) => ({
          datum: new Date(2026, 5, 2 + i).toISOString().slice(0, 10),
          tip: null as null,
          redniBroj: null,
          jeOdjava: false,
        })),
      },
      {
        accommodationId: "403",
        naziv: "AP5-3",
        dani: Array.from({ length: 11 }, (_, i) => ({
          datum: new Date(2026, 5, 2 + i).toISOString().slice(0, 10),
          tip: null as null,
          redniBroj: null,
          jeOdjava: false,
        })),
      },
    ],
  },
];
