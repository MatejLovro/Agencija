import {
  pgTable, pgEnum, uuid, varchar, integer,
  boolean, timestamp,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { cities } from "./cities";
import { landlords } from "./landlords";

export const vrstaApartmanaEnum = pgEnum("vrsta_apartmana", [
  "apartman",
  "soba",
  "studio",
  "vila",
  "kuca",
  "mobilna_kucica",
]);

export const blizinaPlazeEnum = pgEnum("blizina_plaze", [
  "prvi_red",
  "drugi_red",
  "uz_more",
  "ostalo",
]);

export const accommodations = pgTable("accommodations", {
  id:             uuid("id").primaryKey().defaultRandom(),
  agencyId:       uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "restrict" }),
  landlordId:     uuid("landlord_id").notNull().references(() => landlords.id, { onDelete: "restrict" }),
  name:           varchar("name", { length: 100 }).notNull(),
  vrstaApartmana: vrstaApartmanaEnum("vrsta_apartmana").notNull(),
  cityId:         integer("city_id").notNull().references(() => cities.id, { onDelete: "restrict" }),
  address:        varchar("address", { length: 100 }).notNull(),
  brojSoba:       integer("broj_soba").notNull(),
  brojKreveta:    integer("broj_kreveta").notNull(),
  maxOsoba:       integer("max_osoba"),
  blizinePlaze:   blizinaPlazeEnum("blizina_plaze").notNull(),
  aktivan:        boolean("aktivan").notNull().default(true),
  prioritetan:    boolean("prioritetan").notNull().default(false),
  createdAt:      timestamp("created_at").defaultNow(),
  updatedAt:      timestamp("updated_at").defaultNow(),
});
