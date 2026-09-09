// src/lib/utils/decimal.ts
//
// Hrvatski format decimalnih brojeva: "," je decimalni separator,
// "." je separator tisućica (npr. "1.234,56"). Ovo je isključivo
// UI formatting sloj — RHF/Zod/Drizzle/PostgreSQL i dalje rade s
// običnim JS number vrijednostima (npr. 1234.56).
//
// Ne koristiti Number()/parseFloat() direktno nad hrvatskim stringom
// (npr. "1.234,56") — to nije ispravan JS numerički format i dalo bi
// pogrešan rezultat. Sav parsing prolazi kroz parseHrDecimal ovdje.

/**
 * Parsira hrvatski decimalni string ("1.234,56", "12,5", "10") u broj.
 * Vraća null za prazan, nedovršen ili dvosmislen unos (npr. "12,",
 * ",5" je prihvatljivo kao 0.5, ali "abc", "1.2.3", "12,5,6" nisu).
 *
 * Ne pretpostavlja — nedovršen unos se ne "popravlja", samo se odbija.
 */
export function parseHrDecimal(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  // Dopušta opcionalni "-", grupe znamenki odvojene "." (separator
  // tisućica, opcionalno), i opcionalni "," + decimalne znamenke.
  // Cijeli string mora odgovarati (ne djelomično), inače je dvosmislen.
  const match = trimmed.match(/^-?\d{1,3}(\.\d{3})*(,\d+)?$/);
  if (!match) {
    // Dopusti i jednostavan oblik bez grupiranja tisućica, npr. "1234,56"
    // ili "1234" (korisnik ne mora tipkati točke — one se dodaju tek na
    // commit/format).
    const simple = trimmed.match(/^-?\d+(,\d+)?$/);
    if (!simple) return null;
  }

  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

/**
 * Formatira broj u hrvatski prikaz s fiksnim brojem decimalnih mjesta
 * (npr. formatHrDecimal(1234.5, 2) -> "1.234,50").
 */
export function formatHrDecimal(value: number, decimals: number): string {
  return new Intl.NumberFormat("hr-HR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Live-typing helper: ako korisnik pritisne "." dok trenutni prikazni
 * string JOŠ NE sadrži "," (decimalni separator), tretiramo to kao
 * namjeru za decimalni separator na numeričkoj tipkovnici i vraćamo
 * "," umjesto ".". Ako string već sadrži "," (npr. već formatiran broj
 * s tisućicama, ili korisnik već upisuje decimalni dio), "." ostaje
 * netaknut — ne radimo zaključivanje po cursor pozicijama.
 *
 * Poziva se SAMO tijekom aktivnog tipkanja (prije commit-a); nakon
 * Enter/Tab/blur se separator tisućica dodaje eksplicitno kroz
 * formatHrDecimal, ne kroz ovu funkciju.
 */
export function normalizeDecimalKey(key: string, currentDisplay: string): string {
  if (key === "." && !currentDisplay.includes(",")) return ",";
  return key;
}
