# CLAUDE.md — Aplikacija za turističku agenciju

## O PROJEKTU

Web aplikacija za turističku agenciju koja se bavi posredovanjem u iznajmljivanju
smještaja u ime i za račun malih privatnih iznajmljivača. Agencija pronalazi smještaj
prema željama gosta, šalje ponudu, prima uplatu i obavlja rezervaciju.

Aplikacija je namijenjena isključivo djelatnicima agencije (interna aplikacija,
nije javna). Multi-tenant arhitektura — agencija se identificira preko `AGENCY_ID`
env varijable.

---

## TECH STACK

- **Framework:** Next.js 15+ (App Router)
- **Baza podataka:** Neon PostgreSQL (cloud, dijeljena između dva računala)
- **ORM:** Drizzle ORM (migracije često primjenjivane ručno preko Neon SQL Editora)
- **UI:** shadcn/ui (stil: radix-nova, Neutral base color)
- **Validacija:** Zod v4 + React Hook Form + @hookform/resolvers
- **PDF:** @react-pdf/renderer (odabran za Vercel kompatibilnost)
- **OS:** Windows (dva računala — kuća i posao)

---

## ENV VARIJABLE

```
AGENCY_ID=3ab285b4-6f7c-4b26-a74a-732d121df90a
NEXT_PUBLIC_CALENDAR_DAYS_BEFORE=6
NEXT_PUBLIC_CALENDAR_DAYS_AFTER=45
NEXT_PUBLIC_RESERVATION_VALID_DAYS=3
UNKNOWN_CITY_ID=10
```

---

## ARHITEKTURALNA NAČELA

- Next.js ima dvostruku ulogu: web sučelje i backend API
- **DB logika striktno odvojena od transportnog sloja** — Server Actions i API rute
  ne smiju direktno sadržavati Drizzle upite; queries idu u `lib/db/queries/`
- Biblioteke se instaliraju tek kada su potrebne
- `grep` nije dostupan na Windowsu

---

## ORGANIZACIJA DATOTEKA

```
src/
├── app/
│   ├── (auth)/
│   └── (dashboard)/
│       ├── iznajmljivaci/
│       ├── kalendar/
│       └── rezervacije/           ← planira se
│
├── components/
│   ├── ui/                        ← shadcn/ui komponente
│   ├── iznajmljivaci/
│   └── kalendar/
│
├── lib/
│   ├── db/
│   │   ├── schema/
│   │   ├── queries/
│   │   └── index.ts
│   ├── actions/
│   ├── validations/
│   ├── mock/                      ← privremeni mock podaci
│   └── utils/
│
└── types/
```

---

## KONVENCIJE

- Jezik sučelja: **hrvatski**; kod i komentari: **engleski**
- Nazivi datoteka i ruta: **kebab-case**
- Komponente: **PascalCase**
- Nazivi varijabli: **bez hrvatskih dijakritičkih znakova**
- Server Actions: prefiks `action` (npr. `actionCreateReservation`)
- Query funkcije: prefiks prema operaciji (`getX`, `createX`, `updateX`, `deleteX`)

---

## KONVENCIJE — FORME I VALIDACIJA

- **Zod v4** — NE koristiti `required_error` ni `invalid_type_error`
- Obavezna string polja: `.min(1, "poruka")`
- Opcionalna string polja: `.optional().or(z.literal(""))`
- `discriminatedUnion` workaround za react-hook-form 7.76:
  `resolver: zodResolver(schema) as any`
- `useForm` ne reinicijalizira pri promjeni `defaultValues` — koristiti
  `useEffect` na `[open, defaultValues]`
- `autoComplete="off"` na formi + randomizirani `name` atribut na osjetljivim
  poljima za suzbijanje browser autocomplete-a

### Datumska polja

- Hrvatski format `dd.mm.gggg.` s auto-formatiranjem dok korisnik tipka
- **NE** koristiti browser date picker
- Backend prima ISO string; konverzija ide u `lib/utils/dates.ts`
- Helperi: `parseHrDate()`, `validateDatumRodjenja()`, `isoToHrDate()`, `hrDateToIso()`

