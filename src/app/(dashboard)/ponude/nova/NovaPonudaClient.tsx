"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { offerSchema, type OfferFormValues } from "@/lib/validations/offer";
import { actionCreateOffer } from "@/lib/actions/offers";
import type {
  ReservationForOffer,
  ServiceForOffer,
} from "@/lib/db/queries/offers";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import PonudaStavkeTable from "./PonudaStavkeTable";

interface Props {
  rezervacija: ReservationForOffer;
  services: ServiceForOffer[];
  defaultTekstNaDnu: string;
}

function isoToHr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

function hrToIso(hr: string): string {
  const [d, m, y] = hr.replace(/\./g, "-").split("-");
  return `${y}-${m}-${d}`;
}

function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function NovaPonudaClient({
  rezervacija,
  services,
  defaultTekstNaDnu,
}: Props) {
  const router = useRouter();

  const datumIso = rezervacija.createdAt
    ? rezervacija.createdAt.toISOString().split("T")[0]
    : todayIso();

  const doDatumaIso = rezervacija.rezervationValid ?? addDays(datumIso, 2);

  const vrijediDana = daysBetween(datumIso, doDatumaIso);

  const brojDana = daysBetween(rezervacija.dateFrom, rezervacija.dateTo);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema) as any,
    defaultValues: {
      datum: datumIso,
      ponudaVrijedaDana: vrijediDana,
      doDatuma: doDatumaIso,
      predujamPostotak: null,
      predujam: null,
      tekstNaDnu: defaultTekstNaDnu,
      stavke: [],
    },
  });

  const { control, setValue, getValues, watch } = form;

  // Kad se promijeni datum ili vrijediDana → ažuriraj doDatuma
  const datum = watch("datum");
  const ponudaVrijedaDana = watch("ponudaVrijedaDana");

  useEffect(() => {
    if (datum && ponudaVrijedaDana) {
      setValue("doDatuma", addDays(datum, ponudaVrijedaDana));
    }
  }, [datum, ponudaVrijedaDana, setValue]);

  // Kad se promijeni doDatuma → ažuriraj vrijediDana
  const doDatuma = watch("doDatuma");
  useEffect(() => {
    if (datum && doDatuma) {
      setValue("ponudaVrijedaDana", daysBetween(datum, doDatuma));
    }
  }, [doDatuma, datum, setValue]);

  // Izračun sveukupno iz stavki
  const stavke = watch("stavke");
  const sveukupno = stavke.reduce((sum, s) => sum + (Number(s.bruto) || 0), 0);

  // Predujam međuovisnost
  const predujamPostotak = watch("predujamPostotak");
  const predujam = watch("predujam");

  const handlePostotakChange = useCallback(
    (val: string) => {
      const posto = parseFloat(val);
      if (!isNaN(posto) && sveukupno > 0) {
        setValue("predujam", Math.round((posto / 100) * sveukupno * 100) / 100);
      }
    },
    [sveukupno, setValue],
  );

  const handleIznosChange = useCallback(
    (val: string) => {
      const iznos = parseFloat(val);
      if (!isNaN(iznos) && sveukupno > 0) {
        setValue(
          "predujamPostotak",
          Math.round((iznos / sveukupno) * 10000) / 100,
        );
      }
    },
    [sveukupno, setValue],
  );

  async function onSubmit(values: OfferFormValues) {
    const stavkeInsert = values.stavke.map((s) => ({
      serviceId: s.serviceId,
      serviceText: s.serviceText,
      kolicina: String(s.kolicina),
      cijena: String(s.cijena),
      rabat: String(s.rabat),
      iznos: String(s.iznos),
      taxId: s.taxId,
      bruto: String(s.bruto),
    }));

    await actionCreateOffer(
      {
        datum: values.datum,
        idRezervacija: rezervacija.id,
        idPartner: rezervacija.partnerId,
        ponudaVrijedaDana: values.ponudaVrijedaDana,
        doDatuma: values.doDatuma,
        predujam: values.predujam != null ? String(values.predujam) : null,
        predujamPostotak:
          values.predujamPostotak != null
            ? String(values.predujamPostotak)
            : null,
        tekstNaDnu: values.tekstNaDnu,
      },
      stavkeInsert,
    );

    router.push("/rezervacije");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-6 max-w-5xl mx-auto"
      >
        {/* SEKCIJA: PONUDA */}
        <div>
          <h2 className="text-base font-semibold mb-3">Ponuda</h2>
          <Separator className="mb-4" />

          {/* Datum ponude | Vrijedi dana | Vrijedi do */}
          <div className="flex items-end gap-4 mb-4">
            <FormField
              control={control}
              name="datum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Datum ponude</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoFocus
                      className="w-36"
                      value={isoToHr(field.value)}
                      onChange={(e) => field.onChange(hrToIso(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="ponudaVrijedaDana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>&nbsp;</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-16 text-center"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="doDatuma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vrijedi do</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-36"
                      value={field.value ? isoToHr(field.value) : ""}
                      onChange={(e) => field.onChange(hrToIso(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Prezime | Telefon */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <FormLabel>Prezime</FormLabel>
              <Input
                value={rezervacija.guestSurname}
                readOnly
                className="bg-muted mt-1"
              />
            </div>
            <div>
              <FormLabel>Telefon</FormLabel>
              <Input
                value={rezervacija.phone ?? ""}
                readOnly
                className="bg-muted mt-1"
              />
            </div>
          </div>

          {/* Ime | E-mail */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <FormLabel>Ime</FormLabel>
              <Input
                value={rezervacija.guestName}
                readOnly
                className="bg-muted mt-1"
              />
            </div>
            <div>
              <FormLabel>E-mail</FormLabel>
              <Input
                value={rezervacija.email ?? ""}
                readOnly
                className="bg-muted mt-1"
              />
            </div>
          </div>

          {/* Partner */}
          <div className="mb-2">
            <FormLabel>Partner</FormLabel>
            <Input
              value={rezervacija.partnerId ?? "—"}
              readOnly
              className="bg-muted mt-1 w-64"
            />
          </div>
        </div>

        {/* SEKCIJA: SMJEŠTAJ */}
        <div>
          <Separator className="mb-4" />
          <div className="mb-2">
            <FormLabel>Iznajmljivač</FormLabel>
            <Input
              value={`${rezervacija.landlordSurname} ${rezervacija.landlordName}`}
              readOnly
              className="bg-muted mt-1 w-64"
            />
          </div>
          <div className="mb-2">
            <FormLabel>Smještaj</FormLabel>
            <Input
              value={rezervacija.accommodationName}
              readOnly
              className="bg-muted mt-1 w-64"
            />
          </div>
          <div className="flex items-end gap-4">
            <div>
              <FormLabel>Od datuma</FormLabel>
              <Input
                value={isoToHr(rezervacija.dateFrom)}
                readOnly
                className="bg-muted mt-1 w-36"
              />
            </div>
            <div>
              <FormLabel>Do datuma</FormLabel>
              <Input
                value={isoToHr(rezervacija.dateTo)}
                readOnly
                className="bg-muted mt-1 w-36"
              />
            </div>
            <div>
              <FormLabel>Broj dana</FormLabel>
              <Input
                value={brojDana}
                readOnly
                className="bg-muted mt-1 w-20 text-center"
              />
            </div>
          </div>
        </div>

        {/* TABLICA STAVKI */}
        <PonudaStavkeTable
          control={control}
          services={services}
          setValue={setValue}
          getValues={getValues}
        />

        {/* SVEUKUPNO */}
        <div className="flex justify-end">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-primary">
              Sveukupno (€):
            </span>
            <span className="text-lg font-semibold text-primary w-28 text-right">
              {sveukupno.toFixed(2)}
            </span>
          </div>
        </div>

        {/* PREDUJAM */}
        <div className="flex gap-4 items-end">
          <div>
            <FormLabel>Predujam %</FormLabel>
            <Input
              className="w-28 mt-1"
              value={predujamPostotak ?? ""}
              onChange={(e) => {
                setValue(
                  "predujamPostotak",
                  parseFloat(e.target.value) || null,
                );
                handlePostotakChange(e.target.value);
              }}
            />
          </div>
          <div>
            <FormLabel>Predujam iznos</FormLabel>
            <Input
              className="w-36 mt-1"
              value={predujam ?? ""}
              onChange={(e) => {
                setValue("predujam", parseFloat(e.target.value) || null);
                handleIznosChange(e.target.value);
              }}
            />
          </div>
        </div>

        {/* TEKST NA DNU */}
        <FormField
          control={control}
          name="tekstNaDnu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tekst na dnu ponude</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  className="min-h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GUMBI */}
        <div className="flex gap-3">
          <Button type="submit">Spremi i pošalji</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/rezervacije")}
          >
            Odustani
          </Button>
        </div>
      </form>
    </Form>
  );
}
