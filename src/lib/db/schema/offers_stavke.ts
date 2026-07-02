import {
  pgTable,
  uuid,
  varchar,
  numeric,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { offers } from "./offers";
import { services } from "./services";
import { taxes } from "./taxes";

export const offersStavke = pgTable("offers_stavke", {
  id: uuid("id").primaryKey().defaultRandom(),
  offerId: uuid("offer_id")
    .notNull()
    .references(() => offers.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),
  serviceText: varchar("service_text", { length: 200 }).notNull(),
  dodatniOpis: text("dodatni_opis"),
  kolicina: numeric("kolicina", { precision: 10, scale: 2 }).notNull(),
  cijena: numeric("cijena", { precision: 10, scale: 2 }).notNull(),
  rabat: numeric("rabat", { precision: 5, scale: 2 }).notNull().default("0"),
  iznos: numeric("iznos", { precision: 10, scale: 2 }).notNull(),
  taxId: uuid("tax_id").references(() => taxes.id, { onDelete: "restrict" }),
  bruto: numeric("bruto", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
