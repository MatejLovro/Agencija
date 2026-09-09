import { db } from "@/lib/db";
import { accommodations, pricelist } from "@/lib/db/schema";
import { and, asc, eq, ne, sql } from "drizzle-orm";

export async function getPricelistByAccommodation(accommodationId: string) {
  return db
    .select({
      id: pricelist.id,
      dateFrom: pricelist.dateFrom,
      dateTo: pricelist.dateTo,
      pricePerNight: pricelist.pricePerNight,
      landlordPrice: pricelist.landlordPrice,
    })
    .from(pricelist)
    .where(eq(pricelist.accommodationId, accommodationId))
    .orderBy(asc(pricelist.dateFrom));
}

export async function createPricelistEntry(
  data: typeof pricelist.$inferInsert,
) {
  const [entry] = await db.insert(pricelist).values(data).returning();
  return entry;
}

export async function updatePricelistEntry(
  id: string,
  data: Partial<typeof pricelist.$inferInsert>,
) {
  const [entry] = await db
    .update(pricelist)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pricelist.id, id))
    .returning();
  return entry;
}

export async function deletePricelistEntry(id: string) {
  await db.delete(pricelist).where(eq(pricelist.id, id));
}

export type PricelistRow = Awaited<
  ReturnType<typeof getPricelistByAccommodation>
>[number];

export type CopyPricelistResult =
  | { success: true; copiedToCount: number }
  | { success: false; reason: "SOURCE_HAS_NO_PRICELIST" | "NO_EMPTY_TARGETS" };

/**
 * Kopira cjenik izvorišne jedinice na sve DRUGE jedinice istog iznajmljivača
 * koje trenutno nemaju nijedan redak cjenika. Server ponovno provjerava
 * izvor i prazne ciljeve u trenutku izvršenja (ne oslanja se na client
 * hasPricelist stanje koje može biti zastarjelo).
 *
 * neon-http driver ne podržava db.transaction() (nema BEGIN/COMMIT preko
 * HTTP-a), pa se "sve ili ništa" postiže jednim multi-row INSERT-om — jedan
 * SQL insert statement je u Postgresu already atomičan.
 */
export async function copyPricelistToEmptyAccommodations(
  sourceAccommodationId: string,
): Promise<CopyPricelistResult> {
  const source = await db
    .select({ landlordId: accommodations.landlordId })
    .from(accommodations)
    .where(eq(accommodations.id, sourceAccommodationId))
    .limit(1);

  if (!source[0]) {
    return { success: false, reason: "SOURCE_HAS_NO_PRICELIST" };
  }

  const sourceEntries = await getPricelistByAccommodation(
    sourceAccommodationId,
  );
  if (sourceEntries.length === 0) {
    return { success: false, reason: "SOURCE_HAS_NO_PRICELIST" };
  }

  const emptyTargets = await db
    .select({ id: accommodations.id })
    .from(accommodations)
    .leftJoin(pricelist, eq(pricelist.accommodationId, accommodations.id))
    .where(
      and(
        eq(accommodations.landlordId, source[0].landlordId),
        ne(accommodations.id, sourceAccommodationId),
      ),
    )
    .groupBy(accommodations.id)
    .having(sql`count(${pricelist.id}) = 0`);

  if (emptyTargets.length === 0) {
    return { success: false, reason: "NO_EMPTY_TARGETS" };
  }

  const rowsToInsert = emptyTargets.flatMap((target) =>
    sourceEntries.map((entry) => ({
      accommodationId: target.id,
      dateFrom: entry.dateFrom,
      dateTo: entry.dateTo,
      pricePerNight: entry.pricePerNight,
      landlordPrice: entry.landlordPrice,
    })),
  );

  await db.insert(pricelist).values(rowsToInsert);

  return { success: true, copiedToCount: emptyTargets.length };
}
