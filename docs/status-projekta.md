# status-projekta.md — Trenutno stanje projekta

## 1. Svrha dokumenta

Ovaj dokument daje kratak operativni pregled trenutnog stanja projekta.

Ne opisuje detaljnu poslovnu logiku pojedinih modula.

Za detalje koristiti:

```text
docs/modules/
```

Ovaj dokument ažurirati nakon značajne promjene funkcionalnosti ili prioriteta projekta.


# Opće stanje

## 2. Status projekta

Projekt je u:

**aktivnom razvoju**

Aplikacija trenutno radi za jednu turističku agenciju preko:

```text
AGENCY_ID
```

Dugoročni cilj je:

**multi-tenant SaaS aplikacija za više turističkih agencija.**


## 3. Važno: nijedan glavni poslovni modul još nije potpuno dovršen

Postojeći moduli imaju različite razine implementacije, ali nijedan glavni poslovni modul zasad se ne smatra potpuno završenim.

Razlozi uključuju:

- nedovršene workflowe između modula
- nedovršena poslovna pravila
- pojedine placeholder funkcije
- tenant-safety koji još nije svugdje implementiran
- nedovršenu politiku brisanja/deaktivacije
- buduću autentikaciju i SaaS arhitekturu


# Statusne oznake

## 4. Koristiti sljedeće statuse

### `Djelomično implementirano`

Postoji značajan dio funkcionalnosti i stvarni workflow, ali modul još nije kompletan.

### `U razvoju`

Postoji početna implementacija, ali ključni workflow još nije dovoljno razvijen.

### `Planirano`

Funkcionalnost još nije implementirana ili postoji samo pripremna schema/ideja.

### `Dovršeno`

Koristiti tek kada su sve trenutno definirane funkcionalnosti modula završene i integrirane.

Trenutno nijedan glavni poslovni modul nema ovaj status.


# Infrastruktura

## 5. Osnovni tech stack

Implementirano:

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


## 6. Osnovna aplikacijska struktura

Postoje:

- dashboard layout
- navigacija
- shared UI komponente
- Drizzle schema
- query sloj
- Server Actions
- validation sloj
- module-specific komponente
- osnovne PDF komponente
- XML parser za bankovne izvode


# Baza podataka

## 7. Glavni postojeći entiteti

U projektu trenutno postoje schema/modeli za entitete poput:

```text
agencies
cities
landlords
accommodations
pricelist
guests
partners
reservations
stays
stays_stavke
offers
offers_stavke
services
taxes
izvod_tmp
payments
```

Stvarna fizička struktura uvijek se provjerava u:

```text
src/lib/db/schema/
```

Detaljni odnosi i database pravila:

```text
docs/database.md
```


# Pregled glavnih modula

## 8. Iznajmljivači

**Status: Djelomično implementirano**

Postoji:

- pregled iznajmljivača
- unos novog iznajmljivača
- izmjena iznajmljivača
- Zod validacija
- OIB validacija
- vrste iznajmljivača
- postotna i individualna provizija
- grad i adresa
- IBAN
- eVisitor podaci
- prioritet
- prikaz povezanih smještajnih jedinica
- prikaz cjenika preko odabrane smještajne jedinice

Nije završeno:

- konačna deletion/deactivation politika
- potpuna tenant zaštita queryja
- sigurnosni model za eVisitor credentials
- pojedini UI workflow detalji

Detalji:

```text
docs/modules/landlords.md
```


## 9. Smještajne jedinice

**Status: Djelomično implementirano**

Postoji:

- unos
- izmjena
- dohvat po iznajmljivaču
- tip smještaja
- kapacitet
- kategorizacija
- grad i adresa
- sadržaji
- aktivnosti
- udaljenosti
- prioritet
- aktivan/neaktivan status
- čišćenje od strane agencije
- povezani cjenik
- korištenje u Kalendaru
- korištenje u Rezervacijama
- korištenje u Prijavama

