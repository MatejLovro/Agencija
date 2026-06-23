import {
  pgTable,
  pgEnum,
  uuid,
  date,
  integer,
  numeric,
  text,
  timestamp,
  bigserial,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { reservations } from "./reservations";
import { guests } from "./guests";
import { partners } from "./partners";

export const ponudaZaEnum = pgEnum("ponuda_za_enum", [
  "gost",
  "partner",
  "rezervacija",
]);

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  broj: bigserial("broj", { mode: "number" }).notNull(),
  datum: date("datum").notNull(),
  ponudaZa: ponudaZaEnum("ponuda_za").notNull(),
  idRezervacija: uuid("id_rezervacija").references(() => reservations.id, {
    onDelete: "restrict",
  }),
  idGost: uuid("id_gost").references(() => guests.id, { onDelete: "restrict" }),
  idPartner: uuid("id_partner").references(() => partners.id, {
    onDelete: "restrict",
  }),
  ponudaVrijedaDana: integer("ponuda_vrijedi_dana"),
  doDatuma: date("do_datuma"),
  predujam: numeric("predujam", { precision: 10, scale: 2 }),
  tekstNaDnu: text("tekst_na_dnu"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
