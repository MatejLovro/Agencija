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

### Baza — migrirane tabele

agencies, cities, landlords, accommodations, pricelist,
guests, partners, reservations, stays, stays_stavke,
offers, offers_stavke, taxes, services

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
- `reservations.ts` — getAccommodationWithLandlord(), createReservation(),
  getReservations()
- `partners.ts` — getPartners(), quickCreatePartner()

### Server Actions (`src/lib/actions/`)

- `cities.ts` — actionGetCities, actionCreateCity
- `landlords.ts` — actionCreateLandlord, actionUpdateLandlord,
  actionCreateAccommodation, actionUpdateAccommodation,
  actionDeleteAccommodation, actionCreatePricelistEntry,
  actionUpdatePricelistEntry, actionDeletePricelistEntry,
  actionGetPricelistByAccommodation, actionGetAccommodationById
- `kalendar.ts` — actionFetchKalendarData, actionProvjeriMoguceRezerviranje
- `reservations.ts` — actionGetAccommodationWithLandlord, actionCreateReservation,
  actionGetReservations
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
- `/rezervacije` — tablica rezervacija s legendom, toolbarom i mjestom za canvas

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
- `RezervacijeClient.tsx` — tablica rezervacija s toolbarom
- `combobox-with-create.tsx` — generički combobox s inline kreiranjem

### Drizzle sheme (`src/lib/db/schema/`)

- `agencies.ts`, `cities.ts`, `landlords.ts`, `accommodations.ts`,
  `pricelist.ts`, `guests.ts`, `partners.ts`, `reservations.ts`,
  `stays.ts`, `stays_stavke.ts`, `offers.ts`, `offers_stavke.ts`,
  `taxes.ts`, `services.ts`

### Konvencije — terminologija

- **tabela** = tablica u bazi podataka
- **tablica** = UI grid komponenta

### Modul ponuda — temelj

- Ruta `/ponude/nova?rezervacijaId=xxx` — Server Component učitava rezervaciju i usluge
- Forma za izradu ponude iz rezervacije (`NovaPonudaClient.tsx`)
- Tablica stavki s lokalnim state upravljanjem (izvan RHF forme)
- Dugme "Izrada ponude" u `/rezervacije` toolbaru navigira na formu uz provjeru statusa
- Alert za pokušaj izrade ponude za već potvrđenu rezervaciju

### Komponente — line-items (`src/components/line-items/`)

- `ServiceCombobox.tsx` — combobox s pretragom, odabir usluge, `onAddNew` hook za budući modal
- `NumberField.tsx` — generički input za brojeve s autoselect on focus (useController)
- `IznosField.tsx` — read-only prikaz izračunatog iznosa (useController)
- `PorezField.tsx` — prikaz porezne stope (useController)
- `DodatniOpisField.tsx` — expandable textarea za opis stavke (useController)

### Baza — migrirane izmjene

- `offers`: uklonjena polja `ponuda_za` i `id_gost`, dodan `predujam_postotak numeric(5,2)`
- `offers_stavke`: dodana polja `service_text varchar(200)`, `iznos numeric(10,2)`,
  `bruto numeric(10,2)`, `dodatni_opis text`
- Seed: 2 poreza (P0 PDV 0%, P13 PDV 13%), 5 usluga (SMJEŠTAJ, BORAVIŠNA PRISTOJBA,
  BORAVIŠNA PRISTOJBA DO 18 GOD, OSIGURANJE, NAJAM BICIKLA)

### Query sloj i actions

- `lib/db/queries/offers.ts` — `getReservationForOffer()`, `getServicesForOffer()`, `createOffer()`
- `lib/actions/offers.ts` — `actionGetReservationForOffer`, `actionGetServicesForOffer`, `actionCreateOffer`

### Validacije

- `lib/validations/offer.ts` — `offerSchema`, `offerStavkaSchema`

---

## U TIJEKU

### Kalendar — otvorene stavke

- Konteksni izbornik: različite opcije za klik na prazan dan / rezervaciju /
  prijavu (infrastruktura postavljena, logika nije implementirana)
- Forma za izradu prijave (stays) — TODO u handleIzradaPrijave
- Combobox za Grad i Iznajmljivač u filter traci (trenutno null)
- Hover tooltip na danima preklapanja — lista preklapajućih rezervacija

### Rezervacije — otvorene stavke

- Canvas s detaljima odabrane rezervacije (mjesto rezervirano u UI-u)
- Funkcionalnost toolbar dugmadi (Izrada ponude, Potvrda prijave, Voucher,
  Izrada prijave, Storno, Brisanje, Traži, Odustani)

---

## PLANIRANO

### Modul ponuda

- Izrada ponude iz rezervacije (prompt u pripremi)
- Izrada ponude za gosta
- Izrada ponude za partnera
- Slanje ponude gostu mailom
- Praćenje statusa plaćanja
- Pretvaranje rezervacije u prijavu

### Modul ponuda — otvorene stavke

- Modal za dodavanje nove usluge "u hodu" iz ServiceCombobox-a
- Dugme "Izračunaj smještaj" — algoritam za automatski izračun stavke smještaja iz cjenika
- Prikaz naziva partnera umjesto ID-a na formi ponude
- Slanje ponude gostu mailom
- Praćenje statusa plaćanja ponude
- Pretvaranje rezervacije u prijavu nakon prihvata ponude
- Migracija `offers.broj` s bigserial na godina+broj (zakonska obveza) — prije produkcije

### Ostalo

- CRUD stranica za partnere (`/partneri`)
- CRUD stranica za usluge (`/usluge`)
- CRUD stranica za poreze (`/porezi`)
- Modul izvještaja (`/izvjestaji`) — lista apartmana s cjenikom i podacima
  o iznajmljivaču, prikaz na ekranu + PDF export (`@react-pdf/renderer`)
- Brisanje rezervacija, prijava, iznajmljivača
- Autentikacija (Better Auth)

---

## POZNATE LEKCIJE

### Ključne tehničke lekcije

- **Focus stabilnost u tablicama s izračunima**: stavke tablice ponude/računa moraju biti
  u lokalnom `useState`, ne u React Hook Form. `useWatch`/`setValue` u parent komponenti
  uzrokuje re-render koji ruši fokus na input poljima. `NumericInput` koristi lokalni state
  i propagira vrijednost prema gore tek na `onBlur`.
- **Izolacija re-rendera**: svaki `watch` poziv mora biti u izoliranoj podkomponenti
  (`DatumFields`, `SveukupnoDisplay`, `PredujamFields`) — root forma komponenta ne smije
  imati nijedan `watch`.

## POZNATI PROBLEMI / ODGOĐENO

- Kad se dodaje novi iznajmljivač, modal za apartman ne popunjava automatski
  grad i adresu iznajmljivača (odgođeno)

- Numeracija ponuda i računa mora se resetirati na početku svake kalendarske
  godine (zakonska obveza). Rješenje: zamijeniti bigserial s kombinacijom
  godina (smallint) + broj (integer), gdje se broj resetira svake godine.
  Unique index na (agency_id, godina, broj). Broj se generira u aplikacijskoj
  logici kao MAX(broj) + 1 za tu godinu. Prikazuje se kao "2025/1".
  Potrebno primijeniti na tabele: offers, i buduće tabele računa.
  Tabela offers trenutno ima bigserial — treba migrirati prije prvog
  produkcijskog korištenja.
