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
- **Validacija:** Zod v4 unutar React Hook Form-a
- **Autentikacija:** Better Auth (samo djelatnici agencije)

---

## NAČIN RADA S CLAUDE-OM

- Sav razvoj odvija se u **Claude chatu** — ne u Claude Code ni command line modu
- Claude piše kod direktno u chat; svaka datoteka prikazana je zasebno s punom putanjom
- Razvoj ide **korak po korak** uz diskusiju — Claude ne piše unaprijed više od dogovorenog koraka
- Claude postavlja pitanja prije pisanja koda ako nešto nije jasno
- Kad treba pokrenuti terminal naredbu, Claude je napiše kao code block s objašnjenjem
- Claude nikad ne generira .tar ili zip arhive — sve ide kroz chat

---

## ARHITEKTURALNA NAČELA

- Next.js ima dvostruku ulogu: web sučelje i backend API
- **DB logika mora biti striktno odvojena od transportnog sloja** — Server Actions i API
  rute ne smiju direktno sadržavati Drizzle upite; queries idu u poseban sloj (`lib/db/queries/`)
- Biblioteke se instaliraju tek kada su potrebne, ne unaprijed
- Aplikacija ima puno formi — preferirati konzistentne obrasce s React Hook Form + Zod + shadcn/ui

---

## ORGANIZACIJA DATOTEKA

src/
├── app/
│ ├── (auth)/
│ ├── (dashboard)/
│ │ ├── rezervacije/
│ │ ├── apartmani/
│ │ ├── iznajmljivaci/
│ │ │ ├── page.tsx
│ │ │ ├── iznajmljivaci-client.tsx
│ │ │ ├── actions.ts
│ │ │ ├── novi/
│ │ │ │ └── page.tsx
│ │ │ └── [id]/
│ │ │ └── uredi/
│ │ │ └── page.tsx
│ │ ├── gosti/
│ │ └── kalendar/
│ └── api/
│
├── components/
│ ├── ui/ # shadcn/ui komponente
│ ├── iznajmljivaci/ # Feature komponente
│ └── layout/ # Sidebar, TopBar, Footer
│
├── lib/
│ ├── db/
│ │ ├── schema/
│ │ ├── queries/
│ │ └── index.ts
│ ├── actions/
│ ├── validations/
│ └── utils/
│
└── types/

---

## DOMENSKA LOGIKA

### Ključni entiteti

- **Agencija (`agencies`)** — jedan tenant za sada; svaki drugi entitet nosi `agency_id`
- **Iznajmljivač** — privatni vlasnik jednog ili više apartmana
- **Apartman** — smještajna jedinica u vlasništvu iznajmljivača
- **Gost** — osoba koja rezervira smještaj
- **Rezervacija** — veza između gosta, apartmana i datuma; sadrži status, iznos, polog
- **Ponuda** — prethodi rezervaciji; šalje se gostu mailom
- **Račun** — dva tipa: račun gostu (u ime iznajmljivača) i račun iznajmljivaču (za proviziju)

### Vrste iznajmljivača

| Vrijednost          | Opis                                   | Ime obavezno  | Datum rođenja |
| ------------------- | -------------------------------------- | ------------- | ------------- |
| `fizicka_osoba`     | Privatni — nije u PDV-u                | Da            | Obavezan      |
| `fizicka_osoba_pdv` | Privatni — u sustavu PDV-a             | Da            | Obavezan      |
| `obrt`              | Obrt (surname = naziv, name = vlasnik) | Da            | Nije obavezan |
| `tvrtka`            | Tvrtka (surname = naziv tvrtke)        | Nije obavezan | Nije obavezan |

### Provizija

- Tip **P** (postotak) — iznos mora biti > 0 i < 100
- Tip **I** (iznos) — agencija definira vlastitu cijenu; iznos je 0 i nije editabilan, automatski se resetira na 0

### Cjenik apartmana

- `price_per_night` — cijena agencije (prikazuje se gostima)
- `landlord_price` — cijena iznajmljivača (donja granica za pregovaranje), opcionalna

### Tijek procesa (happy path)

1. Gost kontaktira agenciju
2. Djelatnik pretražuje dostupne apartmane prema kriterijima
3. Agencija gostu šalje ponudu
4. Gost uplaćuje cjelokupni iznos ili polog
5. Agencija kreira rezervaciju i gostu šalje potvrdu
6. Agencija izdaje račun gostu (u ime iznajmljivača)
7. Agencija izdaje račun iznajmljivaču za proviziju

---

## PATTERNS

### Master-Detail stranica

**Struktura datoteka:**

src/app/(dashboard)/[entitet]/
├── page.tsx
├── [entitet]-client.tsx
└── actions.ts

