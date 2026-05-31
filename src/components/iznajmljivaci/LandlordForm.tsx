"use client";

import { useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Save, X } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  landlordSchema,
  type LandlordFormValues,
} from "@/lib/validations/landlord";
import {
  actionCreateLandlord,
  actionUpdateLandlord,
} from "@/lib/actions/landlords";
import { CityCombobox } from "./CityCombobox";
import { capitalizeWords } from "@/lib/utils/formatters";

interface City {
  id: number;
  name: string;
}

interface LandlordFormProps {
  cities: City[];
  defaultValues?: any;
  landlordId?: string;
}

// Labels for display
const vrstaLabels: Record<string, string> = {
  fizicka_osoba: "Fizička osoba",
  fizicka_osoba_pdv: "Fizička osoba (PDV)",
  obrt: "Obrt",
  tvrtka: "Tvrtka",
};

const vrstaOptions = [
  "fizicka_osoba",
  "fizicka_osoba_pdv",
  "obrt",
  "tvrtka",
] as const;

export function LandlordForm({
  cities,
  defaultValues,
  landlordId,
}: LandlordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = !!landlordId;

  const form = useForm<LandlordFormValues>({
    resolver: zodResolver(landlordSchema) as any,
    defaultValues: {
      vrstaIznajmljivaca: "fizicka_osoba",
      tipProvizije: "P",
      iznos: 0,
      prioritetan: false,
      oib: "",
      address: "",
      iban: "",
      phone: "",
      email: "",
      rjesenje: "",
      brUgovora: "",
      eVisitName: "",
      eVisitPass: "",
      surname: "",
      name: "",
      datumRodjenja: "",
      cityId: 0,
      ...defaultValues,
    } as DefaultValues<LandlordFormValues>,
  });

  const vrsta = form.watch("vrstaIznajmljivaca");
  const tipProvizije = form.watch("tipProvizije");

  // Derived display rules based on vrsta
  // Staro — dodaj ovu varijablu uz ostale derived vrijednosti
  const showName = vrsta !== "tvrtka";
  const showDatumRodjenja =
    vrsta === "fizicka_osoba" || vrsta === "fizicka_osoba_pdv";
  const nameRequired =
    vrsta === "fizicka_osoba" ||
    vrsta === "fizicka_osoba_pdv" ||
    vrsta === "obrt";

  const surnameLabel =
    vrsta === "obrt"
      ? "Naziv obrta"
      : vrsta === "tvrtka"
        ? "Naziv tvrtke"
        : "Prezime";
  const nameLabel = vrsta === "obrt" ? "Ime vlasnika" : "Ime";

  // onSubmit

  function onSubmit(data: LandlordFormValues) {
    startTransition(async () => {
      try {
        const result = isEdit
          ? await actionUpdateLandlord(landlordId, data)
          : await actionCreateLandlord(data);

        if (result.error) {
          form.setError("oib", {
            type: "manual",
            message: result.error,
          });
          return;
        }

        router.push("/iznajmljivaci");
      } catch (error) {
        console.error("Failed to save landlord", error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {/* ── Vrsta iznajmljivača ─────────────────────────────── */}
        <section className="bg-card border rounded-lg p-5 mb-4">
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b">
            Vrsta iznajmljivača
          </h2>
          <FormField
            control={form.control}
            name="vrstaIznajmljivaca"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);

                      // Reset polja ovisno o novoj vrsti
                      if (val === "tvrtka") {
                        form.setValue("name", "");
                        form.setValue("datumRodjenja", "");
                      } else if (val === "obrt") {
                        form.setValue("datumRodjenja", "");
                      }

                      if (form.getValues("tipProvizije") === "I") {
                        form.setValue("iznos", 0);
                      }
                    }}
                    className="flex flex-wrap gap-6"
                  >
                    {vrstaOptions.map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <RadioGroupItem value={v} id={`vrsta-${v}`} />
                        <Label
                          htmlFor={`vrsta-${v}`}
                          className="text-sm cursor-pointer font-normal"
                        >
                          {vrstaLabels[v]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* ── Osobni podaci i kontakt ─────────────────────────── */}
        <section className="bg-card border rounded-lg p-5 mb-4">
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b">
            Osobni podaci i kontakt
          </h2>

          <div className="grid grid-cols-2 gap-x-8 gap-y-0">
            {/* LEFT column */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {surnameLabel} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-muted/40"
                        autoComplete="new-password"
                        {...field}
                        onChange={(e) =>
                          field.onChange(capitalizeWords(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showName && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {nameLabel}
                        {nameRequired && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-muted/40"
                          autoComplete="new-password"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(capitalizeWords(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showDatumRodjenja && (
                <FormField
                  control={form.control}
                  name="datumRodjenja"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Datum rođenja{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="dd.mm.gggg."
                          maxLength={10}
                          className="bg-muted/40 max-w-[160px]"
                          autoComplete="new-password"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            // Auto-insert dots: 01 → 01. → 01.03 → 01.03. → 01.03.1990.
                            let v = e.target.value.replace(/[^\d.]/g, "");
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
                            field.onChange(v);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="oib"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      OIB <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-muted/40 max-w-[160px]"
                        maxLength={11}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Grad / mjesto <span className="text-destructive">*</span>
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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Adresa <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-muted/40"
                        autoComplete="new-password"
                        {...field}
                      />
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
                      <Input
                        className="bg-muted/40"
                        autoComplete="new-password"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="bg-muted/40"
                        autoComplete="new-password"
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
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      IBAN <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-muted/40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* RIGHT column */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="rjesenje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rješenje</FormLabel>
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
                name="brUgovora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broj ugovora</FormLabel>
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

              {/* Tip provizije */}
              <FormField
                control={form.control}
                name="tipProvizije"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tip provizije <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          if (val === "I") {
                            form.setValue("iznos", 0);
                          }
                        }}
                        className="flex gap-6 mt-1"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="P" id="tip-P" />
                          <Label
                            htmlFor="tip-P"
                            className="font-normal cursor-pointer"
                          >
                            Postotak (%)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="I" id="tip-I" />
                          <Label
                            htmlFor="tip-I"
                            className="font-normal cursor-pointer"
                          >
                            Iznos (€)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Iznos provizije */}
              <FormField
                control={form.control}
                name="iznos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Iznos provizije{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={tipProvizije === "I"}
                          className="bg-muted/40 w-28"
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          onFocus={(e) => e.target.select()}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        {tipProvizije === "P" ? "%" : "€"}
                      </span>
                    </div>
                    {tipProvizije === "I" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Iznos se obračunava individualno po rezervaciji
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prioritetan */}
              <FormField
                control={form.control}
                name="prioritetan"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mt-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="prioritetan"
                        />
                      </FormControl>
                      <Label
                        htmlFor="prioritetan"
                        className="font-normal cursor-pointer"
                      >
                        Prioritetan iznajmljivač
                      </Label>
                    </div>
                  </FormItem>
                )}
              />

              <Separator className="my-2" />

              {/* eVisitor */}
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                eVisitor podaci
              </p>

              <FormField
                control={form.control}
                name="eVisitName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Korisničko ime</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-muted/40"
                        autoComplete="new-password"
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
                name="eVisitPass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lozinka</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="bg-muted/40"
                        autoComplete="new-password"
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
        </section>

        {/* ── Footer buttons ──────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/iznajmljivaci")}
            disabled={isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Odustani
          </Button>
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4 mr-1" />
            {isPending
              ? "Pohranjivanje..."
              : isEdit
                ? "Spremi izmjene"
                : "Spremi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
