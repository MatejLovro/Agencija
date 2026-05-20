CREATE TYPE "public"."tip_provizije" AS ENUM('P', 'I');--> statement-breakpoint
CREATE TYPE "public"."vrsta_iznajmljivaca" AS ENUM('fizicka_osoba', 'obrt', 'tvrtka');--> statement-breakpoint
CREATE TYPE "public"."blizina_plaze" AS ENUM('prvi_red', 'drugi_red', 'uz_more', 'ostalo');--> statement-breakpoint
CREATE TYPE "public"."vrsta_apartmana" AS ENUM('apartman', 'soba', 'studio', 'vila', 'kuca', 'mobilna_kucica');--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"oib" varchar(11) NOT NULL,
	"address" varchar(100),
	"phone" varchar(50),
	"email" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "agencies_oib_unique" UNIQUE("oib")
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"zip" varchar(10),
	CONSTRAINT "cities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "landlords" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"surname" varchar(30) NOT NULL,
	"name" varchar(30) NOT NULL,
	"vrsta_iznajmljivaca" "vrsta_iznajmljivaca" NOT NULL,
	"oib" varchar(11) NOT NULL,
	"city_id" integer NOT NULL,
	"address" varchar(100) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"iban" varchar(50) NOT NULL,
	"rjesenje" varchar(30),
	"br_ugovora" varchar(30),
	"tip_provizije" "tip_provizije" NOT NULL,
	"iznos" numeric(10, 2) NOT NULL,
	"evisit_name" varchar(30),
	"evisit_pass" varchar(30),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "landlords_oib_unique" UNIQUE("oib")
);
--> statement-breakpoint
CREATE TABLE "accommodations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"vrsta_apartmana" "vrsta_apartmana" NOT NULL,
	"city_id" integer NOT NULL,
	"address" varchar(100) NOT NULL,
	"broj_soba" integer NOT NULL,
	"broj_kreveta" integer NOT NULL,
	"max_osoba" integer,
	"blizina_plaze" "blizina_plaze" NOT NULL,
	"aktivan" boolean DEFAULT true NOT NULL,
	"prioritetan" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricelist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accommodation_id" uuid NOT NULL,
	"date_from" date NOT NULL,
	"date_to" date NOT NULL,
	"price_per_night" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_landlord_id_landlords_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."landlords"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricelist" ADD CONSTRAINT "pricelist_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;