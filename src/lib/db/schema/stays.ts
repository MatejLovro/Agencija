import {
  pgTable, pgEnum, uuid, date, numeric, boolean,
  text, timestamp, bigserial
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { accommodations } from "./accommodations";
import { reservations } from "./reservations";
import { guests } from "./guests";
import { partners } from "./partners";

export const stayStatusEnum = pgEnum("stay_status", [
  "aktivna",
  "odjavljena",
]);

export const stayCategoryEnum = pgEnum("stay_category", [
  "turisti",
  "djeca_do_12",
  "mladi_12_18",
  "osobe_invaliditet",
  "ekskurzija",
  "sezonski_radnici",
  "bolesnici_u_ljecilistima",
  "vikendasi_prijatelji",
  "vlasnik",
  "uza_obitelj",
  "ostale_osobe",
]);

export const stays = pgTable("stays", {
  id:                      uuid("id").primaryKey().defaultRandom(),
  agencyId:                uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "restrict" }),
  accommodationId:         uuid("accommodation_id").notNull().references(() => accommodations.id, { onDelete: "restrict" }),
  redniBroj:               bigserial("redni_broj", { mode: "number" }).notNull(),
  reservationId:           uuid("reservation_id").references(() => reservations.id, { onDelete: "restrict" }),
  guestId:                 uuid("guest_id").notNull().references(() => guests.id, { onDelete: "restrict" }),
  dateFrom:                date("date_from").notNull(),
  dateTo:                  date("date_to").notNull(),
  iznosSmjestaja:          numeric("iznos_smjestaja", { precision: 10, scale: 2 }),
  fakturirana:             boolean("fakturirana").notNull().default(false),
  racunUimeIznajmljivaca:  boolean("racun_u_ime_iznajmljivaca").notNull().default(false),
  partnerId:               uuid("partner_id").references(() => partners.id, { onDelete: "restrict" }),
  status:                  stayStatusEnum("status").notNull().default("aktivna"),
  remark:                  text("remark"),
  createdAt:               timestamp("created_at").defaultNow(),
  updatedAt:               timestamp("updated_at").defaultNow(),
});

export const staysStavke = pgTable("stays_stavke", {
  id:                 uuid("id").primaryKey().defaultRandom(),
  stayId:             uuid("stay_id").notNull().references(() => stays.id, { onDelete: "cascade" }),
  guestId:            uuid("guest_id").notNull().references(() => guests.id, { onDelete: "restrict" }),
  dateFrom:           date("date_from").notNull(),
  dateTo:             date("date_to").notNull(),
  dateEnter:          date("date_enter"),
  dateOfResidPermit:  date("date_of_resid_permit"),
  category:           stayCategoryEnum("category").notNull(),
  remark:             text("remark"),
  createdAt:          timestamp("created_at").defaultNow(),
  updatedAt:          timestamp("updated_at").defaultNow(),
});
