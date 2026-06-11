// src/components/iznajmljivaci/CjenikModal.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

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
import { Button } from "@/components/ui/button";

import {
  pricelistEntrySchema,
  type PricelistEntryFormValues,
} from "@/lib/validations/pricelist";
import {
  actionCreatePricelistEntry,
  actionUpdatePricelistEntry,
} from "@/lib/actions/landlords";
import { isoToHrDate, hrDateToIso } from "@/lib/utils/dates";

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
}: CjenikModalProps) {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!defaultValues;

  const form = useForm<PricelistEntryFormValues>({
    resolver: zodResolver(pricelistEntrySchema) as any,
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

  useEffect(() => {
    if (open && !defaultValues) {
      form.reset({
        ...DEFAULT_VALUES,
        dateFrom: nextDateFrom ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nextDateFrom]);

  async function onSubmit(data: PricelistEntryFormValues) {
    setIsPending(true);
    try {
      const payload = {
        ...data,
        dateFrom: hrDateToIso(data.dateFrom) ?? data.dateFrom,
        dateTo: hrDateToIso(data.dateTo) ?? data.dateTo,
      };

      const result = isEdit
        ? await actionUpdatePricelistEntry(defaultValues!.id, payload)
        : await actionCreatePricelistEntry(accommodationId, payload);

      onSaved({
        id: result.id,
        dateFrom: result.dateFrom,
        dateTo: result.dateTo,
        pricePerNight: result.pricePerNight,
        landlordPrice: result.landlordPrice ?? null,
      });

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
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isEdit ? "Uredi cjenik" : "Upiši cjenik"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                          maxLength={10}
                          className="bg-muted/40"
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatDateInput(e.target.value))
                          }
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
                          maxLength={10}
                          className="bg-muted/40"
                          {...field}
                          onChange={(e) =>
                            field.onChange(formatDateInput(e.target.value))
                          }
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          autoFocus
                          className="bg-muted/40"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={tipProvizije !== "I"}
                          className="bg-muted/40"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value),
                            )
                          }
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
