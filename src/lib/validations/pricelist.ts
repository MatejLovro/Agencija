import { z } from "zod";

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
  .refine((data) => data.dateFrom < data.dateTo, {
    message: "Datum do mora biti nakon datuma od",
    path: ["dateTo"],
  });

export type PricelistEntryFormValues = z.infer<typeof pricelistEntrySchema>;
