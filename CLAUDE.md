# CLAUDE.md — Aplikacija za turističku agenciju

Ovo je kratki ulazni dokument za Claude Code.

Detaljna projektna dokumentacija nalazi se u `docs/`.

Ne učitavaj svu dokumentaciju automatski. Pročitaj samo dokumente relevantne za zadatak na kojem trenutno radiš.

## Projekt

Web aplikacija za turističke agencije koje posreduju u iznajmljivanju privatnog smještaja.

Trenutno aplikacija radi za jednu agenciju identificiranu preko:

```text
AGENCY_ID
```

Dugoročni cilj je **multi-tenant SaaS aplikacija za više turističkih agencija**.

Glavni poslovni tijek:

```text
upit gosta
→ pretraga smještaja
→ rezervacija
→ ponuda
→ uplata
→ potvrda rezervacije
→ voucher
→ prijava / stay
→ eVisitor
→ odjava
→ račun gostu u ime iznajmljivača
→ fiskalizacija / eRačun gdje je primjenjivo
→ obračun provizije
→ račun iznajmljivaču
→ izvještaji
```

Širi poslovni kontekst:

```text
docs/project-overview.md
```

## Tech stack

```text
Next.js 15+ / App Router
React
TypeScript
Tailwind CSS
shadcn/ui
Drizzle ORM
PostgreSQL / Neon
Zod v4
React Hook Form
@hookform/resolvers
@react-pdf/renderer
fast-xml-parser
```

Autentikacija:

```text
Better Auth — planirano
```

## Env varijable

```text
AGENCY_ID=<uuid agencije>
NEXT_PUBLIC_CALENDAR_DAYS_BEFORE=6
NEXT_PUBLIC_CALENDAR_DAYS_AFTER=45
NEXT_PUBLIC_RESERVATION_VALID_DAYS=3
UNKNOWN_CITY_ID=10
```

## Projektna dokumentacija

### Poslovni kontekst

```text
docs/project-overview.md
```

Svrha aplikacije, terminologija, glavni entiteti, poslovni workflow i cross-module pravila.

### Development pravila

```text
docs/development-rules.md
```

Arhitektura, query/action/validation pravila, forme, tenant readiness i razvojne konvencije.

### Baza podataka

```text
docs/database.md
```

Značenje tabela, relacije, tenant ownership, FK pravila, database invariants, snapshoti, numeriranje i migrations.

Stvarna fizička struktura baze uvijek se provjerava u:

```text
src/lib/db/schema/
```

### UI / design system

```text
docs/ui-design-system.md
```

shadcn/ui, design tokeni, layout, forme, tablice, toolbar, dialog/sheet i ostala UI pravila.

### Trenutno stanje

```text
docs/status-projekta.md
```

Što je djelomično implementirano, u razvoju ili planirano.

### Poznati problemi

```text
docs/known-issues.md
```

Potvrđeni bugovi, workaroundi, tehnički dug i problemi koje treba istražiti.

### Moduli

```text
docs/modules/
├── calendar.md
├── reservations.md
├── offers.md
├── payments.md
├── stays.md
├── landlords.md
└── accommodations.md
```

Module dokument je primarni dokument za poslovna i implementacijska pravila konkretnog modula.

## Prije rada na featureu

1. Pročitaj `docs/status-projekta.md`.
2. Ako postoji, pročitaj odgovarajući `docs/modules/<module>.md`.
3. Pročitaj `docs/database.md` ako promjena utječe na podatke, relacije ili tenant ownership.
4. Pročitaj `docs/ui-design-system.md` ako mijenjaš UI.
5. Pročitaj `docs/development-rules.md` prije uvođenja novog arhitekturnog obrasca.
6. Provjeri `docs/known-issues.md` ako radiš u području koje ima poznate probleme.
7. Pregledaj stvarni relevantni source prije donošenja zaključka ili implementacije.

Ne učitavaj nepovezanu dokumentaciju bez potrebe.

## Source i dokumentacija

Dokumentacija daje poslovni i arhitekturni kontekst, ali ne pretpostavljaj da precizno opisuje svaki detalj trenutne implementacije.

Ako postoji razlika između dokumentacije i sourcea:

1. utvrdi je li dokumentacija zastarjela
2. provjeri postoji li bug u sourceu
3. provjeri radi li se o namjernoj nedovršenoj implementaciji
4. ne mijenjaj poslovno pravilo samo zato da source i dokumentacija postanu jednaki

Ne izmišljaj ponašanje datoteka ili funkcija koje nisi pregledao.

## Razvojna pravila

Ne uvodi nove arhitekturne obrasce ako postojeći projekt već ima stabilan pattern za isti problem.

Ne radi nepotrebne refactore izvan opsega zadatka.

Ne dodaj apstrakciju za samo jedan use case bez jasne potrebe.

Ne dodaj DELETE samo radi potpunog CRUD-a. Konačna deletion politika projekta još nije donesena.

Kod tenant-sensitive operacija ne pretpostavljaj da je UUID sam po sebi dovoljna zaštita.

Server je trust boundary — client-side validation nije zamjena za server-side validation.

## Jezik i naming

Korisničko sučelje i poslovna dokumentacija:

```text
hrvatski
```

Kod, funkcije, varijable i tehnički identifikatori:

```text
engleski
```

bez hrvatskih dijakritičkih znakova gdje je praktično.

U hrvatskoj dokumentaciji koristi:

```text
iznajmljivač
smještajna jedinica
```

U tehničkom kodu zadržati postojeće nazive:

```text
landlord
accommodation
```

Ne preimenovati tehničke identifikatore samo radi prijevoda.

## Nakon značajne promjene

Ažuriraj dokumentaciju samo ako je promjena relevantna za njezinu svrhu.

Najčešće:

```text
docs/status-projekta.md
docs/modules/<module>.md
docs/known-issues.md
```

`project-overview.md`, `database.md`, `development-rules.md` i `ui-design-system.md` mijenjaj samo kada se promijene pravila koja ti dokumenti opisuju.

Ne koristi dokumentaciju kao changelog.

Git je trajna povijest implementacijskih promjena.