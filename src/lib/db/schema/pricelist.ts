import { pgTable, uuid, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { accommodations } from "./accommodations";

export const pricelist = pgTable("pricelist", {
  id:              uuid("id").primaryKey().defaultRandom(),
  accommodationId: uuid("accommodation_id").notNull().references(() => accommodations.id, { onDelete: "cascade" }),
  dateFrom:        date("date_from").notNull(),
  dateTo:          date("date_to").notNull(),
  pricePerNight:   numeric("price_per_night", { precision: 10, scale: 2 }).notNull(),
  createdAt:       timestamp("created_at").defaultNow(),
  updatedAt:       timestamp("updated_at").defaultNow(),
});
