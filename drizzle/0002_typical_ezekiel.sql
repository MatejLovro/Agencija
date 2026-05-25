ALTER TABLE "accommodations" ADD COLUMN "full_name" varchar(200);--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "broj_pomocnih_lezajeva" integer;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "broj_zvjezdica" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "kategorizacijski_broj" varchar(50);--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "web_url" varchar(255);--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "opis" text;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_klima" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_parking" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "kucni_ljubimac" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "ima_terasu" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "pogled_na_more" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "udaljenost_more" integer;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "udaljenost_centar" integer;--> statement-breakpoint
ALTER TABLE "accommodations" ADD COLUMN "udaljenost_trgovina" integer;