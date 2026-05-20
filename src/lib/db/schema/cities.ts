import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
  id:   integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  zip:  varchar("zip", { length: 10 }),
});