Nije završeno:

- potpuna tenant zaštita queryja
- konačna deletion politika
- konačna pravila kapaciteta
- konačni model cjenika i obračuna
- eventualne fotografije i dodatni podaci
- konačna uloga `fullName`
- konačni workflow `cistiAgencija`

Detalji:

```text
docs/modules/accommodations.md
```


## 10. Cjenici

**Status: Djelomično implementirano**

Postoji:

- cjenik po smještajnoj jedinici
- vremenski period cijene
- `pricePerNight`
- `landlordPrice`
- unos/izmjena kroz postojeći landlord/accommodation workflow

Nije završeno:

- konačna pravila preklapanja perioda
- konačna logika izračuna cijene rezervacije
- konačna veza s provizijom
- automatizirano korištenje cjenika u ponudi


## 11. Kalendar / Gantt

**Status: Djelomično implementirano**

Postoji:

- Gantt prikaz smještajnih jedinica
- prikaz rezervacija
- prikaz prijava
- izbor perioda
- filtriranje po dijelu kriterija
- označavanje preklapanja
- vizualni status događaja
- izbor raspona dana
- otvaranje rezervacijskog modala
- availability provjera prije kreiranja rezervacije

Nije završeno:

- filter Grad
- filter Iznajmljivač
- puni context-menu workflow
- izrada prijave iz Kalendara
- konačni vizualni dizajn statusnih boja
- pojedini refresh/filter detalji

Detalji:

```text
docs/modules/calendar.md
```


## 12. Rezervacije

**Status: Djelomično implementirano**

Postoji:

- tablica rezervacija
- kreiranje rezervacije
- kreiranje rezervacije iz Kalendara
- validation
- availability provjera
- status nepotvrđena/potvrđena
- storno podatak u modelu
- izvedeni status realizirane rezervacije preko `stays`
- partner
- povezivanje prema ponudi
- toolbar infrastruktura

Trenutno funkcionalno radi:

```text
Izrada ponude
```

Dio ostalih toolbar akcija još je placeholder ili nedovršen.

Nije završeno:

- detaljni canvas rezervacije
- puni workflow potvrde
- voucher
- prijava gosta
- storno workflow
- deletion workflow
- potpuno povezivanje uplata i potvrde rezervacije

Detalji:

```text
docs/modules/reservations.md
```


## 13. Ponude

**Status: Djelomično implementirano**

Postoji:

- lista ponuda
- kreiranje ponude iz rezervacije
- header ponude
- stavke ponude
- usluge
- količina
- cijena
- popust
- porez
- neto/bruto iznosi
- predujam
- footer
- stabilni line-item state pattern
- PDF komponenta

Nije završeno:

- stvarni print/PDF endpoint workflow
- automatski izračun smještaja iz cjenika
- dodavanje nove usluge iz comboboxa
- slanje ponude
- konačna numeracija
- potpuna server-side validation/tenant kontrola
- pojedini snapshot detalji

Važno:

```text
src/app/api/ponude/[id]/pdf/route.ts
```

trenutno ne postoji, pa dugme za ispis ne predstavlja završen PDF workflow.

Detalji:

```text
docs/modules/offers.md
```


## 14. Bankovni izvodi i uplate

**Status: Djelomično implementirano**

Postoji ruta:

```text
/unos_izvoda
```

i stvarni workflow:

```text
CAMT XML
↓
parse
↓
izvod_tmp
↓
ručno povezivanje s rezervacijom
↓
knjiženje
↓
payments
```

Postoji:

- upload XML datoteke
- parser bankovnog izvoda
- staging tabela
- prikaz transakcija
- povezivanje s rezervacijom
- prikaz podatka o ponudi/predujmu
- knjiženje povezanih stavki
- deduplikacija preko `(agencyId, bankRef)`

Nije završeno:

- transakcijski siguran `delete staging + insert`
- konačna pravila za debitne/negativne stavke
- automatska potvrda rezervacije nakon odgovarajuće uplate
- usporedba očekivanog i stvarno uplaćenog iznosa
- čišćenje ili označavanje proknjiženog staginga
- stabilno ponašanje ako rezervacija ima više ponuda
- puna tenant provjera kod povezivanja rezervacije
- poseban UI za povijest `payments`

Detalji:

```text
docs/modules/payments.md
```


## 15. Prijave / stays

**Status: U razvoju**

Trenutno postoji:

- `stays` schema
- `stays_stavke` schema
- status `aktivna / odjavljena`
- veza prema smještajnoj jedinici
- opcionalna veza prema rezervaciji
- glavni gost
- partner
- datumi boravka
- pojedinačne osobe u `stays_stavke`
- eVisitor kategorije
- nekoliko ručno/testno kreiranih zapisa radi testiranja Gantta

Još ne postoji kompletan:

- UI za prijavu
- create/update workflow
- check-in workflow
- check-out workflow
- eVisitor workflow
- upravljanje svim osobama boravka
- račun gosta
- povezani fiskalni workflow

Testni podaci za Gantt ne smatraju se poslovnom specifikacijom.

Detalji:

```text
docs/modules/stays.md
```


# Pomoćne evidencije

## 16. Gosti

**Status: Djelomično implementirano**

Schema i dio postojeće funkcionalnosti postoje.

Konačni model još ovisi o budućem:

- stay workflowu
- eVisitoru
- računima


## 17. Partneri

**Status: Djelomično implementirano**

Partneri se već koriste u rezervacijama i drugim dijelovima aplikacije.

Puni samostalni CRUD/modul još nije glavni fokus razvoja.


## 18. Usluge i porezi

**Status: Djelomično implementirano**

Postoje:

- schema
- seed/matični podaci
- korištenje u ponudama

Puni zasebni CRUD workflow još nije prioritet.


# Planirani glavni poslovni moduli

## 19. Voucher

**Status: Planirano**

Voucher se treba izdavati nakon potvrde rezervacije.


## 20. eVisitor

**Status: Planirano**

Treba povezati:

```text
stays
+
stays_stavke
+
guests
```

s budućim eVisitor workflowom.


## 21. Račun gostu

**Status: Planirano**

Agencija treba izdavati račun gostu:

**u ime iznajmljivača.**


## 22. Fiskalizacija / eRačun

**Status: Planirano**

Pravila će se definirati prema stvarnom poreznom i zakonskom workflowu kada modul dođe na red.


## 23. Obračun provizije

**Status: Planirano**

Treba definirati konačnu vezu između:

```text
rezervacije
cjenika
landlordPrice
tipa provizije
individualne provizije
računa iznajmljivaču
```


## 24. Račun iznajmljivaču

**Status: Planirano**

Agencija treba iznajmljivaču izdati vlastiti račun za proviziju odnosno uslugu posredovanja.


## 25. Izvještaji i poslovne evidencije

**Status: Planirano**

Konačni skup izvještaja definirat će se nakon povezivanja glavnog poslovnog workflowa.


## 26. Autentikacija i SaaS

**Status: Planirano**

Planirano:

```text
Better Auth
```

Prije multi-tenant produkcije potrebno je:

- autentificirati korisnika
- povezati korisnika s agencijom
- zamijeniti globalni `AGENCY_ID` tenant kontekstom
- tenant-scopeati sve queryje
- spriječiti cross-tenant FK veze
- definirati role i prava pristupa


# Trenutni glavni razvojni fokus

## 27. Prioritet nije završavanje pojedinačnog CRUD-a

Trenutni fokus treba biti povezivanje cijelog poslovnog procesa.

Cilj nije:

```text
dovršiti svaki CRUD izolirano
```

nego izgraditi funkcionalan slijed:

