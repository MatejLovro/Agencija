-- Zamjena case-sensitive unique constrainta na cities.name case-insensitive
-- unique indexom preko lower(trim(name)). Provjereno prije migracije: 0
-- postojećih case-insensitive duplikata u tablici cities (15 redaka ukupno).
ALTER TABLE "cities" DROP CONSTRAINT "cities_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "cities_name_lower_unique" ON "cities" USING btree (lower(trim("name")));
