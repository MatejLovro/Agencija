// src/lib/validations/reservation.ts
import { z } from "zod";

// ─── Helpers za hrvatski datumski format ────────────────────────────────────

function isValidHrDate(value: string): boolean {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})\.?$/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function hrDateToIso(hr: string): string {
  const match = hr.match(/^(\d{2})\.(\d{2})\.(\d{4})\.?$/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Email regex ─────────────────────────────────────────────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Zod shema ───────────────────────────────────────────────────────────────

export const reservationSchema = z
  .object({
    accommodationId: z.string().min(1, "Apartman je obavezan"),
    landlordId: z.string().min(1, "Iznajmljivač je obavezan"),

    guestSurname: z.string().min(1, "Prezime je obavezno"),
    guestName: z.string().min(1, "Ime je obavezno"),
    email: z
      .string()
      .min(1, "Email je obavezan")
      .refine((val) => emailRegex.test(val), "Email nije ispravnog formata"),
    phone: z.string().optional().or(z.literal("")),

    adults: z.coerce.number().int().min(1, "Mora biti barem 1").default(1),
    teens18: z.coerce.number().int().min(0).default(0),
    children: z.coerce.number().int().min(0).default(0),

    dateFrom: z
      .string()
      .min(1, "Datum 'Od' je obavezan")
      .refine(isValidHrDate, "Neispravan format datuma (dd.mm.gggg.)"),
    dateTo: z
      .string()
      .min(1, "Datum 'Do' je obavezan")
      .refine(isValidHrDate, "Neispravan format datuma (dd.mm.gggg.)"),

    rezervationValid: z
      .string()
      .min(1, "Datum 'Vrijedi do' je obavezan")
      .refine(isValidHrDate, "Neispravan format datuma (dd.mm.gggg.)"),

    remark: z.string().optional().or(z.literal("")),
    partnerId: z.string().optional().or(z.literal("")),
  })
  // dateFrom mora biti veći od današnjeg datuma
  .refine(
    (data) => {
      if (!isValidHrDate(data.dateFrom)) return true;
      const todayIso = new Date().toISOString().slice(0, 10);
      return hrDateToIso(data.dateFrom) > todayIso;
    },
    {
      message: "Datum 'Od' mora biti veći od današnjeg datuma",
      path: ["dateFrom"],
    },
  )
  // dateTo mora biti veći od dateFrom
  .refine(
    (data) => {
      if (!isValidHrDate(data.dateFrom) || !isValidHrDate(data.dateTo))
        return true;
      return hrDateToIso(data.dateTo) > hrDateToIso(data.dateFrom);
    },
    {
      message: "Datum 'Do' mora biti veći od datuma 'Od'",
      path: ["dateTo"],
    },
  )
  // rezervationValid mora biti manji od dateFrom
  .refine(
    (data) => {
      if (
        !isValidHrDate(data.dateFrom) ||
        !isValidHrDate(data.rezervationValid)
      )
        return true;
      return hrDateToIso(data.rezervationValid) < hrDateToIso(data.dateFrom);
    },
    {
      message:
        "Datum 'Vrijedi do' mora biti manji od datuma početka rezervacije",
      path: ["rezervationValid"],
    },
  );

export type ReservationFormValues = z.infer<typeof reservationSchema>;

// ─── Export helpera za korištenje u komponenti/Server Actionu ───────────────

export { isValidHrDate, hrDateToIso };
