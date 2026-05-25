import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { cities } from "./cities";

export const tipProvizijeEnum = pgEnum("tip_provizije", ["P", "I"]);

export const vrstaIznajmljivacaEnum = pgEnum("vrsta_iznajmljivaca", [
  "fizicka_osoba",
  "obrt",
  "tvrtka",
]);

export const landlords = pgTable("landlords", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  surname: varchar("surname", { length: 30 }).notNull(),
  name: varchar("name", { length: 30 }).notNull(),
  vrstaIznajmljivaca: vrstaIznajmljivacaEnum("vrsta_iznajmljivaca").notNull(),
  oib: varchar("oib", { length: 11 }).notNull().unique(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "restrict" }),
  address: varchar("address", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 100 }),
  iban: varchar("iban", { length: 50 }).notNull(),
  rjesenje: varchar("rjesenje", { length: 30 }),
  brUgovora: varchar("br_ugovora", { length: 30 }),
  tipProvizije: tipProvizijeEnum("tip_provizije").notNull(),
  iznos: numeric("iznos", { precision: 10, scale: 2 }).notNull(),
  eVisitName: varchar("evisit_name", { length: 30 }),
  eVisitPass: varchar("evisit_pass", { length: 30 }),
  prioritetan: boolean("prioritetan").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
