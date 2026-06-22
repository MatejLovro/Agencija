# STANJE PROJEKTA — lipanj 2026.

## Okruženje

- OS: Windows, dva računala (kuća i posao)
- Neon PostgreSQL kao zajednička cloud baza
- Next.js projekt: `C:\Projects\agencija-20\`

---

## DOVRŠENO

### Infrastruktura

- Next.js + TypeScript + Tailwind + App Router
- shadcn/ui (radix-nova, Neutral), Drizzle ORM + Neon, Zod v4
- Sidebar, TopBar, Footer, Dashboard layout
- Redirect `/` → `/iznajmljivaci`

### shadcn/ui komponente

form, select, input, label, checkbox, radio-group, textarea,
dialog, separator, tabs, command, popover, alert-dialog

### Baza — migrirane tablice

agencies, cities, landlords, accommodations, pricelist,
guests, partners, reservations, stays, stays_stavke

### Seed podaci

- 1 agencija, gradovi s poštanskim brojevima
- Iznajmljivači s apartmanima i cjenicima
- 3 gosta, 4 rezervacije, 3 prijave (uključ. walk-in)
- Testni seedovi za preklapanje (rezervacija 1005, 1006, 1007)
- Grad "Nepoznato" (id=10) za placeholder partnera

### Query sloj (`src/lib/db/queries/`)

- `cities.ts` — getCities(), createCity()
- `landlords.ts` — getLandlords(), getLandlordById(), getLandlordByOib(),
  createLandlord(), updateLandlord()
- `accommodations.ts` — getAccommodationsByLandlord(), getAccommodationById(),
  createAccommodation(), updateAccommodation(), deleteAccommodation()
- `pricelist.ts` — getPricelistByAccommodation(), createPricelistEntry(),
  updatePricelistEntry(), deletePricelistEntry()
- `kalendar.ts` — getKalendarData(filtri)
- `reservations.ts` — getAccommodationWithLandlord(), createReservation()
- `partners.ts` — getPartners(), quickCreatePartner()

### Server Actions (`src/lib/actions/`)

- `cities.ts` — actionGetCities, actionCreateCity
- `landlords.ts` — actionCreateLandlord, actionUpdateLandlord,
  actionCreateAccommodation, actionUpdateAccommodation,
  actionDeleteAccommodation, actionCreatePricelistEntry,
  actionUpdatePricelistEntry, actionDeletePricelistEntry,
  actionGetPricelistByAccommodation, actionGetAccommodationById
- `kalendar.ts` — actionFetchKalendarData, actionProvjeriMoguceRezerviranje
- `reservations.ts` — actionGetAccommodationWithLandlord, actionCreateReservation
- `partners.ts` — actionGetPartners, actionQuickCreatePartner

### Validacije (`src/lib/validations/`)

- `landlord.ts` — discriminatedUnion (vrsta + tip provizije)
- `accommodation.ts` — sva polja (4 kartice)
- `pricelist.ts` — ISO usporedba datuma
- `city.ts`
- `reservation.ts` — dateFrom > danas, dateTo > dateFrom, rezervationValid < dateFrom
- `partner.ts` — minimalni unos (samo naziv)

### Utility funkcije (`src/lib/utils/`)

- `validateOib.ts` — ISO 7064 MOD 11,10
- `dates.ts` — parseHrDate(), validateDatumRodjenja(), isoToHrDate(), hrDateToIso()
- `formatters.ts` — capitalizeWords()
- `kalendarValidacija.ts` — checkPostojiPrijavaUPeriodu(),
  checkPostojiPotvrdjenaRezervacijaUPeriodu()

### Stranice

- `/iznajmljivaci` — master-detail (tablica iznajmljivača + apartmani + cjenik)
- `/iznajmljivaci/novi` — forma za novog iznajmljivača + apartmani + cjenik
- `/iznajmljivaci/[id]/uredi` — forma za izmjenu + apartmani + cjenik
- `/kalendar` — Gantt kalendar rezervacija

### Komponente

- `LandlordForm.tsx` — forma iznajmljivača (onSaved callback, submitDisabled prop)
- `CityCombobox.tsx` — combobox s inline dodavanjem grada
- `AddCityDialog.tsx` — modal za dodavanje grada
- `ApartmanModal.tsx` — 4-karticni modal za apartman (exporta AccommodationRow)
- `CjenikModal.tsx` — modal za cjenik (exporta PricelistRow)
- `NoviIznajmljivacClient.tsx`, `UrediIznajmljivacClient.tsx`
- `KalendarGantt.tsx` — Gantt tablica s interaktivnošću
- `KalendarFiltriForm.tsx` — filter traka
- `RezervacijaModal.tsx` — modalna forma za novu rezervaciju
- `KalendarClient.tsx` — orchestrator kalendara
- `combobox-with-create.tsx` — generički combobox s inline kreiranjem
  (dorađen: rukovanje greškom, try/catch, prikaz poruke)

---

## U TIJEKU

### Kalendar — otvorene stavke

- Konteksni izbornik: različite opcije za klik na prazan dan / rezervaciju /
  prijavu (infrastruktura postavljena, logika nije implementirana)
- Forma za **izradu prijave** (stays) — TODO u handleIzradaPrijave
- Combobox za Grad i Iznajmljivač u filter traci (trenutno null)
- Hover tooltip na danima preklapanja — lista preklapajućih rezervacija

---

## PLANIRANO

### Tablica rezervacija (`/rezervacije`)

- Pregled svih rezervacija
- Izrada i slanje ponude gostu
- Praćenje statusa plaćanja
- Pretvaranje rezervacije u prijavu

### Ostalo

- CRUD stranica za partnere (`/partneri`)
- Modul izvještaja (`/izvjestaji`) — lista apartmana s cjenikom i podacima
  o iznajmljivaču, prikaz na ekranu + PDF export (`@react-pdf/renderer`)
- Brisanje rezervacija, prijava, iznajmljivača
- Autentikacija (Better Auth)

---

## POZNATI PROBLEMI / ODGOĐENO

- Kad se dodaje novi iznajmljivač, modal za apartman ne popunjava automatski
  grad i adresu iznajmljivača (odgođeno)
