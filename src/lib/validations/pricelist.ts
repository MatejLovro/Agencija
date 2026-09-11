import { z } from "zod";
import { hrDateToIso } from "@/lib/utils/dates";

// Razuman raspon godina samo za cjenik — namjerno odvojeno od dates.ts, koji
// se dijeli s drugim datumskim poljima s vlastitim rasponom (npr. datum
// rođenja). Cjenik se radi unaprijed, ali ne godinama unaprijed, pa gornja
// granica sprječava tipfelere poput "0264" umjesto "2026".
function isYearInPricelistRange(isoDate: string): boolean {
  const year = Number(isoDate.slice(0, 4));
  const currentYear = new Date().getFullYear();
  return year >= currentYear && year <= currentYear + 3;
}

export const pricelistEntrySchema = z
  .object({
    dateFrom: z.string().min(1, "Datum od je obavezan"),
    dateTo: z.string().min(1, "Datum do je obavezan"),
    pricePerNight: z.number().positive("Cijena mora biti pozitivan broj"),
    landlordPrice: z
      .number()
      .positive("Cijena mora biti pozitivan broj")
      .optional(),
  })
  .refine(
    (data) => {
      const from = hrDateToIso(data.dateFrom);
      if (!from) return true; // nekompletan/neispravan format prijavljuje druga validacija
      return isYearInPricelistRange(from);
    },
    {
      message: `Godina mora biti između ${new Date().getFullYear()} i ${new Date().getFullYear() + 3}`,
      path: ["dateFrom"],
    },
  )
  .refine(
    (data) => {
      const to = hrDateToIso(data.dateTo);
      if (!to) return true;
      return isYearInPricelistRange(to);
    },
    {
      message: `Godina mora biti između ${new Date().getFullYear()} i ${new Date().getFullYear() + 3}`,
      path: ["dateTo"],
    },
  )
  .refine(
    (data) => {
      const from = hrDateToIso(data.dateFrom);
      const to = hrDateToIso(data.dateTo);
      if (!from || !to) return true; // ako datumi nisu kompletni, preskočи
      return from < to;
    },
    {
      message: "Datum do mora biti nakon datuma od",
      path: ["dateTo"],
    },
  );

export type PricelistEntryFormValues = z.infer<typeof pricelistEntrySchema>;
