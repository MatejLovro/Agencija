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
