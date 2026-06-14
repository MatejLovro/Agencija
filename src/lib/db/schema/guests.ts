import {
  pgTable, pgEnum, uuid, varchar, integer, date, timestamp
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { cities } from "./cities";

export const genderEnum = pgEnum("gender", ["muski", "zenski"]);

export const documentTypeEnum = pgEnum("document_type", [
  "osobna",
  "putovnica",
  "diplomatska_putovnica",
  "ostalo",
]);

export const guests = pgTable("guests", {
  id:                  uuid("id").primaryKey().defaultRandom(),
  agencyId:            uuid("agency_id").notNull().references(() => agencies.id, { onDelete: "restrict" }),
  surname:             varchar("surname", { length: 30 }).notNull(),
  name:                varchar("name", { length: 30 }).notNull(),
  gender:              genderEnum("gender").notNull(),
  dateOfBirth:         date("date_of_birth").notNull(),
  cityBirth:           integer("city_birth").references(() => cities.id, { onDelete: "restrict" }),
  stateBirth:          varchar("state_birth", { length: 3 }).notNull(),
  documentType:        documentTypeEnum("document_type").notNull(),
  documentNumber:      varchar("document_number", { length: 30 }).notNull(),
  citizenship:         varchar("citizenship", { length: 3 }).notNull(),
  placeOfResidence:    integer("place_of_residence").references(() => cities.id, { onDelete: "restrict" }),
  addressOfResidence:  varchar("address_of_residence", { length: 40 }),
  oib:                 varchar("oib", { length: 11 }),
  createdAt:           timestamp("created_at").defaultNow(),
  updatedAt:           timestamp("updated_at").defaultNow(),
});
