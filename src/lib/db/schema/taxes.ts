import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";

export const taxes = pgTable("taxes", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  sifra: varchar("sifra", { length: 10 }).notNull(),
  naziv: varchar("naziv", { length: 50 }).notNull(),
  stopa: numeric("stopa", { precision: 5, scale: 2 }).notNull(),
  kategorijaEracun: varchar("kategorija_eracun", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
