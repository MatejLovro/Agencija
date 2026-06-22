import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  date,
  numeric,
  boolean,
  text,
  timestamp,
  bigserial,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { accommodations } from "./accommodations";
import { partners } from "./partners";

export const reservationStatusEnum = pgEnum("reservation_status", [
  "nepotvrdjena",
  "potvrdjena",
]);

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  accommodationId: uuid("accommodation_id")
    .notNull()
    .references(() => accommodations.id, { onDelete: "restrict" }),
  redniBroj: bigserial("redni_broj", { mode: "number" }).notNull(),
  guestName: varchar("guest_name", { length: 30 }).notNull(),
  guestSurname: varchar("guest_surname", { length: 30 }).notNull(),
  email: varchar("email", { length: 50 }),
  phone: varchar("phone", { length: 30 }),
  dateFrom: date("date_from").notNull(),
  dateTo: date("date_to").notNull(),
  adults: integer("adults").notNull().default(1),
  teens18: integer("teens_18").notNull().default(0),
  children: integer("children").notNull().default(0),
  pet: boolean("pet").notNull().default(false),
  price: numeric("price", { precision: 10, scale: 2 }),
  avansPercent: numeric("avans_percent", { precision: 5, scale: 2 }),
  avansAmount: numeric("avans_amount", { precision: 10, scale: 2 }),
  rezervationValid: date("rezervation_valid"),
  status: reservationStatusEnum("status").notNull().default("nepotvrdjena"),
  partnerId: uuid("partner_id").references(() => partners.id, {
    onDelete: "restrict",
  }),
  description: text("description"),
  remark: text("remark"),
  stornirana: boolean("stornirana").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