**Pravila:**

- `page.tsx` je async Server Component, nema `"use client"`
- `[entitet]-client.tsx` ima `"use client"` na vrhu
- `actions.ts` ima `"use server"` na vrhu; samo poziva query funkcije
- `useTransition` za async operacije; donje tablice dobiju `opacity-60` dok čekaju
- Pri učitavanju selektiran je prvi red (`orderBy createdAt asc`)
- Klik na glavni red → osvježi podtablicu 1 → selektira prvi red → osvježi podtablicu 2
- Klik na red podtablice 1 → osvježi podtablicu 2

**Toolbar iznad glavne tablice:**

- Lijevo: `Input` za search (ikona `Search` iz lucide-react)
- Desno: Briši (`variant destructive`), Promijeni (`variant outline`), Dodaj (default)

**Sortiranje:**

- Klik na zaglavlje kolone mijenja smjer (`asc → desc → asc`)
- Vizualni indikator: ↑ ↓ za aktivno, ↕ (prigušeno) za neaktivno
- Sort i search rade na klijentskoj strani

### Forma iznajmljivača

**Rute:** `/iznajmljivaci/novi` i `/iznajmljivaci/[id]/uredi`

**Raspored:** dvije kolone, tab redosljed odozgo prema dolje po koloni

**Kolona 1 (lijevo):**
Vrsta iznajmljivača → Prezime/Naziv → Ime (skriveno za tvrtku) → OIB → Grad/mjesto → Adresa → Telefon → Email → IBAN

**Kolona 2 (desno):**
Rješenje → Broj ugovora → Tip provizije → Iznos provizije → Prioritetan → Datum rođenja (vidljiv samo za fizicka_osoba i fizicka_osoba_pdv) → [separator] → eVisitor podaci → Korisničko ime → Lozinka

**Donji dio forme:**

- Lijevo: tablica apartmana (Dodaj/Uredi/Briši)
- Desno: cjenik selektiranog apartmana (inline upis)
- Klik na apartman → prikazuje njegov cjenik desno

### ApartmanModal komponenta

**Četiri kartice:**

**Kartica 1 — Osnovni podaci:**
Kratki naziv | Puni naziv | Vrsta smještaja | Grad/mjesto | Adresa | Web URL | Broj zvjezdica (★★★☆☆) | Kategorizacijski broj | Sobe | Kreveta | Pom. ležajevi | Maks. osoba | Aktivan | Prioritetan | Čisti agencija | Opis

**Kartica 2 — Dodatni detalji:**
Parking | Klima | WiFi | Roštilj | Terasa | Pogled na more | Kućni ljubimci | Nepušači | Pristupačno invalidima | Kuhinja | Čajna kuhinja | Broj kupaonica | Kupaona tuš | Jacuzzi | Kat

**Kartica 3 — U blizini / aktivnosti (3 grupe):**

- Sadržaj u blizini: Bazen | Spa | Fitness | Restoran | El. puniona auta
- Udaljenosti: Od mora (m) | Od centra (m) | Od trgovine (m)
- Aktivnosti: Bicikliranje | Ronjenje | Planinarenje

**Kartica 4 — Katastarski podaci:**
Katastarska općina | Katastarska čestica (oba nullable, nisu obavezna)

### Inline cjenik

Kolone: Datum od | Datum do | Cijena/noć (bold) | Cijena izn. (muted)
Novi red se dodaje na dno tablice s praznim inputima — korisnik upiše i klikne "Potvrdi"

### Combobox s inline dodavanjem

Koristi se za Grad/mjesto svugdje u aplikaciji.
Pattern: `Command` + `Popover` iz shadcn/ui + opcija "➕ Dodaj novi grad" na dnu liste.

### Formatiranje podataka

```typescript
// Datum: DD.MM.YYYY.
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

// Iznos: dvije decimale
parseFloat(value).toFixed(2);

// Enum → hrvatski naziv
const vrstaLabel: Record<string, string> = {
  fizicka_osoba: "Fizička osoba",
  fizicka_osoba_pdv: "Fizička osoba (PDV)",
  obrt: "Obrt",
  tvrtka: "Tvrtka",
};
```

---

## ZOD NAPOMENE (v4)

- Ne koristiti `required_error` ni `invalid_type_error` — ne postoje u v4
- Koristiti `.min(1, "poruka")` za obavezna polja
- Za opcionalna string polja: `.optional().or(z.literal(""))`
- Za uvjetnu validaciju koristiti `.and(z.discriminatedUnion(...))`
- Landlord schema ima dva `discriminatedUnion`: jedan za vrstu iznajmljivača, jedan za tip provizije

---

## ENVIRONMENT

### Varijable okoline

