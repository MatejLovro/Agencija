@AGENTS.md

# CLAUDE.md — Aplikacija za turističku agenciju

## O PROJEKTU

Web aplikacija za turističku agenciju koja se bavi posredovanjem u iznajmljivanju smještaja u ime i za račun malih privatnih iznajmljivača. Agencija pronalazi smještaj prema željama gosta, šalje ponudu, prima uplatu i obavlja rezervaciju. Gostu izdaje račun u ime iznajmljivača, a iznajmljivaču šalje račun za proviziju.

Aplikacija je namijenjena isključivo djelatnicima agencije (interna aplikacija, nije javna).

---

## TECH STACK

- **Framework:** Next.js 15+ (App Router)
- **Baza podataka:** Neon PostgreSQL (cloud)
- **ORM:** Drizzle ORM
- **UI:** shadcn/ui
- **Validacija:** Zod unutar React Hook Form-a
- **Autentikacija:** Better Auth (samo djelatnici agencije)

---

## ARHITEKTURALNA NAČELA

- Next.js ima dvostruku ulogu: web sučelje i backend API
- **DB logika mora biti striktno odvojena od transportnog sloja** — Server Actions i API rute ne smiju direktno sadržavati Drizzle upite; queries idu u poseban sloj (npr. `lib/db/queries/`)
- Biblioteke se instaliraju tek kada su potrebne, ne unaprijed
- Aplikacija ima puno formi — preferirati konzistentne obrasce s React Hook Form + Zod + shadcn/ui komponentama

---

## ORGANIZACIJA DATOTEKA

```
src/
├── app/                        # Next.js App Router stranice i rute
│   ├── (auth)/                 # Auth stranice (login i sl.)
│   ├── (dashboard)/            # Zaštićene stranice aplikacije
│   │   ├── rezervacije/
│   │   ├── apartmani/
│   │   ├── iznajmljivaci/
│   │   ├── gosti/
│   │   └── kalendar/
│   └── api/                    # API rute (ako su potrebne uz Server Actions)
│
├── components/
│   ├── ui/                     # shadcn/ui komponente (auto-generirane)
│   └── [feature]/              # Feature-specifične komponente
│
├── lib/
│   ├── db/
│   │   ├── schema/             # Drizzle shema (po entitetima)
│   │   ├── queries/            # Svi DB upiti — jedino mjesto gdje se koristi Drizzle
│   │   └── index.ts            # Drizzle klijent (db instanca)
│   ├── actions/                # Server Actions (pozivaju queries, ne pišu SQL direktno)
│   ├── validations/            # Zod sheme
│   └── utils/                  # Pomoćne funkcije
│
└── types/                      # TypeScript tipovi i interfacei
```

---

## DOMENSKA LOGIKA

### Ključni entiteti

- **Agencija (`agencies`)** — jedan tenant za sada; svaki drugi entitet nosi `agency_id` kao foreign key radi buduće SaaS ekspanzije
- **Iznajmljivač** — privatni vlasnik jednog ili više apartmana
- **Apartman** — smještajna jedinica u vlasništvu iznajmljivača
- **Gost** — osoba koja rezervira smještaj
- **Rezervacija** — veza između gosta, apartmana i datuma; sadrži status, iznos, polog
- **Ponuda** — prethodi rezervaciji; šalje se gostu mailom
- **Račun** — dva tipa: račun gostu (u ime iznajmljivača) i račun iznajmljivaču (za proviziju)

### Pretraga apartmana

Kriteriji: mjesto, broj soba, broj kreveta, blizina plaže, cijena

### Provizija

Agencija naplaćuje proviziju iznajmljivaču za svaki iznajmljeni apartman. Tip i iznos provizije definira se po apartmanu ili iznajmljivaču.

### Tijek procesa (happy path)

1. Gost kontaktira agenciju (mail ili osobno)
2. Djelatnik pretražuje dostupne apartmane prema kriterijima
3. Agencija gostu šalje ponudu
4. Gost uplaćuje cjelokupni iznos ili polog
5. Agencija kreira rezervaciju i gostu šalje potvrdu mailom
6. Agencija izdaje račun gostu (u ime iznajmljivača)
7. Agencija izdaje račun iznajmljivaču za proviziju

---

## KALENDAR REZERVACIJA

Prikaz u stilu Gantt dijagrama:

- **1. stupac:** iznajmljivač (vlasnik apartmana)
- **2. stupac:** apartman
- **Ostali stupci:** dani (horizontalna os — tjedan ili mjesec)
- Rezervacije su prikazane kao blokovi koji se protežu kroz dane

