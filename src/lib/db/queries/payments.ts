import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema/payments";
import { eq } from "drizzle-orm";

export type NewPaymentEntry = typeof payments.$inferInsert;

// Inserts linked rows into payments. onConflictDoNothing guards against
// re-posting the same bank transaction twice (unique index on agency_id + bank_ref).
export async function createPayments(entries: NewPaymentEntry[]) {
  if (entries.length === 0) return [];
  return db
    .insert(payments)
    .values(entries)
    .onConflictDoNothing({
      target: [payments.agencyId, payments.bankRef],
    })
    .returning();
}

export async function getPayments(agencyId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.agencyId, agencyId))
    .orderBy(payments.datum);
}
