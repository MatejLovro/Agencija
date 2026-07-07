import { db } from "@/lib/db";
import { izvodTmp } from "@/lib/db/schema/izvod-tmp";
import { reservations } from "@/lib/db/schema/reservations";
import { offers } from "@/lib/db/schema/offers";
import { eq, and, isNotNull } from "drizzle-orm";

export type NewIzvodTmpEntry = typeof izvodTmp.$inferInsert;

// Deletes all existing staging rows for this agency before a new statement upload
export async function deleteAllIzvodTmp(agencyId: string) {
  return db.delete(izvodTmp).where(eq(izvodTmp.agencyId, agencyId));
}

// Bulk insert of parsed statement entries (single INSERT with multiple rows,
// not a multi-statement transaction, so this is safe on the Neon HTTP driver)
export async function createIzvodTmpEntries(entries: NewIzvodTmpEntry[]) {
  if (entries.length === 0) return [];
  return db.insert(izvodTmp).values(entries).returning();
}

// Returns staging rows joined with reservation + offer info, for display in the table.
// Offer info is derived (not stored) via offers.idRezervacija.
export async function getIzvodTmp(agencyId: string) {
  return db
    .select({
      id: izvodTmp.id,
      brojIzvoda: izvodTmp.brojIzvoda,
      year: izvodTmp.year,
      datum: izvodTmp.datum,
      platitelj: izvodTmp.platitelj,
      pozivNaBroj: izvodTmp.pozivNaBroj,
      opisPlacanja: izvodTmp.opisPlacanja,
      uplaceno: izvodTmp.uplaceno,
      bankRef: izvodTmp.bankRef,
      rezervationId: izvodTmp.rezervationId,
      rezervationRedniBroj: reservations.redniBroj,
      guestName: reservations.guestName,
      guestSurname: reservations.guestSurname,
      offerBroj: offers.broj,
      offerYear: offers.datum, // godina se izvodi iz datuma ponude na prikaznom sloju
    })
    .from(izvodTmp)
    .leftJoin(reservations, eq(izvodTmp.rezervationId, reservations.id))
    .leftJoin(offers, eq(offers.idRezervacija, reservations.id))
    .where(eq(izvodTmp.agencyId, agencyId))
    .orderBy(izvodTmp.datum);
}

// Links (or unlinks, if rezervationId is null) a staging row to a reservation
export async function updateIzvodTmpRezervacija(
  id: string,
  agencyId: string,
  rezervationId: string | null,
) {
  return db
    .update(izvodTmp)
    .set({ rezervationId, updatedAt: new Date() })
    .where(and(eq(izvodTmp.id, id), eq(izvodTmp.agencyId, agencyId)))
    .returning();
}

// Rows ready to be posted to payments — only those linked to a reservation
export async function getIzvodTmpForProknjizba(agencyId: string) {
  return db
    .select()
    .from(izvodTmp)
    .where(
      and(eq(izvodTmp.agencyId, agencyId), isNotNull(izvodTmp.rezervationId)),
    );
}

// Explicit row type for the /unos_izvoda table (used by actionGetIzvodTmp)
export type IzvodTmpRow = Awaited<ReturnType<typeof getIzvodTmp>>[number];
