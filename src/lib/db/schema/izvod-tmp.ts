import {
  pgTable,
  uuid,
  varchar,
  integer,
  date,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { reservations } from "./reservations";

export const izvodTmp = pgTable("izvod_tmp", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  year: varchar("year", { length: 4 }).notNull(),
  brojIzvoda: integer("broj_izvoda").notNull(),
  bankRef: varchar("bank_ref", { length: 50 }).notNull(),
  datum: date("datum").notNull(),
  platitelj: varchar("platitelj", { length: 50 }).notNull(),
  pozivNaBroj: varchar("poziv_na_broj", { length: 50 }),
  opisPlacanja: varchar("opis_placanja", { length: 200 }),
  uplaceno: numeric("uplaceno", { precision: 10, scale: 2 }).notNull(),
  rezervationId: uuid("rezervation_id").references(() => reservations.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
