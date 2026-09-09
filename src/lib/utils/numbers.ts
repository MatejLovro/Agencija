// src/lib/utils/numbers.ts

/**
 * Uklanja suvišne vodeće nule iz numeričkog stringa nakon završetka unosa
 * (Enter / Tab / blur — ne pri svakom tipkanju).
 *
 * Radi na cjelobrojnom dijelu vrijednosti; decimalni dio i decimalna
 * točka (ako postoje) ostaju netaknuti.
 *
 * Primjeri:
 *   "010"   -> "10"
 *   "0010"  -> "10"
 *   "00"    -> "0"
 *   "0"     -> "0"
 *   "10"    -> "10"
 *   "010.5" -> "10.5"
 *   ""      -> ""
 *
 * Vraća vrijednost nepromijenjenu ako nije prepoznatljiv numerički oblik
 * (npr. nevažeći/nedovršen unos poput "-", "."), da se validacija ne
 * zaobiđe automatskim prepravljanjem.
 */
export function normalizeLeadingZeros(value: string): string {
  if (value === "") return value;

  const match = value.match(/^(-?)(\d+)(\..*)?$/);
  if (!match) return value;

  const [, sign, intPart, rest = ""] = match;
  const trimmed = intPart.replace(/^0+(?=\d)/, "");

  return `${sign}${trimmed}${rest}`;
}
