import {
  pgTable, pgEnum, uuid, varchar, integer, timestamp
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { cities } from "./cities";

export const partnerTypeEnum = pgEnum("partner_type", ["obrt", "firma"]);

export const pdvStatusEnum = pgEnum("pdv_status", ["pdv", "not_pdv"]);

export const partners = pgTable("partners", {
  id:             uuid("id").primaryKey().defaultRandom(),
  agencyId:       uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "restrict" }),
  name:           varchar("name", { length: 50 }).notNull(),
  name2:          varchar("name2", { length: 50 }),
  type:           partnerTypeEnum("type").notNull(),
  oib:            varchar("oib", { length: 11 }).notNull(),
  cityId:         integer("city_id").notNull().references(() => cities.id, { onDelete: "restrict" }),
  address:        varchar("address", { length: 30 }).notNull(),
  state:          varchar("state", { length: 3 }).notNull(),
  pdvStatus:      pdvStatusEnum("pdv_status").notNull(),
  iban:           varchar("iban", { length: 34 }).notNull(),
  phone:          varchar("phone", { length: 40 }),
  email:          varchar("email", { length: 40 }),
  contactPerson:  varchar("contact_person", { length: 40 }),
  createdAt:      timestamp("created_at").defaultNow(),
  updatedAt:      timestamp("updated_at").defaultNow(),
});
