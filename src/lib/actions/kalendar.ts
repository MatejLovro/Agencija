"use server";

import { getKalendarData } from "@/lib/db/queries/kalendar";
import {
  KalendarFiltri,
  KalendarIznajmljivac,
  KalendarApartman,
  KalendarDan,
} from "@/types/kalendar";

function generateDates(od: string, do_: string): string[] {
  const dates: string[] = [];
  const cur = new Date(od + "T00:00:00");
  const end = new Date(do_ + "T00:00:00");
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function isInRange(datum: string, od: string, do_: string): boolean {
  return datum >= od && datum <= do_;
}

type RezervacijaEntry = {
  id: string;
  od: string;
  do: string;
  broj: number;
  status: "potvrdjena" | "nepotvrdjena";
};

type StayEntry = {
  id: string;
  od: string;
  do: string;
  broj: number;
};

type ApartmanEntry = {
  accommodationId: string;
  naziv: string;
  rezervacije: RezervacijaEntry[];
  stays: StayEntry[];
};

type LandlordEntry = {
  landlordId: string;
  ime: string;
  apartmaniMap: Map<string, ApartmanEntry>;
};

// Jedinstveni "događaj" — rezervacija ili stay, svedeno na isti oblik
type Dogadjaj = {
  id: string;
  od: string;
  do: string;
  broj: number;
  vrsta: "rezervacija_potvrdjena" | "rezervacija_nepotvrdjena" | "prijava";
};

export async function actionFetchKalendarData(
  filtri: KalendarFiltri,
): Promise<KalendarIznajmljivac[]> {
  const rows = await getKalendarData(filtri);
  const datumi = generateDates(filtri.datumOd, filtri.datumDo);

  const landlordMap = new Map<string, LandlordEntry>();

  for (const row of rows) {
    if (!landlordMap.has(row.landlordId)) {
      landlordMap.set(row.landlordId, {
        landlordId: row.landlordId,
        ime: row.landlordIme,
        apartmaniMap: new Map(),
      });
    }
    const landlordEntry = landlordMap.get(row.landlordId)!;

    if (!landlordEntry.apartmaniMap.has(row.accommodationId)) {
      landlordEntry.apartmaniMap.set(row.accommodationId, {
        accommodationId: row.accommodationId,
        naziv: row.naziv,
        rezervacije: [],
        stays: [],
      });
    }
    const aptEntry = landlordEntry.apartmaniMap.get(row.accommodationId)!;

    if (
      row.rezervacijaId &&
      row.rezervacijaOd &&
      row.rezervacijaDo &&
      row.rezervacijaBroj !== null &&
      row.rezervacijaStatus &&
      !aptEntry.rezervacije.find((r) => r.id === row.rezervacijaId)
    ) {
      aptEntry.rezervacije.push({
        id: row.rezervacijaId,
        od: row.rezervacijaOd,
        do: row.rezervacijaDo,
        broj: row.rezervacijaBroj,
        status: row.rezervacijaStatus,
      });
    }

    if (
      row.stayId &&
      row.stayOd &&
      row.stayDo &&
      row.stayBroj !== null &&
      !aptEntry.stays.find((s) => s.id === row.stayId)
    ) {
      aptEntry.stays.push({
        id: row.stayId,
        od: row.stayOd,
        do: row.stayDo,
        broj: row.stayBroj,
      });
    }
  }

  const rezultat: KalendarIznajmljivac[] = [];

  for (const landlordEntry of landlordMap.values()) {
    const apartmani: KalendarApartman[] = [];

    for (const aptEntry of landlordEntry.apartmaniMap.values()) {
      // Svedi rezervacije i stayeve na jedinstvenu listu događaja
      const dogadjaji: Dogadjaj[] = [
        ...aptEntry.rezervacije.map((r) => ({
          id: r.id,
          od: r.od,
          do: r.do,
          broj: r.broj,
          vrsta:
            r.status === "potvrdjena"
              ? ("rezervacija_potvrdjena" as const)
              : ("rezervacija_nepotvrdjena" as const),
        })),
        ...aptEntry.stays.map((s) => ({
          id: s.id,
          od: s.od,
          do: s.do,
          broj: s.broj,
          vrsta: "prijava" as const,
        })),
      ];

      // Dan preklapanja = dan u kojem se preklapaju 2+ različita događaja.
      // Pokriva i rubni slučaj (checkout = checkin) i preklapanje rezervacija
      // kroz više dana (konkurentske rezervacije za isti termin).
      const daniPreklapanja = new Set<string>();
      for (const datum of datumi) {
        const aktivni = dogadjaji.filter((d) => isInRange(datum, d.od, d.do));
        if (aktivni.length >= 2) {
          daniPreklapanja.add(datum);
        }
      }

      const dani: KalendarDan[] = datumi.map((datum) => {
        if (daniPreklapanja.has(datum)) {
          return {
            datum,
            tip: "preklapanje",
            redniBroj: null,
            jeOdjava: false,
          };
        }

        const stay = aptEntry.stays.find((s) => isInRange(datum, s.od, s.do));
        if (stay) {
          return {
            datum,
            tip: "prijava",
            redniBroj: stay.broj,
            jeOdjava: datum === stay.do,
          };
        }

        const rez = aptEntry.rezervacije.find((r) =>
          isInRange(datum, r.od, r.do),
        );
        if (rez) {
          return {
            datum,
            tip:
              rez.status === "potvrdjena"
                ? "rezervacija_potvrdjena"
                : "rezervacija_nepotvrdjena",
            redniBroj: rez.broj,
            jeOdjava: datum === rez.do,
          };
        }

        return { datum, tip: null, redniBroj: null, jeOdjava: false };
      });

      apartmani.push({
        accommodationId: aptEntry.accommodationId,
        naziv: aptEntry.naziv,
        dani,
      });
    }

    rezultat.push({
      landlordId: landlordEntry.landlordId,
      ime: landlordEntry.ime,
      apartmani,
    });
  }

  return rezultat;
}
