// src/lib/actions/izvod.ts
"use server";

import { revalidatePath } from "next/cache";
import { parseCamt053 } from "@/lib/utils/parse-camt053";
import {
  deleteAllIzvodTmp,
  createIzvodTmpEntries,
  getIzvodTmp,
  updateIzvodTmpRezervacija,
  getIzvodTmpForProknjizba,
  IzvodTmpRow,
} from "@/lib/db/queries/izvod-tmp";
import { createPayments, NewPaymentEntry } from "@/lib/db/queries/payments";

// ─── Dohvat privremene tabele za /unos_izvoda ───────────────────────────────

export async function actionGetIzvodTmp(): Promise<IzvodTmpRow[]> {
  return getIzvodTmp(process.env.AGENCY_ID!);
}

// ─── Učitavanje XML izvoda ───────────────────────────────────────────────────

export type UcitajIzvodResult =
  | { success: true; count: number }
  | { success: false; error: string };

export async function actionUcitajIzvod(
  formData: FormData,
): Promise<UcitajIzvodResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "Datoteka nije priložena." };
  }

  if (!file.name.toLowerCase().endsWith(".xml")) {
    return {
      success: false,
      error: "Očekivana je .xml datoteka (camt.053.001.08).",
    };
  }

  let xml: string;
  try {
    xml = await file.text();
  } catch {
    return { success: false, error: "Ne mogu pročitati sadržaj datoteke." };
  }

  let parsedEntries;
  try {
    parsedEntries = parseCamt053(xml);
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Greška prilikom parsiranja XML izvoda.",
    };
  }

  if (parsedEntries.length === 0) {
    return { success: false, error: "Izvod ne sadrži nijednu stavku." };
  }

  try {
    // Uvijek brišemo prethodne privremene podatke prije učitavanja novog izvoda
    await deleteAllIzvodTmp(process.env.AGENCY_ID!);

    const entriesToInsert = parsedEntries.map((entry) => ({
      agencyId: process.env.AGENCY_ID!,
      year: entry.year,
      brojIzvoda: entry.brojIzvoda,
      bankRef: entry.bankRef,
      datum: entry.datum,
      platitelj: entry.platitelj,
      pozivNaBroj: entry.pozivNaBroj,
      opisPlacanja: entry.opisPlacanja,
      uplaceno: entry.uplaceno.toFixed(2),
      rezervationId: null,
    }));

    await createIzvodTmpEntries(entriesToInsert);

    revalidatePath("/unos_izvoda");
    return { success: true, count: entriesToInsert.length };
  } catch (e) {
    return {
      success: false,
      error: "Greška prilikom spremanja izvoda u bazu.",
    };
  }
}

// ─── Povezivanje retka s rezervacijom ───────────────────────────────────────

export type PovezRezervacijuResult =
  | { success: true }
  | { success: false; error: string };

export async function actionPovezRezervaciju(
  id: string,
  rezervationId: string | null,
): Promise<PovezRezervacijuResult> {
  try {
    await updateIzvodTmpRezervacija(id, process.env.AGENCY_ID!, rezervationId);
    revalidatePath("/unos_izvoda");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: "Ne mogu spremiti povezivanje s rezervacijom.",
    };
  }
}

// ─── Proknjižba povezanih uplata ────────────────────────────────────────────

export type ProknjiziResult =
  | { success: true; linkedCount: number; insertedCount: number }
  | { success: false; error: string };

export async function actionProknjizi(): Promise<ProknjiziResult> {
  const agencyId = process.env.AGENCY_ID!;

  try {
    const rowsToPost = await getIzvodTmpForProknjizba(agencyId);

    if (rowsToPost.length === 0) {
      return { success: false, error: "Nema povezanih uplata za proknjižbu." };
    }

    const paymentEntries: NewPaymentEntry[] = rowsToPost.map((row) => ({
      agencyId: row.agencyId,
      year: row.year,
      brojIzvoda: row.brojIzvoda,
      bankRef: row.bankRef,
      datum: row.datum,
      platitelj: row.platitelj,
      pozivNaBroj: row.pozivNaBroj,
      opisPlacanja: row.opisPlacanja,
      uplaceno: row.uplaceno,
      rezervationId: row.rezervationId,
    }));

    const inserted = await createPayments(paymentEntries);

    revalidatePath("/unos_izvoda");
    return {
      success: true,
      linkedCount: rowsToPost.length,
      insertedCount: inserted.length,
    };
  } catch (e) {
    return { success: false, error: "Greška prilikom proknjižbe uplata." };
  }
}
