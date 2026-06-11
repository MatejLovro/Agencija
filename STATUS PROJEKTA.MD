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
- landlords — kompozitni unique indeks (agency_id, oib)
- accommodations — sva polja uključujući amenities, lokaciju,
  aktivnosti, katastarske podatke
- pricelist — uključuje landlord_price

### Seed podaci u bazi

- 1 agencija: Fiskalna agencija d.o.o.
- Gradovi s poštanskim brojevima
- Više iznajmljivača s apartmanima i cjenicima

### Stranice

- /iznajmljivaci — master-detail stranica s tablicom iznajmljivača,
  tablicom apartmana i cjenikom; sortiranje i pretraga
- /iznajmljivaci/novi — forma za unos novog iznajmljivača +
  tablice apartmana i cjenika ispod forme ✅
- /iznajmljivaci/[id]/uredi — forma za izmjenu iznajmljivača +
  tablice apartmana i cjenika ispod forme ✅

### Query funkcije (src/lib/db/queries/)

- cities.ts — getCities(), createCity()
- landlords.ts — getLandlords(), getLandlordById(),
  getLandlordByOib(), createLandlord(), updateLandlord()
- accommodations.ts — getAccommodationsByLandlord(),
  getAccommodationById(), createAccommodation(),
  updateAccommodation(), deleteAccommodation()
- pricelist.ts — getPricelistByAccommodation(), createPricelistEntry(),
  updatePricelistEntry(), deletePricelistEntry()

### Server Actions (src/lib/actions/)

- cities.ts — actionGetCities, actionCreateCity
- landlords.ts — actionCreateLandlord, actionUpdateLandlord,
  actionCreateAccommodation, actionUpdateAccommodation,
  actionDeleteAccommodation, actionCreatePricelistEntry,
  actionUpdatePricelistEntry, actionDeletePricelistEntry,
  actionGetPricelistByAccommodation, actionGetAccommodationById

### Validacije (src/lib/validations/)

- landlord.ts — Zod v4 shema s dva discriminatedUnion
- accommodation.ts — Zod v4 shema (sva polja)
- pricelist.ts — Zod v4 shema s ISO usporedbom datuma
- city.ts — Zod v4 shema

### Utility funkcije

- src/lib/utils/validateOib.ts — ISO 7064 MOD 11,10
- src/lib/utils/dates.ts — parseHrDate(), validateDatumRodjenja(),
  isoToHrDate(), hrDateToIso()
- src/lib/utils/formatters.ts — capitalizeWords()

### Komponente (src/components/iznajmljivaci/)

- LandlordForm.tsx — forma za unos i izmjenu iznajmljivača;
  prima onSaved callback i submitDisabled prop
- CityCombobox.tsx — combobox s inline dodavanjem grada
- AddCityDialog.tsx — modalna forma za dodavanje grada
- ApartmanModal.tsx — multi-step modal s 4 kartice za apartman;
  exporta AccommodationRow interface
- CjenikModal.tsx — modal za upis i izmjenu cjenika;
  exporta PricelistRow interface

### Stranice (Client Components)

- NoviIznajmljivacClient.tsx —
  src/app/(dashboard)/iznajmljivaci/novi/
- UrediIznajmljivacClient.tsx —
  src/app/(dashboard)/iznajmljivaci/[id]/uredi/

## Što nije gotovo

- Brisanje apartmana (uvjeti još nisu definirani)
- Brisanje cjenika
- Brisanje iznajmljivača
- Kalendar rezervacija (sljedeće)
- Rezervacije, gosti, računi
- Autentikacija (Better Auth)

## Sljedeći korak

- Kalendar rezervacija u stilu Gantt dijagrama:
  1. stupac: iznajmljivač
  2. stupac: apartman
     ostali stupci: dani (tjedan ili mjesec prikaz)
     rezervacije kao blokovi koji se protežu kroz dane
