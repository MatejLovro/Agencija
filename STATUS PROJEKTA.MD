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
  
## KALENDAR REZERVACIJA — Status: u izradi

### Što je napravljeno
- Definirane i kreirane sve tablice u Neon bazi: `guests`, `partners`, `reservations`, `stays`, `stays_stavke`
- Kreirane Drizzle sheme: `guests.ts`, `partners.ts`, `reservations.ts`, `stays.ts`
- SQL migracija uspješno izvršena na Neon bazi

### Što slijedi
- Implementacija Drizzle query sloja za kalendar
- Implementacija Server Action za dohvat podataka kalendara
- Implementacija custom Gantt komponente

---

## ARHITEKTURA GANTT KOMPONENTE

### Koncept
Custom React komponenta — bez vanjskih biblioteka. Koristi HTML tablicu s CSS `position: sticky` za fiksiranje lijevih stupaca pri horizontalnom scrollu.

### Struktura prikaza
```
┌─────────────────┬────────────┬───────┬───────┬───────┐
│ IZNAJMLJIVAČI   │ KAPACITETI │ 02.06 │ 03.06 │ 04.06 │
├─────────────────┼────────────┼───────┼───────┼───────┤
│ AGIĆ ZRINKA     │            │       │       │       │
│                 │ ST22-6     │       │       │       │
│                 │ AP22-5     │       │       │       │
├─────────────────┼────────────┼───────┼───────┼───────┤
│ BATINIĆ IVAN    │            │       │       │       │
│                 │ S2-6       │ P699  │ P699  │       │
└─────────────────┴────────────┴───────┴───────┴───────┘
```
- Svaki red = jedan apartman
- Iznajmljivač je "header red" bez ćelija za datume
- Lijeva dva stupca su sticky (ne scrollaju)
- Datumski stupci scrollaju horizontalno

### TypeScript tipovi komponente
```typescript
type KalendarDan = {
  datum: string                              // "2026-06-02"
  tip: "rezervacija" | "prijava" | "preklapanje" | null
  redniBroj: number | null
  boja: string
}

type KalendarApartman = {
  accommodationId: string
  naziv: string
  dani: KalendarDan[]                        // jedan element po danu u rasponu
}

type KalendarIznajmljivac = {
  landlordId: string
  ime: string
  apartmani: KalendarApartman[]
}

type KalendarProps = {
  iznajmljivaci: KalendarIznajmljivac[]
  datumOd: string
  datumDo: string
}
```

### Tijek podataka
```
Korisnik unosi filtere (grad, datumi, sobe, oprema...)
        ↓
Server Action: fetchKalendarData(filtri)
        ↓
Query spaja: accommodations + landlords + reservations + stays
        ↓
Rezultat se transformira u KalendarIznajmljivac[]
        ↓
Komponenta <KalendarGantt> crta tablicu
```

### Ključno načelo
Server Action vraća podatke već transformirane u oblik koji komponenta direktno konzumira. Komponenta ne radi nikakve izračune — samo crta što dobije.

### Boje u kalendaru
| Tip                     | Boja                   | Oznaka                     |
|---                      |---                     |---                         |
| Prijava                 | Zelena                 | P + redni_broj (npr. P699) |
| Rezervacija potvrđena   | Žuta                   | redni_broj (npr. 700)      |
| Rezervacija nepotvrđena | Drugačija nijansa žute | redni_broj                 |
| Rezervacija istekla     | Crvena / siva          | redni_broj                 |
| Dan preklapanja         | Narančasta             | —                          |

### Forma za filtere
Filteri koji će biti implementirani:
- Grad (combobox)
- Iznajmljivač (combobox)
- Od datuma / Do datuma
- Broj soba, broj kreveta
- Samo prioritetni (checkbox)
- Oprema: klima, parking, terasa, internet, kućni ljubimac, pogled na more itd.
- Tip rezervacije: sve / samo potvrđene / samo nepotvrđene

### Upravljačka dugmad
Ispod dijagrama — za dodavanje rezervacija i prijava direktno iz kalendara. Implementacija u kasnijoj fazi.