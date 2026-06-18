// src/lib/utils/kalendarValidacija.ts
import { db } from "@/lib/db";
import { stays } from "@/lib/db/schema/stays";
import { reservations } from "@/lib/db/schema/reservations";
import { and, eq, lt, gt } from "drizzle-orm";

/**
 * Provjerava postoji li prijava (stay) koja se STVARNO preklapa s periodom
 * [od, do] u zadanom apartmanu. Rubno preklapanje (checkout = checkin)
 * NIJE preklapanje — strogo unutarnja usporedba.
 *
 * Uvjet preklapanja: stay.dateFrom < do AND stay.dateTo > od
 */
export async function checkPostojiPrijavaUPeriodu(
  accommodationId: string,
  od: string,
  do_: string,
): Promise<boolean> {
  const rezultat = await db
    .select({ id: stays.id })
    .from(stays)
    .where(
      and(
        eq(stays.accommodationId, accommodationId),
        lt(stays.dateFrom, do_),
        gt(stays.dateTo, od),
      ),
    )
    .limit(1);

  return rezultat.length > 0;
}

/**
 * Provjerava postoji li POTVRĐENA rezervacija koja se STVARNO preklapa
 * s periodom [od, do] u zadanom apartmanu. Rubno preklapanje
 * (npr. nova rezervacija počinje kad stara završava) NIJE preklapanje.
 *
 * Uvjet preklapanja: reservation.dateFrom < do AND reservation.dateTo > od
 */
export async function checkPostojiPotvrdjenaRezervacijaUPeriodu(
  accommodationId: string,
  od: string,
  do_: string,
): Promise<boolean> {
  const rezultat = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.accommodationId, accommodationId),
        eq(reservations.status, "potvrdjena"),
        lt(reservations.dateFrom, do_),
        gt(reservations.dateTo, od),
      ),
    )
    .limit(1);

  return rezultat.length > 0;
}
