import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  numeric,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { taxes } from "./taxes";

export const obracunavaSeEnum = pgEnum("obracunava_se_enum", [
  "dnevno",
  "jednokratno",
  "ne_obracunava_se",
]);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  naziv: varchar("naziv", { length: 60 }).notNull(),
  jedMjere: varchar("jed_mjere", { length: 10 }),
  cijena: numeric("cijena", { precision: 10, scale: 2 }),
  taxId: uuid("tax_id").references(() => taxes.id, { onDelete: "restrict" }),
  obracunavaSe: obracunavaSeEnum("obracunava_se").notNull(),
  poOsobi: boolean("po_osobi").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
