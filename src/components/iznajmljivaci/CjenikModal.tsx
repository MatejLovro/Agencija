// src/components/iznajmljivaci/CjenikModal.tsx
"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { Button } from "@/components/ui/button";

import {
  pricelistEntrySchema,
  findOverlappingPricelistPeriod,
  type PricelistEntryFormValues,
} from "@/lib/validations/pricelist";
import {
  actionCreatePricelistEntry,
  actionUpdatePricelistEntry,
} from "@/lib/actions/landlords";
import { isoToHrDate, hrDateToIso } from "@/lib/utils/dates";
import { useFormKeyboardNav } from "@/hooks/use-form-keyboard-nav";
import { useDateFieldNormalize } from "@/hooks/use-date-field-normalize";

export interface PricelistRow {
  id: string;
  dateFrom: string; // ISO
  dateTo: string; // ISO
  pricePerNight: string;
  landlordPrice: string | null;
}

interface CjenikModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (row: PricelistRow) => void;
  accommodationId: string;
  tipProvizije: "P" | "I";
  // Za uređivanje postojećeg reda
  defaultValues?: PricelistRow;
  nextDateFrom?: string;
  // Već učitani periodi smještajne jedinice (parent ih drži u state-u) —
  // koristi se samo u "Dodaj" načinu za provjeru preklapanja.
  existingEntries?: PricelistRow[];
}

const DEFAULT_VALUES: PricelistEntryFormValues = {
  dateFrom: "",
  dateTo: "",
  pricePerNight: 0,
  landlordPrice: undefined,
};

