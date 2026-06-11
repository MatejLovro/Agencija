import { z } from "zod";
import { hrDateToIso } from "@/lib/utils/dates";

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
