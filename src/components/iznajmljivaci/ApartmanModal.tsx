// src/components/iznajmljivaci/ApartmanModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { CityCombobox } from "./CityCombobox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  accommodationSchema,
  type AccommodationFormValues,
} from "@/lib/validations/accomodation";
import {
  actionCreateAccommodation,
  actionUpdateAccommodation,
} from "@/lib/actions/landlords";

// Tip za red u tablici apartmana — vraćamo gore nakon spremi
export interface AccommodationRow {
  id: string;
  name: string;
  vrstaApartmana: string;
  brojSoba: number;
  brojKreveta: number;
  brojPomocnihLezajeva: number | null;
}

interface City {
  id: number;
  name: string;
  zip?: string | null;
}

interface ApartmanModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (row: AccommodationRow) => void;
  landlordId: string;
  tipProvizije: "P" | "I";
  cities: City[];
  // Za uređivanje postojećeg apartmana
  defaultValues?: AccommodationFormValues;
  accommodationId?: string;
  landlordCityId?: number;
  landlordAddress?: string;
}

const TABS = [
  { id: 1, label: "1. Osnovni podaci" },
  { id: 2, label: "2. Sadržaji" },
  { id: 3, label: "3. Lokacija i aktivnosti" },
  { id: 4, label: "4. Ostalo" },
] as const;

