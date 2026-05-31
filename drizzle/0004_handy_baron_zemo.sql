ALTER TYPE "public"."vrsta_iznajmljivaca" ADD VALUE 'fizicka_osoba_pdv' BEFORE 'obrt';--> statement-breakpoint
ALTER TABLE "landlords" DROP CONSTRAINT "landlords_oib_unique";--> statement-breakpoint
ALTER TABLE "landlords" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "landlords" ADD COLUMN "email" varchar(100);--> statement-breakpoint
ALTER TABLE "landlords" ADD COLUMN "datum_rodjenja" date;--> statement-breakpoint
ALTER TABLE "landlords" ADD COLUMN "prioritetan" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "katastarska_opcina" varchar(100);--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "katastarska_cestica" varchar(50);--> statement-breakpoint
CREATE INDEX "landlords_agency_oib_idx" ON "landlords" USING btree ("agency_id","oib");