DATABASE_URL=postgresql://...
AGENCY_ID=uuid-agencije

- `.env` i `.env.local` moraju biti identični
- Next.js čita `.env.local`; tsx skripte čitaju `.env`

### Pokretanje skripti na Windowsu

- `tsx` nije globalno dostupan — uvijek kroz `npm run` ili `npx tsx`
- `grep` ne postoji na Windowsu — gledati direktno u datoteku
- Za SQL migracije koje ne prođu kroz `db:migrate`: Neon konzola → SQL Editor

---

## KALENDAR REZERVACIJA

Prikaz u stilu Gantt dijagrama:

- **1. stupac:** iznajmljivač
- **2. stupac:** apartman
- **Ostali stupci:** dani (tjedan ili mjesec)

---

## KONVENCIJE

- Jezik sučelja: **hrvatski**
- Kod i komentari: **engleski**
- Nazivi datoteka i ruta: **kebab-case**
- Komponente: **PascalCase**
- Server Actions: prefiks `action` (npr. `actionCreateLandlord`)
- Query funkcije: prefiks prema operaciji (npr. `getLandlords`, `createAccommodation`)
- Nazivi varijabli: **bez hrvatskih dijakritičkih znakova** (č→c, š→s, ž→z, ć→c, đ→d)

---

## UX KONVENCIJE — COMBOBOX S DODAVANJEM

### Princip

Combobox koji omogućuje inline dodavanje novog zapisa (grad, vrsta,
tag...) uvijek ima fiksni gumb "Dodaj novi..." ispod liste, izvan
`CommandList`. Gumb je uvijek vidljiv, neovisno o tome što je upisano
u search polje.

### Implementacija

- Gumb se postavlja unutar `<Command>` ali **izvan** `<CommandList>`
- Odvojen od liste s `border-t`
- Koristi `onMouseDown` s `e.preventDefault()` umjesto `onClick` —
  sprječava blur koji bi zatvorio popover prije nego se dialog otvori
- Otvara zasebni `Dialog` s formom za unos novog zapisa
- Nakon uspješnog spremanja: novi zapis se dodaje u lokalnu listu i
  automatski selektira — bez refresha stranice

### Primjer

`src/components/iznajmljivaci/CityCombobox.tsx` +
`src/components/iznajmljivaci/AddCityDialog.tsx`

---

## POSLOVNA PRAVILA I ODLUKE

### Multi-tenancy i OIB provjera

- Svaka provjera jedinstvenosti OIB-a mora uključivati `agency_id` — isti OIB
  može postojati u više agencija (SaaS scenarij)
- `AGENCY_ID` se čita iz `process.env.AGENCY_ID` direktno u query sloju
  (`lib/db/queries/`), ne prosljeđuje se kroz action → query

### Forme — UX konvencije

- `autoComplete="new-password"` na svim osobnim poljima (ime, prezime, OIB...)
  jer Chrome ignorira `autoComplete="off"` za prepoznatljiva polja
- Numerički inputi s default vrijednošću 0: dodati `onFocus={(e) => e.target.select()}`
- Datum u hrvatskom formatu (dd.mm.gggg.) — koristiti `type="text"` s auto-formatiranjem,
  ne `type="date"`
- Kada korisnik promijeni vrstu iznajmljivača, resetirati polja koja nisu relevantna
  za novu vrstu (npr. `name` i `datumRodjenja` za Tvrtku)

### Greške iz Server Actions

- Actions vraćaju `{ data }` ili `{ error: string }` — nikad ne throwaju
- Greška se prikazuje pomoću `form.setError("poljeNaziv", { type: "manual", message })`
  direktno ispod relevantnog polja, bez toast biblioteke

---

## DOSTAVLJENI MATERIJALI (svježe uz svaki chat)

- Drizzle sheme: `landlords.ts`, `accommodations.ts`, `pricelist.ts`
- Zod validacije: `landlord.ts`, `accommodation.ts`, `pricelist.ts`
- Server Actions: `landlords.ts` (actions)
- Query funkcije po potrebi

| Datoteka       | Putanja u projektu     |
| -------------- | ---------------------- |
| Drizzle sheme  | `src/lib/db/schema/`   |
| Zod validacije | `src/lib/validations/` |
| Server Actions | `src/lib/actions/`     |
| Query funkcije | `src/lib/db/queries/`  |

---

## NAPOMENE

- Projekt se razvija na dva računala — Neon PostgreSQL omogućuje dijeljenu bazu
- Multi-tenancy nije aktivan, ali **svaki entitet mora imati `agency_id`** od početka
- Drizzle migracije koje ne prođu kroz `db:migrate` primjenjuju se ručno u Neon SQL Editoru
- Autentikacija se implementira u jednom od kasnijih sprintova