### Combobox pattern (`ComboboxWithCreate`)

- Lokacija: `src/components/ui/combobox-with-create.tsx`
- Props: `value`, `onChange`, `options`, `onCreate`, `entityLabel`, `placeholder`, `disabled`
- `onCreate: (name: string) => Promise<{ id, name } | null | undefined>`
- Komponenta rukuje greškom: prikazuje poruku ispod inputa ako `onCreate` vrati
  `null` ili baci iznimku
- "Add new..." dugme je fiksno izvan `CommandList`, koristi `onMouseDown` +
  `e.preventDefault()` da ne zatvori popover

---

## KONVENCIJE — DRAW.IO MOCKUPI

- Bijeli fill, solid border = input polja
- Žuti fill, dashed border = izračunata polja
- Sivi fill, bez bordera = read-only relacijski podaci
- Plavi border = combobox / FK polja

---

## BAZA PODATAKA — SHEME

### `agencies`

Jedan tenant za sada. Svaki entitet nosi `agency_id` FK radi buduće SaaS ekspanzije.

### `cities`

`id` (serial), `name`, `zip`. `id=10` = grad "Nepoznato" (placeholder za brzi unos partnera).

### `landlords`

Iznajmljivači. Enum `vrsta_iznajmljivaca`: `fizicka_osoba`, `fizicka_osoba_pdv`,
`obrt`, `tvrtka`. Enum `tip_provizije`: `P` (postotak), `I` (iznos).
Composite unique index: `(agency_id, oib)`.

### `accommodations`

~40 polja: osnovno, kapacitet, status, opis, amenities (klima, parking, wifi...),
lokacija/aktivnosti, katastarski podaci. `name` = kratki naziv (prikazuje se u
kalendaru), `full_name` = dugi naziv.

### `pricelist`

`accommodation_id`, `date_from`, `date_to`, `price_per_night`, `landlord_price`.
Nema `agency_id` — nasljeđuje se kroz apartman.

### `guests`

Registrirani gosti s punim podacima (potrebni za stays/prijave).
`state_birth` i `citizenship` koriste ISO 3166-1 alpha-3 (npr. `HRV`, `DEU`).

### `partners`

Booking kanali i partnerske agencije (Booking.com, Airbnb, strane agencije).
Brzi inline unos: samo `name`, ostalo dobiva placeholder vrijednosti:
`type='firma'`, `oib='00000000000'`, `state='HRV'`, `pdvStatus='not_pdv'`,
`iban=''`, `address=''`, `cityId=10` (UNKNOWN_CITY_ID).

### `reservations`

- `redni_broj` — bigserial, auto-inkrement, sekvencionalni br. rezervacije (npr. "700")
- `guest_name`, `guest_surname` — plain text (nije FK na guests; nepotvrđene
  rezervacije ne zahtijevaju punu registraciju gosta)
- `status` — enum: `nepotvrdjena` | `potvrdjena`
- `rezervation_valid` — datum do kada vrijedi ponuda
- `partner_id` — nullable FK na `partners`
- `price`, `avans_percent`, `avans_amount` — trenutno nekorištena polja

### `stays`

- `redni_broj` — bigserial, auto-inkrement (prikazuje se kao npr. "P699")
- `reservation_id` — nullable FK na `reservations` (null = walk-in gost)
- `guest_id` — NOT NULL FK na `guests`
- `status` — enum: `aktivna` | `odjavljena`

### `stays_stavke`

Pojedinačne osobe unutar grupnog boravka, svaka s vlastitim datumima,
eVisitor kategorijom i opcionalnim datumom dozvole boravka.

---

## DOMENSKA LOGIKA

### Tijek procesa

1. Gost kontaktira agenciju
2. Djelatnik pretražuje slobodne apartmane
3. Agencija gostu šalje ponudu
4. Gost uplaćuje (polog ili cijeli iznos)
5. Agencija potvrđuje rezervaciju
6. Gost dolazi → rezervacija postaje prijava (stay)
7. Agencija izdaje račun gostu (u ime iznajmljivača)
8. Agencija izdaje račun iznajmljivaču za proviziju

