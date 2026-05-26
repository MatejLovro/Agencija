import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  smallint,
  text,
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

export const accommodations = pgTable("accommodations", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => landlords.id, { onDelete: "restrict" }),

  // Basic info
  name: varchar("name", { length: 100 }).notNull(),
  fullName: varchar("full_name", { length: 200 }),
  vrstaApartmana: vrstaApartmanaEnum("vrsta_apartmana").notNull(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "restrict" }),
  address: varchar("address", { length: 100 }).notNull(),
  webUrl: varchar("web_url", { length: 255 }),
  brojZvjezdica: smallint("broj_zvjezdica").notNull(),
  kategorizacijskiBroj: varchar("kategorizacijski_broj", { length: 50 }),

  // Capacity
  brojSoba: integer("broj_soba").notNull(),
  brojKreveta: integer("broj_kreveta").notNull(),
  brojPomocnihLezajeva: integer("broj_pomocnih_lezajeva"),
  maxOsoba: integer("max_osoba"),

  // Status
  aktivan: boolean("aktivan").notNull().default(true),
  prioritetan: boolean("prioritetan").notNull().default(false),
  cistiAgencija: boolean("cisti_agencija").notNull().default(false),

  // Description
  opis: text("opis"),

  // Amenities
  imaKlima: boolean("ima_klima").notNull().default(false),
  imaParking: boolean("ima_parking").notNull().default(false),
  imaWifi: boolean("ima_wifi").notNull().default(false),
  imaRostilj: boolean("ima_rostilj").notNull().default(false),
  imaTerasu: boolean("ima_terasu").notNull().default(false),
  pogledNaMore: boolean("pogled_na_more").notNull().default(false),
  kucniLjubimac: boolean("kucni_ljubimac").notNull().default(false),
  nepusaci: boolean("nepusaci").notNull().default(false),
  pristupacnoInvalidima: boolean("pristupacno_invalidima")
    .notNull()
    .default(false),
  imaKuhinju: boolean("ima_kuhinju").notNull().default(false),
  imaCajnuKuhinju: boolean("ima_cajnu_kuhinju").notNull().default(false),
  brojKupaonica: smallint("broj_kupaonica"),
  kupаonaTus: boolean("kupaona_tus").notNull().default(false),
  imaJacuzzi: boolean("ima_jacuzzi").notNull().default(false),
  kat: smallint("kat"),

  // Nearby / activities
  imaBasen: boolean("ima_bazen").notNull().default(false),
  imaSpa: boolean("ima_spa").notNull().default(false),
  imaFitness: boolean("ima_fitness").notNull().default(false),
  imaRestoran: boolean("ima_restoran").notNull().default(false),
  imaPunjacAuta: boolean("ima_punjac_auta").notNull().default(false),
  udaljenostMore: integer("udaljenost_more"),
  udaljenostCentar: integer("udaljenost_centar"),
  udaljenostTrgovina: integer("udaljenost_trgovina"),
  aktivnostBicikliranje: boolean("aktivnost_bicikliranje")
    .notNull()
    .default(false),
  aktivnostRonjenje: boolean("aktivnost_ronjenje").notNull().default(false),
  aktivnostPlaninarenje: boolean("aktivnost_planinarenje")
    .notNull()
    .default(false),
  katastarskaOpcina: varchar("katastarska_opcina", { length: 100 }),
  katastarskaCestica: varchar("katastarska_cestica", { length: 50 }),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