---

## KONVENCIJE

- Jezik sučelja: **hrvatski**
- Kod i komentari: **engleski**
- Nazivi datoteka i ruta: **kebab-case**
- Komponente: **PascalCase**
- Server Actions: prefiks `action` (npr. `actionCreateReservation`)
- Query funkcije: prefiks prema operaciji (npr. `getApartments`, `createReservation`)

---

## DOSAD DEFINIRANE SHEME

### `lib/db/schema/landlords.ts`

```typescript
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { cities } from "./cities";

export const tipProvizijeEnum = pgEnum("tip_provizije", ["P", "I"]);

export const vrstaIznajmljivacaEnum = pgEnum("vrsta_iznajmljivaca", [
  "fizicka_osoba",
  "obrt",
  "tvrtka",
]);

export const landlords = pgTable("landlords", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  surname: varchar("surname", { length: 30 }).notNull(),
  name: varchar("name", { length: 30 }).notNull(),
  vrstaIznajmljivaca: vrstaIznajmljivacaEnum("vrsta_iznajmljivaca").notNull(),
  oib: varchar("oib", { length: 11 }).notNull().unique(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "restrict" }),
  address: varchar("address", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  iban: varchar("iban", { length: 50 }).notNull(),
  rjesenje: varchar("rjesenje", { length: 30 }),
  brUgovora: varchar("br_ugovora", { length: 30 }),
  tipProvizije: tipProvizijeEnum("tip_provizije").notNull(),
  iznos: numeric("iznos", { precision: 10, scale: 2 }).notNull(),
  eVisitName: varchar("evisit_name", { length: 30 }),
  eVisitPass: varchar("evisit_pass", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### `lib/db/schema/accommodations.ts`

```typescript
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { agencies } from "./agencies";
import { cities } from "./cities";
import { landlords } from "./landlords";

export const vrstaApartmanaEnum = pgEnum("vrsta_apartmana", [
  "apartman",
  "soba",
  "studio",
  "vila",
  "kuca",
  "mobilna_kucica",
]);

export const blizinaPlazeEnum = pgEnum("blizina_plaze", [
  "prvi_red",
  "drugi_red",
  "uz_more",
  "ostalo",
]);

export const accommodations = pgTable("accommodations", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "restrict" }),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => landlords.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 100 }).notNull(),
  vrstaApartmana: vrstaApartmanaEnum("vrsta_apartmana").notNull(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "restrict" }),
  address: varchar("address", { length: 100 }).notNull(),
  brojSoba: integer("broj_soba").notNull(),
  brojKreveta: integer("broj_kreveta").notNull(),
  maxOsoba: integer("max_osoba"),
  blizinePlaze: blizinaPlazeEnum("blizina_plaze").notNull(),
  aktivan: boolean("aktivan").notNull().default(true),
  prioritetan: boolean("prioritetan").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### `lib/db/schema/pricelist.ts`

```typescript
import { pgTable, uuid, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { accommodations } from "./accommodations";

export const pricelist = pgTable("pricelist", {
  id: uuid("id").primaryKey().defaultRandom(),
  accommodationId: uuid("accommodation_id")
    .notNull()
    .references(() => accommodations.id, { onDelete: "cascade" }),
  dateFrom: date("date_from").notNull(),
  dateTo: date("date_to").notNull(),
  pricePerNight: numeric("price_per_night", {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Napomene uz sheme

- `pricelist` nema `agencyId` — cjenik je vezan uz apartman koji već nosi `agencyId`; redundantno bi bilo dodavati ga i ovdje
- Validacija nepreklapanja perioda u cjeniku ide u aplikacijsku logiku (Zod + query sloj), ne u shemu
- U SaaS scenariju isti fizički apartman dvije različite agencije vode kao dva zasebna zapisa s različitim `id`-ovima — svaka agencija ima vlastiti cjenik

---

## NAPOMENE

- Projekt se razvija na dva računala (kuća i posao) — Neon PostgreSQL omogućuje dijeljenu bazu bez lokalnog sinkroniziranja
- Multi-tenancy nije aktivan za sada, ali **svaki entitet u bazi treba imati `agency_id` foreign key** od samog početka — to je jedina promjena koja je potrebna kada se aplikacija pretvori u SaaS; bez nje bi migracija bila bolna
- Autentikacija se implementira kasnije
