// src/lib/utils/dates.ts

/**
 * Parsira datum u hrvatskom formatu dd.mm.gggg. ili dd.mm.gggg
 * Vraća Date objekt ili null ako format nije ispravan
 */
export function parseHrDate(value: string): Date | null {
  const clean = value.replace(/\.$/, "");
  const parts = clean.split(".");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Validira datum rođenja — mora biti unutar posljednjih 85 godina
 * i ne smije biti u budućnosti
 */
export function validateDatumRodjenja(value: string): boolean {
  const date = parseHrDate(value);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 85);

  return date >= minDate && date < today;
}

function isValidCalendarDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const date = new Date(year, month - 1, day);
  // new Date "prelijeva" nepostojeće datume (npr. 31.02 -> 03.03) — provjera
  // da su komponente ostale iste je jedini pouzdan način da to otkrijemo.
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Normalizira "brzi" korisnički unos datuma u puni hrvatski format
 * dd.mm.gggg. — koristi se pri Enter / Tab / blur, ne pri svakom tipkanju.
 *
 * Podržani skraćeni oblici (koriste trenutni klijentski mjesec/godinu za
 * dijelove koji nedostaju):
 *   d ili dd            -> dd.MM.yyyy.   (dan, trenutni mjesec i godina)
 *   ddMM ili dd.MM       -> dd.MM.yyyy.   (dan i mjesec, trenutna godina)
 *   ddMMyyyy ili dd.MM.yyyy(.) -> dd.MM.yyyy.  (potpun datum)
 *
 * Vodeće nule su opcionalne SAMO za jednodnevni unos (1 -> 01). Bilo koji
 * drugi dvosmislen ili nepotpun unos (npr. "108", tri znamenke bez točaka)
 * vraća null — pozivatelj ne smije prepravljati vrijednost, nego prepustiti
 * postojećoj validaciji da prijavi grešku.
 *
 * Ne koristi new Date(string) parsiranje — dan/mjesec/godina se eksplicitno
 * rastavljaju i kalendarska ispravnost provjerava ručno.
 */
export function normalizeHrDateInput(
  value: string,
  today: Date = new Date(),
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  let day: number;
  let month: number;
  let year: number;

  if (trimmed.includes(".")) {
    // Oblici s točkama: "d.", "dd.mm", "dd.mm.", "dd.mm.gggg", "dd.mm.gggg."
    const parts = trimmed.replace(/\.$/, "").split(".");
    if (parts.some((p) => !/^\d+$/.test(p))) return null;

    if (parts.length === 1) {
      const [d] = parts;
      if (d.length < 1 || d.length > 2) return null;
      day = Number(d);
      month = currentMonth;
      year = currentYear;
    } else if (parts.length === 2) {
      const [d, m] = parts;
      if (d.length !== 2 || m.length !== 2) return null;
      day = Number(d);
      month = Number(m);
      year = currentYear;
    } else if (parts.length === 3) {
      const [d, m, y] = parts;
      if (d.length !== 2 || m.length !== 2 || y.length !== 4) return null;
      day = Number(d);
      month = Number(m);
      year = Number(y);
    } else {
      return null;
    }
  } else {
    // Oblici bez točaka: samo znamenke
    if (!/^\d+$/.test(trimmed)) return null;

    if (trimmed.length === 1 || trimmed.length === 2) {
      // Jedini slučaj gdje je vodeća nula opcionalna.
      day = Number(trimmed);
      month = currentMonth;
      year = currentYear;
    } else if (trimmed.length === 4) {
      day = Number(trimmed.slice(0, 2));
      month = Number(trimmed.slice(2, 4));
      year = currentYear;
    } else if (trimmed.length === 8) {
      day = Number(trimmed.slice(0, 2));
      month = Number(trimmed.slice(2, 4));
      year = Number(trimmed.slice(4, 8));
    } else {
      // npr. "108" (3 znamenke) — dvosmisleno, ne interpretiraj.
      return null;
    }
  }

  if (!isValidCalendarDate(day, month, year)) return null;

  return `${pad2(day)}.${pad2(month)}.${year}.`;
}

/**
 * Konvertira ISO datum (yyyy-mm-dd) u HR format (dd.mm.gggg.)
 */
export function isoToHrDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}.`;
}

/**
 * Konvertira HR format (dd.mm.gggg.) u ISO format (yyyy-mm-dd)
 */
export function hrDateToIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = parseHrDate(value);
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
