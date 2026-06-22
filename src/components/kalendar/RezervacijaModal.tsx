// src/components/kalendar/RezervacijaModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link as LinkIcon } from "lucide-react";
import {
  reservationSchema,
  ReservationFormValues,
  isValidHrDate,
  hrDateToIso,
} from "@/lib/validations/reservation";
import {
  actionGetAccommodationWithLandlord,
  actionCreateReservation,
} from "@/lib/actions/reservations";
import {
  actionGetPartners,
  actionQuickCreatePartner,
} from "@/lib/actions/partners";
import { AccommodationWithLandlord } from "@/lib/db/queries/reservations";
import { PartnerOption } from "@/lib/db/queries/partners";
import { ComboboxWithCreate } from "@/components/ui/combobox-with-create";
import { capitalizeWords } from "@/lib/utils/formatters";

// ─── Date helpers ─────────────────────────────────────────────────────────

function isoToHr(iso: string): string {
  if (!iso || iso.length < 10) return "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}.${mm}.${yyyy}.`;
}

function autoFormatHrDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    result += digits[i];
    if (i === 1 || i === 3) result += ".";
  }
  if (digits.length === 8) result += ".";
  return result;
}

function todayHr(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}.`;
}

function brojDana(odHr: string, doHr: string): number | null {
  if (!isValidHrDate(odHr) || !isValidHrDate(doHr)) return null;
  const odIso = hrDateToIso(odHr);
  const doIso = hrDateToIso(doHr);
  const odDate = new Date(odIso + "T00:00:00");
  const doDate = new Date(doIso + "T00:00:00");
  const diffMs = doDate.getTime() - odDate.getTime();
  const dani = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return dani > 0 ? dani : null;
}

function computeDefaultVrijediDo(dateFromIso: string): string {
  const validDays = parseInt(
    process.env.NEXT_PUBLIC_RESERVATION_VALID_DAYS ?? "3",
    10,
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateFrom = new Date(dateFromIso + "T00:00:00");
  dateFrom.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (dateFrom.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Ako je period do početka rezervacije <= validDays,
  // vrijedi do = danas (ne možemo ići dalje od početka rezervacije)
  // Inače vrijedi do = danas + validDays
  const vrijediDoDate =
    diffDays <= validDays
      ? today
      : new Date(today.getTime() + validDays * 24 * 60 * 60 * 1000);

  const dd = String(vrijediDoDate.getDate()).padStart(2, "0");
  const mm = String(vrijediDoDate.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${vrijediDoDate.getFullYear()}.`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface RezervacijaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodationId: string;
  dateFromIso: string; // ISO datum iz kalendar selekcije
  dateToIso: string; // ISO datum iz kalendar selekcije
  onSaved?: () => void;
}

// ─── Komponenta ──────────────────────────────────────────────────────────────

export default function RezervacijaModal({
  open,
  onOpenChange,
  accommodationId,
  dateFromIso,
  dateToIso,
  onSaved,
}: RezervacijaModalProps) {
  const [accommodation, setAccommodation] =
    useState<AccommodationWithLandlord | null>(null);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: ReservationFormValues = useMemo(
    () => ({
      accommodationId,
      landlordId: "",
      guestSurname: "",
      guestName: "",
      email: "",
      phone: "",
      adults: 1,
      teens18: 0,
      children: 0,
      dateFrom: isoToHr(dateFromIso),
      dateTo: isoToHr(dateToIso),
      rezervationValid: computeDefaultVrijediDo(dateFromIso), // <-- prosljeđujemo dateFromIso
      remark: "",
      partnerId: "",
    }),
    [accommodationId, dateFromIso, dateToIso],
  );
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema) as any,
    defaultValues,
  });

  // Reinicijalizacija forme kad se modal otvori s novim podacima
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues]);

  // Dohvat read-only podataka o apartmanu/iznajmljivaču + liste partnera
  useEffect(() => {
    if (!open || !accommodationId) return;

    setIsLoadingContext(true);
    Promise.all([
      actionGetAccommodationWithLandlord(accommodationId),
      actionGetPartners(),
    ])
      .then(([acc, partnerList]) => {
        setAccommodation(acc);
        setPartners(partnerList);
        if (acc) {
          form.setValue("landlordId", acc.landlordId);
        }
      })
      .finally(() => setIsLoadingContext(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, accommodationId]);

  const watchOd = form.watch("dateFrom");
  const watchDo = form.watch("dateTo");
  const izracunatiDani = brojDana(watchOd, watchDo);

  async function handlePartnerCreate(
    name: string,
  ): Promise<{ id: string; name: string } | null> {
    const result = await actionQuickCreatePartner({ name });
    if (!result.success) return null;
    return { id: result.partner.id, name: result.partner.name };
  }

  async function onSubmit(values: ReservationFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await actionCreateReservation(values);

    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    onSaved?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova rezervacija</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* PODACI O IZNAJMLJIVAČU — read-only prikaz */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Podaci o iznajmljivaču
              </h3>
              <div className="bg-muted rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Iznajmljivač</div>
                    <div className="text-sm font-medium text-slate-800">
                      {isLoadingContext
                        ? "Učitavanje..."
                        : accommodation
                          ? `${accommodation.landlordSurname} ${accommodation.landlordName}`
                          : "—"}
                    </div>
                  </div>
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Smještaj</div>
                    <div className="text-sm font-medium text-slate-800">
                      {isLoadingContext
                        ? "Učitavanje..."
                        : (accommodation?.accommodationNaziv ?? "—")}
                    </div>
                  </div>
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Datum rezervacije */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Datum rezervacije</FormLabel>
                <FormControl>
                  <Input value={todayHr()} disabled className="bg-muted" />
                </FormControl>
              </FormItem>
            </div>

            <Separator />

            {/* PODACI O GOSTU */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Podaci o gostu
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestSurname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prezime</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(capitalizeWords(e.target.value))
                          }
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ime</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(capitalizeWords(e.target.value))
                          }
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odrasli</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teens18"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Djeca do 18 g.</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Djeca</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* PERIOD */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Period
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Od datuma</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(autoFormatHrDate(e.target.value))
                          }
                          placeholder="dd.mm.gggg."
                          maxLength={11}
                          autoComplete="off"
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
                      <FormLabel>Do datuma</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(autoFormatHrDate(e.target.value))
                          }
                          placeholder="dd.mm.gggg."
                          maxLength={11}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Broj dana</FormLabel>
                  <FormControl>
                    <Input
                      value={izracunatiDani ?? ""}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rezervationValid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rezervacija vrijedi do</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(autoFormatHrDate(e.target.value))
                          }
                          placeholder="dd.mm.gggg."
                          maxLength={11}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Napomena</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Šalje agencija */}
            <FormField
              control={form.control}
              name="partnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Šalje agencija</FormLabel>
                  <FormControl>
                    <ComboboxWithCreate
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={partners.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                      onCreate={handlePartnerCreate}
                      entityLabel="agenciju"
                      placeholder="Odaberite ili dodajte agenciju..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {submitError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Spremanje..." : "Spremi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
