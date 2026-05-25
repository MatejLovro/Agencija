ALTER TABLE "accommodations" ADD COLUMN "cisti_agencija" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_wifi" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_rostilj" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "nepusaci" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "pristupacno_invalidima" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_kuhinju" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_cajnu_kuhinju" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "broj_kupaonica" smallint;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "kupaona_tus" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_jacuzzi" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "kat" smallint;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_bazen" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_spa" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_fitness" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_restoran" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_punjac_auta" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "aktivnost_bicikliranje" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "aktivnost_ronjenje" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "aktivnost_planinarenje" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" DROP COLUMN "blizina_plaze";--> statement-breakpoint
DROP TYPE "public"."blizina_plaze";