export function CjenikModal({
  open,
  onClose,
  onSaved,
  accommodationId,
  tipProvizije,
  defaultValues,
  nextDateFrom,
  existingEntries,
}: CjenikModalProps) {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!defaultValues;
  const handleFormKeyDown = useFormKeyboardNav();
  const dateFromRef = useRef<HTMLInputElement>(null);
  const pricePerNightRef = useRef<HTMLInputElement>(null);

  const form = useForm<PricelistEntryFormValues>({
    resolver: zodResolver(
      pricelistEntrySchema,
    ) as Resolver<PricelistEntryFormValues>,
    defaultValues: defaultValues
      ? {
          dateFrom: isoToHrDate(defaultValues.dateFrom),
          dateTo: isoToHrDate(defaultValues.dateTo),
          pricePerNight: parseFloat(defaultValues.pricePerNight),
          landlordPrice: defaultValues.landlordPrice
            ? parseFloat(defaultValues.landlordPrice)
            : undefined,
        }
      : DEFAULT_VALUES,
  });

  const dateFromNormalize = useDateFieldNormalize(form, "dateFrom");
  const dateToNormalize = useDateFieldNormalize(form, "dateTo");

  // Nakon normalizacije jednog datuma, ponovno pokreni validaciju drugog
  // (ako je već popunjen) — "Datum do > Datum od" usporedba ovisi o oba
  // polja, pa promjena jednog može promijeniti ispravnost drugog.
  function handleDateFromBlur(e: React.FocusEvent<HTMLInputElement>) {
    dateFromNormalize.onBlur(e);
    if (form.getValues("dateTo")) form.trigger("dateTo");
  }

  function handleDateFromKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) {
    if (handleDateSeparatorDelete(e, onChange)) return;
    if (e.key !== "Enter" && e.key !== "Tab") return;
    dateFromNormalize.onKeyDown(e);
    if (form.getValues("dateTo")) form.trigger("dateTo");
  }

  function handleDateToBlur(e: React.FocusEvent<HTMLInputElement>) {
    dateToNormalize.onBlur(e);
    if (form.getValues("dateFrom")) form.trigger("dateFrom");
  }

  function handleDateToKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) {
    if (handleDateSeparatorDelete(e, onChange)) return;
    if (e.key !== "Enter" && e.key !== "Tab") return;
    dateToNormalize.onKeyDown(e);
    if (form.getValues("dateFrom")) form.trigger("dateFrom");
  }

  /**
   * Backspace/Delete na "." separatoru inače ne mijenja ništa vidljivo —
   * formatDateInput uvijek rekonstruira isti string iz preostalih znamenki,
   * pa native brisanje same točke izgleda kao da se ništa nije dogodilo.
   * Kad bi native brisanje pogodilo separator, umjesto toga ručno obrišemo
   * stvarnu znamenku s te strane separatora i postavimo kursor.
   * Vraća true ako je slučaj obrađen (pozivatelj onda ne smije nastaviti).
   */
  function handleDateSeparatorDelete(
    e: React.KeyboardEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ): boolean {
    if (e.key !== "Backspace" && e.key !== "Delete") return false;

    const input = e.currentTarget;
    const { selectionStart, selectionEnd, value } = input;
    if (selectionStart === null || selectionEnd === null) return false;
    if (selectionStart !== selectionEnd) return false; // ima selekciju — native ponašanje je u redu

    const isBackspace = e.key === "Backspace";
    const separatorIndex = isBackspace ? selectionStart - 1 : selectionStart;
    if (separatorIndex < 0 || separatorIndex >= value.length) return false;
    if (value[separatorIndex] !== ".") return false;

    // Backspace: obriši znamenku ISPRED točke. Delete: obriši znamenku IZA
    // točke (prva znamenka sljedeće skupine).
    const digitIndex = isBackspace ? separatorIndex - 1 : separatorIndex + 1;
    if (digitIndex < 0 || digitIndex >= value.length) return false;

    e.preventDefault();
    const newValue = value.slice(0, digitIndex) + value.slice(digitIndex + 1);
    const formatted = formatDateInput(newValue);
    onChange(formatted);

    // Kursor treba stati odmah iza znamenke koja je sad na mjestu obrisane —
    // izbroji koliko je znamenki (bez točaka) ispred digitIndex u sirovom
    // unosu i pronađi poziciju iza te iste znamenke u formatiranom stringu.
    const digitsBefore = newValue.slice(0, digitIndex).replace(/\./g, "").length;
    let newCursor = 0;
    let seenDigits = 0;
    while (newCursor < formatted.length && seenDigits < digitsBefore) {
      if (formatted[newCursor] !== ".") seenDigits++;
      newCursor++;
    }
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursor, newCursor);
    });
    return true;
  }

  useEffect(() => {
    if (!open) return;

    if (defaultValues) {
      form.reset({
        dateFrom: isoToHrDate(defaultValues.dateFrom),
        dateTo: isoToHrDate(defaultValues.dateTo),
        pricePerNight: parseFloat(defaultValues.pricePerNight),
        landlordPrice: defaultValues.landlordPrice
          ? parseFloat(defaultValues.landlordPrice)
          : undefined,
      });
    } else {
      form.reset({
        ...DEFAULT_VALUES,
        dateFrom: nextDateFrom ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues, nextDateFrom]);

  async function onSubmit(data: PricelistEntryFormValues) {
    const payload = {
      ...data,
      dateFrom: hrDateToIso(data.dateFrom) ?? data.dateFrom,
      dateTo: hrDateToIso(data.dateTo) ?? data.dateTo,
    };

    // Rana povratna informacija na klijentu — server ponovno provjerava
    // isto (trust boundary), ova provjera je samo za brži UX bez round-tripa.
    if (!isEdit) {
      const overlap = findOverlappingPricelistPeriod(
        payload.dateFrom,
        payload.dateTo,
        existingEntries ?? [],
      );
      if (overlap) {
        form.setError("dateFrom", {
          type: "manual",
          message: `Period se preklapa s postojećim periodom ${isoToHrDate(overlap.dateFrom)} - ${isoToHrDate(overlap.dateTo)}`,
        });
        return;
      }
    }

    setIsPending(true);
    try {
      if (isEdit) {
        const result = await actionUpdatePricelistEntry(
          defaultValues!.id,
          payload,
        );
        onSaved({
          id: result.id,
          dateFrom: result.dateFrom,
          dateTo: result.dateTo,
          pricePerNight: result.pricePerNight,
          landlordPrice: result.landlordPrice ?? null,
        });
      } else {
        const result = await actionCreatePricelistEntry(
          accommodationId,
          payload,
        );
        if (result.error || !result.data) {
          form.setError("dateFrom", {
            type: "manual",
            message: result.error ?? "Greška pri spremanju.",
          });
          return;
        }
        onSaved({
          id: result.data.id,
          dateFrom: result.data.dateFrom,
          dateTo: result.data.dateTo,
          pricePerNight: result.data.pricePerNight,
          landlordPrice: result.data.landlordPrice ?? null,
        });
      }

      handleClose();
    } catch (error) {
      console.error("Failed to save pricelist entry", error);
    } finally {
      setIsPending(false);
    }
  }

  function handleClose() {
    form.reset(DEFAULT_VALUES);
    onClose();
  }

  function formatDateInput(value: string) {
    let v = value.replace(/[^\d.]/g, "");
    const digits = v.replace(/\./g, "");
    if (digits.length <= 2) {
      v = digits;
    } else if (digits.length <= 4) {
      v = digits.slice(0, 2) + "." + digits.slice(2);
    } else {
      v =
        digits.slice(0, 2) +
        "." +
        digits.slice(2, 4) +
        "." +
        digits.slice(4, 8);
      if (digits.length === 8) v += ".";
    }
    return v;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent
        className="max-w-sm"
        showCloseButton={false}
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const target = isEdit
            ? pricePerNightRef.current
            : dateFromRef.current;
          target?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isEdit ? "Uredi cjenik" : "Upiši cjenik"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={handleFormKeyDown}
            noValidate
            autoComplete="off"
          >
            <div className="space-y-4 py-2">
              {/* Datum od / Datum do */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Datum od <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="dd.mm.gggg."
                          maxLength={11}
                          className="bg-muted/40"
                          disabled={isEdit}
                          {...field}
                          ref={(el) => {
                            field.ref(el);
                            dateFromRef.current = el;
                          }}
                          onChange={(e) =>
                            field.onChange(formatDateInput(e.target.value))
                          }
                          onKeyDown={(e) =>
                            handleDateFromKeyDown(e, field.onChange)
                          }
                          onBlur={(e) => {
                            field.onBlur();
                            handleDateFromBlur(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Datum do <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="dd.mm.gggg."
                          maxLength={11}
                          className="bg-muted/40"
                          disabled={isEdit}
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatDateInput(e.target.value))
                          }
                          onKeyDown={(e) =>
                            handleDateToKeyDown(e, field.onChange)
                          }
                          onBlur={(e) => {
                            field.onBlur();
                            handleDateToBlur(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cijena za gosta */}
              <FormField
                control={form.control}
                name="pricePerNight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cijena za gosta{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <DecimalInput
                          decimals={2}
                          className="bg-muted/40"
                          value={field.value}
                          onChange={(v) => field.onChange(v ?? 0)}
                          onFocus={(e) => e.target.select()}
                          ref={(el) => {
                            field.ref(el);
                            pricePerNightRef.current = el;
                          }}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground w-8">
                        EUR
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cijena prema iznajmljivaču */}
              <FormField
                control={form.control}
                name="landlordPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={
                        tipProvizije !== "I" ? "text-muted-foreground" : ""
                      }
                    >
                      Cijena prema iznajmljivaču
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <DecimalInput
                          decimals={2}
                          disabled={tipProvizije !== "I"}
                          className="bg-muted/40"
                          value={field.value ?? null}
                          onChange={(v) => field.onChange(v ?? undefined)}
                          onFocus={(e) => e.target.select()}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground w-8">
                        EUR
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Pohranjivanje..." : "Spremi"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
