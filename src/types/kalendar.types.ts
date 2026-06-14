// src/types/kalendar.ts

export type KalendarDan = {
  datum: string; // "2026-06-02"
  tip: "rezervacija_potvrdjena" | "rezervacija_nepotvrdjena" | "prijava" | "preklapanje" | null;
  redniBroj: number | null;
  jeOdjava: boolean;
};

export type KalendarApartman = {
  accommodationId: string;
  naziv: string; // kratki naziv, npr. "ST22-6"
  dani: KalendarDan[];
};

export type KalendarIznajmljivac = {
  landlordId: string;
  ime: string; // "AGIĆ ZRINKA"
  apartmani: KalendarApartman[];
};

export type KalendarFiltri = {
  gradId: number | null;
  landlordId: string | null;
  datumOd: string; // ISO "2026-06-02"
  datumDo: string; // ISO "2026-07-07"
  brojSoba: number | null;
  brojKreveta: number | null;
  brojPomocnihLezajeva: number | null;
  samoNepotvrdjene: boolean;
  samoPotvrdjene: boolean;
  imaKlima: boolean;
  imaParking: boolean;
  imaWifi: boolean;
  kucniLjubimac: boolean;
  pogledNaMore: boolean;
  samoPrioritetan: boolean;
};
