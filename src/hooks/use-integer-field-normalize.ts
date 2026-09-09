"use client";

import { useCallback, type FocusEvent, type KeyboardEvent } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { normalizeLeadingZeros } from "@/lib/utils/numbers";

/**
 * Reusable normalizacija prikaza numeričkih (integer/decimal) polja za
 * RHF-kontrolirane <input type="number">.
 *
 * Problem koji rješava: <input type="number"> pri tipkanju "0" pa "10"
 * može ostaviti DOM prikaz "010" dok korisnik nastavlja tipkati — RHF
 * interna vrijednost je već ispravan broj (10), ali DOM string prikaz
 * to ne odražava dok input ne izgubi fokus. Normalizacija se izvršava
 * na Enter, Tab i blur mišem — NE pri svakom tipkanju — i ne mijenja
 * spremljenu numeričku vrijednost, samo ispravlja vodeće nule u
 * prikazu (vidi normalizeLeadingZeros).
 *
 * Ne mijenja postojeću keyboard navigaciju (useFormKeyboardNav): ne
 * poziva preventDefault/stopPropagation.
 *
 * shouldDirty se izračunava iz numeričke usporedbe (parseFloat), ne iz
 * string usporedbe — ako "010" i "10" predstavljaju istu brojčanu
 * vrijednost koja je već u RHF stateu, dirty se NE postavlja; samo se
 * osvježi DOM prikaz.
 */
export function useIntegerFieldNormalize<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>(form: UseFormReturn<TFieldValues>, name: TName) {
  const normalize = useCallback(
    (input: HTMLInputElement) => {
      const raw = input.value;
      const normalized = normalizeLeadingZeros(raw);
      if (normalized === raw) return;

      const currentValue = form.getValues(name);
      const normalizedNum = normalized === "" ? undefined : Number(normalized);
      const isSameNumericValue =
        typeof currentValue === "number" &&
        normalizedNum !== undefined &&
        currentValue === normalizedNum;

      if (isSameNumericValue) {
        // RHF vrijednost je već ispravna — samo DOM prikaz kasni za njom
        // (npr. "010" prikazano dok je stvarna vrijednost već 10). Ne
        // prolazimo kroz setValue (nema promjene vrijednosti, ne dira se
        // dirty-state), nego direktno osvježimo DOM string.
        input.value = normalized;
        return;
      }

      form.setValue(name, normalizedNum as TFieldValues[TName], {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
    [form, name],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" && e.key !== "Tab") return;
      normalize(e.currentTarget);
    },
    [normalize],
  );

  const onBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      normalize(e.currentTarget);
    },
    [normalize],
  );

  return { onKeyDown, onBlur };
}
