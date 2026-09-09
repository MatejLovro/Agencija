import { pgTable, integer, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const cities = pgTable(
  "cities",
  {
    id:   integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // Napomena: naziv grada je case-insensitive jedinstven — vidi
    // cities_name_lower_unique niže (usporedba preko lower(trim(name))).
    // Prikazani naziv ostaje onakav kakav je korisnik unio.
    name: varchar("name", { length: 100 }).notNull(),
    zip:  varchar("zip", { length: 10 }),
  },
  (table) => [
    uniqueIndex("cities_name_lower_unique").on(sql`lower(trim(${table.name}))`),
  ],
);
