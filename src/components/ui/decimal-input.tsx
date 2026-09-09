"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  formatHrDecimal,
  parseHrDecimal,
  normalizeDecimalKey,
} from "@/lib/utils/decimal";

export interface DecimalInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "onChange" | "type" | "inputMode"
  > {
  /** RHF/poslovna vrijednost — čist broj, ne hrvatski string. */
  value: number | null | undefined;
  /** Poziva se samo kad se stvarna numerička vrijednost promijeni. */
  onChange: (value: number | null) => void;
  /** Broj decimalnih mjesta za prikaz nakon Enter/Tab/blur (npr. 2 za novčane iznose). */
  decimals: number;
}

/**
 * Reusable input za hrvatski decimalni format ("1.234,56" -> 1234.56).
 *
 * Odvaja prikazni string (interni state, ono što korisnik vidi/tipka)
 * od RHF numeričke vrijednosti (value/onChange propovi, number | null).
 * <input> je controlled preko internog displayValue-a, NE preko value
 * propa direktno — inače bi RHF re-render nakon setValue() prisilio
 * prikaz plain JS broja (npr. "1234.56") i pregazio hrvatski format.
 *
 * Tijekom tipkanja: displayValue se ažurira bez agresivnog formatiranja
 * (nema separatora tisućica), a RHF vrijednost postaje null čim unos
 * nije potpun/valjan broj — ne zadržava se prethodna valjana vrijednost
 * (izbjegava lažni dojam da je forma validna dok input prikazuje
 * nedovršen/nevažeći unos).
 *
 * Na Enter/Tab/blur: ako je displayValue valjan broj, formatira se u
 * puni hrvatski prikaz (separator tisućica + fiksan broj decimala) i
 * ta vrijednost se emitira. Ako nije valjan, displayValue ostaje
 * netaknut (korisnik i dalje vidi svoj unos) i RHF vrijednost ostaje
 * null — postojeća Zod/RHF validacija to standardno prijavljuje.
 *
 * Sync iz RHF-a natrag u display (npr. form.reset(), initial mount)
 * mora razlikovati echo vlastitog onChange-a od stvarne eksterne
 * promjene. Ne uspoređujemo brojčane vrijednosti (pozivatelj smije
 * transformirati emitiranu vrijednost prije nego stigne u RHF, npr.
 * `onChange={(v) => field.onChange(v ?? 0)}` — tada `value` prop koji
 * DecimalInput primi NIKAD ne odgovara onome što je sam emitirao).
 * Umjesto toga koristimo redoslijed: `justEmittedRef` se postavi
 * neposredno prije poziva onChange, a efekt koji reagira na promjenu
 * `value` propa ga konzumira i preskače re-format — bez obzira na to
 * koja je vrijednost stigla. Eksterni update (reset, initial mount)
 * nikad ne postavlja taj flag, pa se ispravno re-formatira.
 */
export function DecimalInput({
  value,
  onChange,
  decimals,
  onKeyDown,
  onBlur,
  ...props
}: DecimalInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() =>
    value == null ? "" : formatHrDecimal(value, decimals),
  );

  const justEmittedRef = React.useRef(false);

  const emit = React.useCallback(
    (parsed: number | null) => {
      if (parsed === value) return; // nema stvarne promjene — ništa za emitirati
      justEmittedRef.current = true;
      onChange(parsed);
    },
    [value, onChange],
  );

  React.useEffect(() => {
    if (justEmittedRef.current) {
      // Echo vlastitog onChange poziva (bez obzira kako ga je pozivatelj
      // eventualno transformirao) — display je već ono što je korisnik
      // upravo tipkao, ne re-formatiraj.
      justEmittedRef.current = false;
      return;
    }
    // Eksterna promjena (reset, initial mount, drugo polje) — sinkroniziraj.
    setDisplayValue(value == null ? "" : formatHrDecimal(value, decimals));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function commit() {
    const parsed = parseHrDecimal(displayValue);
    if (parsed === null) return; // nevažeći/nedovršen — ostavi display, ne diraj RHF
    setDisplayValue(formatHrDecimal(parsed, decimals));
    emit(parsed);
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={(e) => {
        const next = e.target.value;
        setDisplayValue(next);
        emit(parseHrDecimal(next));
      }}
      onKeyDownCapture={(e) => {
        if (e.key === "." ) {
          const replacement = normalizeDecimalKey(e.key, displayValue);
          if (replacement !== e.key) {
            e.preventDefault();
            const input = e.currentTarget;
            const start = input.selectionStart ?? displayValue.length;
            const end = input.selectionEnd ?? displayValue.length;
            const next =
              displayValue.slice(0, start) + replacement + displayValue.slice(end);
            setDisplayValue(next);
            emit(parseHrDecimal(next));
            requestAnimationFrame(() => {
              input.setSelectionRange(start + 1, start + 1);
            });
          }
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Tab") commit();
        onKeyDown?.(e);
      }}
      onBlur={(e) => {
        commit();
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