### Pravila preklapanja — prijave i rezervacije

**Prijave (stays):**

- Apartman zauzet sve dok se prijava ne zatvori (odjava)
- Sljedeća prijava moguća samo od zadnjeg dana prethodne (checkout ujutro,
  check-in popodne istog dana) — max 1 dan preklapanja

**Rezervacije:**

- Može postojati više konkurentskih rezervacija za isti period (normalno
  poslovno stanje — agencija potvrđuje onu koja prva uplati)
- Preklapanje može trajati više dana — nije greška

**Validacija perioda rezervacije** (`lib/utils/kalendarValidacija.ts`):

- Blokira ako postoji **prijava** koja se preklapa (strogo unutarnja provjera:
  `stay.dateFrom < do AND stay.dateTo > od`)
- Blokira ako postoji **potvrđena rezervacija** koja se preklapa
- Dopušta nepotvrđene konkurentske rezervacije
- Rubni dan (checkout = checkin) uvijek dozvoljen
- Provjera se poziva **dvaput**: prije otvaranja forme + prije spremanja (race
  condition zaštita)

### Datum "Vrijedi do" na rezervaciji

- Default = danas + `NEXT_PUBLIC_RESERVATION_VALID_DAYS`
- Iznimka: ako je `dateFrom − danas <= NEXT_PUBLIC_RESERVATION_VALID_DAYS`,
  tada `vrijediDo = danas`
- Uvijek mora biti `< dateFrom`
- Editabilno — korisnik može ručno promijeniti

---

## KALENDAR — ARHITEKTURA

### Prikaz

Gantt dijagram: sticky lijevi stupci (iznajmljivač + kapacitet), horizontalni
scroll za datume. Zeleni header stupac = danas.

### Boje

| Tip                     | Boja                            |
| ----------------------- | ------------------------------- |
| Prijava                 | Zelena (`bg-emerald-500`)       |
| Rezervacija potvrđena   | Žuta (`bg-amber-300`)           |
| Rezervacija nepotvrđena | Svjetlo žuta (`bg-yellow-100`)  |
| Dan preklapanja         | Narančasta (`bg-orange-400`)    |
| Danas (prazan dan)      | Nježno zelena (`bg-emerald-50`) |
| Vikend (prazan)         | Svjetlo plava (`bg-sky-100`)    |

### Algoritam preklapanja

Za svaki dan u rasponu broji se broj aktivnih događaja (rezervacije + prijave)
u apartmanu. Ako ≥ 2 → dan je "preklapanje" (narančasto, bez broja).

### Interaktivnost

- Lijevi klik + drag = selekcija perioda (samo unutar jednog reda)
- `onMouseDown` provjerava `e.button !== 0` da ignorirajre desni klik
- Desni klik = konteksni izbornik (opcije ovise o tome je li kliknut prazan dan,
  rezervacija ili prijava — **djelomično implementirano**, u tijeku)

### TypeScript tipovi (`src/types/kalendar.ts`)

```typescript
type KalendarDan = {
  datum: string;
  tip:
    | "rezervacija_potvrdjena"
    | "rezervacija_nepotvrdjena"
    | "prijava"
    | "preklapanje"
    | null;
  redniBroj: number | null;
  jeOdjava: boolean;
};
type KalendarApartman = { accommodationId; naziv; dani: KalendarDan[] };
type KalendarIznajmljivac = { landlordId; ime; apartmani: KalendarApartman[] };
type KalendarFiltri = {
  gradId;
  landlordId;
  datumOd;
  datumDo;
  brojSoba;
  brojKreveta;
  brojPomocnihLezajeva;
  samoPotvrdjene;
  samoNepotvrdjene;
  imaKlima;
  imaParking;
  imaWifi;
  kucniLjubimac;
  pogledNaMore;
  samoPrioritetan;
};
```