```text
rezervacija
↓
ponuda
↓
uplata
↓
potvrda
↓
voucher
↓
prijava
↓
eVisitor
↓
račun gostu
↓
provizija
↓
račun iznajmljivaču
```


## 28. Zašto

Tek kada je glavni workflow povezan, mogu se kvalitetno donositi odluke o:

- statusima
- brisanju
- storno mehanizmima
- snapshotovima
- audit trailu
- povezivanju dokumenata
- retentionu
- SaaS pravilima


# Brisanje i deaktivacija

## 29. Deletion politika je namjerno odgođena

Konačna odluka o fizičkom brisanju još nije donesena.

To nije bug niti nedovršen CRUD zadatak.


## 30. Razlog

Prije odluke treba razumjeti veze između:

```text
iznajmljivača
smještajnih jedinica
cjenika
rezervacija
ponuda
uplata
prijava
računa
fiskalnih dokumenata
izvještaja
```


## 31. Mogući pristupi

Ovisno o entitetu mogu se koristiti:

- fizički DELETE
- deaktivacija
- status
- storno
- soft delete

Ne uvoditi isti model automatski za sve entitete.


## 32. Postojeće delete funkcije

Pojedini tehnički delete queryji/actioni već postoje, primjerice kod smještajnih jedinica i cjenika.

To ne znači da je poslovna deletion politika donesena.


# Dokumentacija modula

## 33. Trenutno dokumentirani moduli

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


## 34. Ne stvarati module dokumente bez potrebe

Pomoćne tabele ne trebaju zaseban `.md` dokument samo zato što postoje u bazi.

Novi module dokument napraviti kada:

- modul dobije značajnu poslovnu logiku
- workflow postane dovoljno definiran
- dokument stvarno pomaže razvoju


# Poznati problemi

## 35. Ne duplicirati bug listu

Detaljna lista poznatih problema vodi se u:

```text
docs/known-issues.md
```

`status-projekta.md` treba prikazivati stanje modula, a ne postati druga bug-tracking datoteka.


# Pravilo ažuriranja

## 36. Kada ažurirati ovaj dokument

Ažurirati nakon:

- završetka značajne funkcionalnosti
- promjene statusa modula
- dodavanja novog glavnog workflowa
- promjene glavnog prioriteta razvoja
- značajne promjene arhitekture


## 37. Što ne zapisivati ovdje

Ne koristiti ovaj dokument kao:

- detaljan changelog
- Git history
- popis svakog commita
- popis svakog riješenog buga
- detaljnu tehničku specifikaciju modula

Za detalje koristiti Git i odgovarajuće module dokumente.


# Trenutni sažetak

## 38. Status modula

| Modul | Status |
|---|---|
| Iznajmljivači | Djelomično implementirano |
| Smještajne jedinice | Djelomično implementirano |
| Cjenici | Djelomično implementirano |
| Kalendar / Gantt | Djelomično implementirano |
| Rezervacije | Djelomično implementirano |
| Ponude | Djelomično implementirano |
| Bankovni izvodi / uplate | Djelomično implementirano |
| Prijave / stays | U razvoju |
| Gosti | Djelomično implementirano |
| Partneri | Djelomično implementirano |
| Usluge / porezi | Djelomično implementirano |
| Voucher | Planirano |
| eVisitor | Planirano |
| Račun gostu | Planirano |
| Fiskalizacija / eRačun | Planirano |
| Obračun provizije | Planirano |
| Račun iznajmljivaču | Planirano |
| Izvještaji | Planirano |
| Better Auth / SaaS | Planirano |


## 39. Najvažnije trenutno pravilo

**Ne proglašavati modul dovršenim samo zato što postoji schema, CRUD ili osnovni UI.**

Modul je dovršen tek kada je njegova trenutno definirana poslovna funkcionalnost implementirana, integrirana s ostatkom workflowa i nema poznatih blokirajućih nedostataka.