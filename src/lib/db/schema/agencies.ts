import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const agencies = pgTable("agencies", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      varchar("name", { length: 100 }).notNull(),
  oib:       varchar("oib", { length: 11 }).notNull().unique(),
  address:   varchar("address", { length: 100 }),
  phone:     varchar("phone", { length: 50 }),
  email:     varchar("email", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
