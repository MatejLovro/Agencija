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
  imaTerasu: boolean;
  imaPunjacAuta: boolean;
  aktivnostBicikliranje: boolean;
  aktivnostRonjenje: boolean;
  aktivnostPlaninarenje: boolean;
  vrstaApartmana:
    | "apartman"
    | "soba"
    | "studio"
    | "vila"
    | "kuca"
    | "mobilna_kucica"
    | null;
  brojZvjezdica: number | null;
  udaljenostMoreOd: number | null;
  udaljenostMoreDo: number | null;
  udaljenostCentarOd: number | null;
  udaljenostCentarDo: number | null;
  udaljenostTrgovinaOd: number | null;
  udaljenostTrgovinaDo: number | null;
};