const DEFAULT_VALUES: AccommodationFormValues = {
  name: "",
  fullName: "",
  vrstaApartmana: "apartman",
  cityId: 0,
  address: "",
  webUrl: "",
  brojZvjezdica: 3,
  kategorizacijskiBroj: "",
  brojSoba: 1,
  brojKreveta: 1,
  brojPomocnihLezajeva: 0,
  maxOsoba: undefined,
  aktivan: true,
  prioritetan: false,
  cistiAgencija: false,
  opis: "",
  imaKlima: false,
  imaParking: false,
  imaWifi: false,
  imaRostilj: false,
  imaTerasu: false,
  pogledNaMore: false,
  kucniLjubimac: false,
  nepusaci: false,
  pristupacnoInvalidima: false,
  imaKuhinju: false,
  imaCajnuKuhinju: false,
  brojKupaonica: undefined,
  kupаonaTus: false,
  imaJacuzzi: false,
  kat: undefined,
  imaBasen: false,
  imaSpa: false,
  imaFitness: false,
  imaRestoran: false,
  imaPunjacAuta: false,
  udaljenostMore: undefined,
  udaljenostCentar: undefined,
  udaljenostTrgovina: undefined,
  aktivnostBicikliranje: false,
  aktivnostRonjenje: false,
  aktivnostPlaninarenje: false,
  katastarskaOpcina: "",
  katastarskaCestica: "",
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="text-2xl leading-none transition-colors"
        >
          <span
            className={
              (hovered ?? value) >= star
                ? "text-amber-400"
                : "text-muted-foreground/25"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function ApartmanModal({
  open,
  onClose,
  onSaved,
  landlordId,
  tipProvizije,
  cities,
  defaultValues,
  accommodationId,
  landlordCityId,
  landlordAddress,
}: ApartmanModalProps) {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);
  const [isPending, setIsPending] = useState(false);

  const isEdit = !!accommodationId;

  function getDefaultValues(
    landlordCityId?: number,
    landlordAddress?: string,
  ): AccommodationFormValues {
    return {
      ...DEFAULT_VALUES,
      cityId: landlordCityId ?? 0,
      address: landlordAddress ?? "",
    };
  }

  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationSchema) as any,
    defaultValues:
      defaultValues ?? getDefaultValues(landlordCityId, landlordAddress),
  });

  async function onSubmit(data: AccommodationFormValues) {
    setIsPending(true);
    try {
      const result = isEdit
        ? await actionUpdateAccommodation(accommodationId, data)
        : await actionCreateAccommodation(landlordId, data);

      onSaved({
        id: result.id,
        name: result.name,
        vrstaApartmana: result.vrstaApartmana,
        brojSoba: result.brojSoba,
        brojKreveta: result.brojKreveta,
        brojPomocnihLezajeva: result.brojPomocnihLezajeva ?? null,
      });

      onClose();
    } catch (error) {
      console.error("Failed to save accommodation", error);
    } finally {
      setIsPending(false);
    }
  }

  // Reset forme i tab kada se modal otvori/zatvori
  function handleClose() {
    const vrstaApartmana = form.getValues("vrstaApartmana");
    const brojZvjezdica = form.getValues("brojZvjezdica");
    const cityId = form.getValues("cityId");
    const address = form.getValues("address");

    form.reset({
      ...getDefaultValues(landlordCityId, landlordAddress),
      vrstaApartmana,
      brojZvjezdica,
      cityId,
      address,
    });

    setActiveTab(1);
    onClose();
  }

  useEffect(() => {
    if (open && !defaultValues) {
      form.reset(getDefaultValues(landlordCityId, landlordAddress));
    }
  }, [open]);

  useEffect(() => {
    if (open && defaultValues) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        // Sakrivamo defaultni X gumb jer imamo vlastiti
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <DialogHeader className="pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium">
              {isEdit ? "Uredi apartman" : "Novi apartman"}
            </DialogTitle>
            <button
              type="button"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* ── Tab navigacija ──────────────────────────────────── */}
        <div className="flex gap-0 border-b mt-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Sadržaj kartice ─────────────────────────────────── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            autoComplete="off"
          >
            <div className="py-4 min-h-[400px]">
              {/* tab-1 */}
              {activeTab === 1 && (
                <div className="space-y-5">
                  {/* ── IDENTIFIKACIJA ────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Identifikacija
                    </h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Kratki naziv{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="bg-muted/40"
                                {...field}
                                autoComplete="off"
                                name={`field_${Math.random()}`}
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Puni naziv</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-muted/40"
                                placeholder="npr. Apartman Sunce — jednosoban s terasom"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vrstaApartmana"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Vrsta{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-muted/40 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              >
                                <option value="apartman">Apartman</option>
                                <option value="soba">Soba</option>
                                <option value="studio">Studio</option>
                                <option value="vila">Vila</option>
                                <option value="kuca">Kuća</option>
                                <option value="mobilna_kucica">
                                  Mobilna kućica
                                </option>
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="brojZvjezdica"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Broj zvjezdica{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <div className="flex items-center gap-2">
                                <StarRating
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {field.value}
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="kategorizacijskiBroj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kategorizacijski broj</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-muted/40"
                                  placeholder="npr. HR-12345-AB"
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
                          name="webUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Web URL</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-muted/40"
                                  placeholder="https://..."
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
                  </div>

                  {/* ── LOKACIJA ──────────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Lokacija
                    </h3>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                      <FormField
                        control={form.control}
                        name="cityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Grad <span className="text-destructive">*</span>
                            </FormLabel>
                            <CityCombobox
                              cities={cities}
                              value={field.value || null}
                              onChange={field.onChange}
                              error={form.formState.errors.cityId?.message}
                            />
                          </FormItem>
                        )}
                      />
                      <div className="pb-0.5" />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Adresa <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input className="bg-muted/40" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* ── KAPACITET ─────────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Kapacitet
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name="brojSoba"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Br. soba{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="bg-muted/40"
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 1)
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brojKreveta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Br. kreveta{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="bg-muted/40"
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 1)
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brojPomocnihLezajeva"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pom. ležajevi</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="bg-muted/40"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value),
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxOsoba"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max osoba</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="bg-muted/40"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value),
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* ── OPIS ──────────────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Opis
                    </h3>
                    <FormField
                      control={form.control}
                      name="opis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opis apartmana</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                              placeholder="Kratki opis apartmana za internu upotrebu..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ── STATUS ────────────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Status
                    </h3>
                    <div className="flex gap-6">
                      {(
                        [
                          { name: "aktivan", label: "Aktivan" },
                          { name: "prioritetan", label: "Prioritetan" },
                          { name: "cistiAgencija", label: "Čisti agencija" },
                        ] as const
                      ).map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id={`cb-${name}`}
                                  />
                                </FormControl>
                                <Label
                                  htmlFor={`cb-${name}`}
                                  className="font-normal cursor-pointer"
                                >
                                  {label}
                                </Label>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* tab-2 */}

              {activeTab === 2 && (
                <div className="space-y-5">
                  {/* ── SADRŽAJI ──────────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Sadržaji
                    </h3>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                      {(
                        [
                          { name: "imaKlima", label: "Klima" },
                          { name: "imaParking", label: "Parking" },
                          { name: "imaWifi", label: "WiFi" },
                          { name: "imaRostilj", label: "Roštilj" },
                          { name: "imaTerasu", label: "Terasa" },
                          { name: "pogledNaMore", label: "Pogled na more" },
                          { name: "kucniLjubimac", label: "Kućni ljubimac" },
                          { name: "nepusaci", label: "Nepušači" },
                          {
                            name: "pristupacnoInvalidima",
                            label: "Pristupačno",
                          },
                          { name: "imaKuhinju", label: "Kuhinja" },
                          { name: "imaCajnuKuhinju", label: "Čajna kuhinja" },
                          { name: "imaJacuzzi", label: "Jacuzzi" },
                        ] as const
                      ).map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id={`cb-${name}`}
                                  />
                                </FormControl>
                                <Label
                                  htmlFor={`cb-${name}`}
                                  className="font-normal cursor-pointer"
                                >
                                  {label}
                                </Label>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── DODATNO ───────────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Dodatno
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="brojKupaonica"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Br. kupaonica</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="bg-muted/40"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value),
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="kat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kat</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="50"
                                className="bg-muted/40"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value),
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-3">
                      <FormField
                        control={form.control}
                        name="kupаonaTus"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id="cb-kupaonaTus"
                                />
                              </FormControl>
                              <Label
                                htmlFor="cb-kupaonaTus"
                                className="font-normal cursor-pointer"
                              >
                                Kupaona tuš
                              </Label>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* tab-3 */}
              {activeTab === 3 && (
                <div className="space-y-5">
                  {/* ── SADRŽAJ U BLIZINI ─────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Sadržaj u blizini
                    </h3>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                      {(
                        [
                          { name: "imaBasen", label: "Bazen" },
                          { name: "imaSpa", label: "SPA" },
                          { name: "imaFitness", label: "Fitness" },
                          { name: "imaRestoran", label: "Restoran" },
                          { name: "imaPunjacAuta", label: "Punjač za auto" },
                        ] as const
                      ).map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id={`cb-${name}`}
                                  />
                                </FormControl>
                                <Label
                                  htmlFor={`cb-${name}`}
                                  className="font-normal cursor-pointer"
                                >
                                  {label}
                                </Label>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── UDALJENOSTI ───────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Udaljenosti
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="udaljenostMore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Od mora (m)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="bg-muted/40"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value),
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="udaljenostCentar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Od centra (m)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="bg-muted/40"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value),
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="udaljenostTrgovina"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Od trgovine (m)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="bg-muted/40"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value),
                                  )
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* ── AKTIVNOSTI ────────────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Aktivnosti
                    </h3>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                      {(
                        [
                          {
                            name: "aktivnostBicikliranje",
                            label: "Bicikliranje",
                          },
                          { name: "aktivnostRonjenje", label: "Ronjenje" },
                          {
                            name: "aktivnostPlaninarenje",
                            label: "Planinarenje",
                          },
                        ] as const
                      ).map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id={`cb-${name}`}
                                  />
                                </FormControl>
                                <Label
                                  htmlFor={`cb-${name}`}
                                  className="font-normal cursor-pointer"
                                >
                                  {label}
                                </Label>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* tab-4 */}
              {activeTab === 4 && (
                <div className="space-y-5">
                  {/* ── KATASTARSKI PODACI ────────────────────────────── */}
                  <div>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">
                      Katastarski podaci
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="katastarskaOpcina"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Katastarska općina</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-muted/40"
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
                        name="katastarskaCestica"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Katastarska čestica</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-muted/40"
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
                </div>
              )}
            </div>

            {/* ── Footer ──────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Pohranjivanje..." : "Pohrani"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
