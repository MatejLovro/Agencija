import {
  pgTable,
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
import { partners } from "./partners";

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  broj: bigserial("broj", { mode: "number" }).notNull(),
  datum: date("datum").notNull(),
  idRezervacija: uuid("id_rezervacija").references(() => reservations.id, {
    onDelete: "restrict",
  }),
  idPartner: uuid("id_partner").references(() => partners.id, {
    onDelete: "restrict",
  }),
  ponudaVrijedaDana: integer("ponuda_vrijedi_dana"),
  doDatuma: date("do_datuma"),
  predujam: numeric("predujam", { precision: 10, scale: 2 }),
  predujamPostotak: numeric("predujam_postotak", { precision: 5, scale: 2 }),
  tekstNaDnu: text("tekst_na_dnu"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
