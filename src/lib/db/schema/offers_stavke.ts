import { pgTable, uuid, numeric, timestamp } from "drizzle-orm/pg-core";
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
  kolicina: numeric("kolicina", { precision: 10, scale: 2 }).notNull(),
  cijena: numeric("cijena", { precision: 10, scale: 2 }).notNull(),
  rabat: numeric("rabat", { precision: 5, scale: 2 }).notNull().default("0"),
  taxId: uuid("tax_id").references(() => taxes.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
