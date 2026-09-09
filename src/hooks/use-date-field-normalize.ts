"use client";

import { useCallback, type FocusEvent, type KeyboardEvent } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { normalizeHrDateInput } from "@/lib/utils/dates";

/**
 * Reusable normalizacija "brzog" unosa datuma za RHF-kontrolirana polja.
 *
 * Normalizacija (dd.mm.gggg. iz skraćenih oblika poput "1", "0108",
 * "01082025"...) se izvršava na Enter, Tab i blur mišem — NE pri svakom
 * tipkanju. Ne mijenja postojeću keyboard navigaciju (useFormKeyboardNav):
 * ne poziva preventDefault/stopPropagation, samo upiše normaliziranu
 * vrijednost u RHF prije nego event nastavi svojim uobičajenim tokom.
 *
 * Nevažeći/dvosmisleni unos se ne dira — ostaje u polju da ga postojeća
 * Zod/RHF validacija prijavi.
 */
export function useDateFieldNormalize<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>(form: UseFormReturn<TFieldValues>, name: TName) {
  const normalize = useCallback(
    (rawValue: unknown) => {
      if (typeof rawValue !== "string") return;

      const normalized = normalizeHrDateInput(rawValue);
      // null => nevažeći/dvosmislen unos, ne diraj vrijednost.
      // Jednako trenutnoj vrijednosti => već normalizirano, ništa za raditi
      // (sprječava lažni dirty-state pri ponovljenom pozivu, npr. Enter
      // koji naknadno izazove i blur na istom polju).
      if (normalized === null || normalized === rawValue) return;

      form.setValue(name, normalized as TFieldValues[TName], {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
    [form, name],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" && e.key !== "Tab") return;
      normalize(e.currentTarget.value);
    },
    [normalize],
  );

  const onBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      normalize(e.currentTarget.value);
    },
    [normalize],
  );

  return { onKeyDown, onBlur };
}
