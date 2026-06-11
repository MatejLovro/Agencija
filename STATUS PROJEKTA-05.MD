# STANJE PROJEKTA — lipanj 2026.

## Okruženje

- OS: Windows
- Dva računala (kuća i posao) — Neon PostgreSQL kao zajednička cloud baza
- Next.js projekt u mapi: C:\Projects\agencija-20\

## Što je gotovo

### Infrastruktura

- Next.js projekt inicijaliziran (App Router, TypeScript, Tailwind, src/, alias @/\*)
- shadcn/ui instaliran — stil: radix-nova, Neutral base color
- Drizzle ORM + @neondatabase/serverless konfigurirani
- Drizzle klijent: src/lib/db/index.ts
- Drizzle config: drizzle.config.ts
- Zod v4 instaliran
- @hookform/resolvers instaliran

### shadcn/ui komponente instalirane

- form, select, input, label, checkbox, radio-group, textarea,
  dialog, separator, tabs, command, popover

### Layout aplikacije

- Sidebar, TopBar, Footer
- Dashboard layout: src/app/(dashboard)/layout.tsx
- Redirect s / na /iznajmljivaci

### Sheme u bazi (sve migrirane)

- agencies
- cities (id, name, zip)
- landlords — kompozitni unique indeks (agency_id, oib),
  bez unique constraint na samom oib polju
- accommodations
- pricelist (uključuje: landlord_price)

### Seed podaci u bazi

- 1 agencija: Fiskalna agencija d.o.o.
- Gradovi s poštanskim brojevima
- Više iznajmljivača upisano kroz formu

### Stranice

- /iznajmljivaci — master-detail stranica s tablicom iznajmljivača,
  tablicom apartmana i cjenikom; sortiranje i pretraga
- /iznajmljivaci/novi — forma za unos novog iznajmljivača ✅
- /iznajmljivaci/[id]/uredi — forma za izmjenu iznajmljivača ✅

### Query funkcije (src/lib/db/queries/)

- cities.ts — getCities(), createCity()
- landlords.ts — getLandlords(), getLandlordById(),
  getLandlordByOib(), createLandlord(), updateLandlord()
- accommodations.ts — getAccommodationsByLandlord(),
  createAccommodation(), updateAccommodation(), deleteAccommodation()
- pricelist.ts — getPricelistByAccommodation(), createPricelistEntry(),
  updatePricelistEntry(), deletePricelistEntry()

### Validacije (src/lib/validations/)

- landlord.ts — Zod v4 shema s dva discriminatedUnion:
  vrstaIznajmljivaca (4 vrste) i tipProvizije (P/I)
- accommodation.ts — Zod v4 shema
- pricelist.ts — Zod v4 shema
- city.ts — Zod v4 shema (name, zip)

### Server Actions (src/lib/actions/)

- cities.ts — actionGetCities, actionCreateCity
- landlords.ts — actionCreateLandlord, actionUpdateLandlord,
  actionCreateAccommodation, actionUpdateAccommodation,
  actionDeleteAccommodation, actionCreatePricelistEntry,
  actionUpdatePricelistEntry, actionDeletePricelistEntry

### Utility funkcije

- src/lib/utils/validateOib.ts — validacija OIB-a (ISO 7064 MOD 11,10)
- src/lib/utils/dates.ts — parseHrDate(), validateDatumRodjenja(),
  isoToHrDate(), hrDateToIso()
- src/lib/utils/formatters.ts — capitalizeWords()

### Komponente (src/components/iznajmljivaci/)

- LandlordForm.tsx — forma za unos i izmjenu iznajmljivača
- CityCombobox.tsx — combobox s inline dodavanjem grada
- AddCityDialog.tsx — modalna forma za dodavanje grada

## Što nije gotovo

- Modal za apartman (3 kartice: osnovni podaci, sadržaji,
  lokacija/aktivnosti)
- Inline cjenik apartmana
- Brisanje iznajmljivača (s provjerom postoje li apartmani)
- Autentikacija (Better Auth)
- Sve ostale stranice (rezervacije, gosti, računi, kalendar)

## Sljedeći korak

- Novi chat: modal za unos i izmjenu apartmana + inline cjenik
