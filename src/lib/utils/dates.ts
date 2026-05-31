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
