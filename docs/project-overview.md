# project-overview.md — Poslovni kontekst i domenska logika

## 1. Svrha aplikacije

Aplikacija je interna poslovna web aplikacija za turističku agenciju koja posreduje u iznajmljivanju privatnog smještaja.

Agencija povezuje gosta s iznajmljivačem i vodi operativni proces od upita za smještaj do završnog financijskog obračuna.

Aplikacija treba podržavati najmanje:

```text
upit gosta
↓
pretragu raspoloživog smještaja
↓
rezervaciju
↓
ponudu
↓
uplatu
↓
potvrdu rezervacije
↓
voucher
↓
dolazak gosta
↓
prijavu / boravak
↓
eVisitor
↓
odjavu gosta
↓
račun gostu u ime iznajmljivača
↓
fiskalizaciju / eRačun gdje je primjenjivo
↓
obračun provizije agencije
↓
račun iznajmljivaču
↓
izvještaje i poslovne evidencije
```


## 2. Trenutni i budući model

Aplikacija trenutno radi za jednu agenciju.

Agencija je privremeno određena preko:

```text
AGENCY_ID
```

env varijable.

Dugoročni cilj projekta je:

**multi-tenant SaaS aplikacija za više turističkih agencija.**

Zbog toga se već sada kod dizajna baze, queryja i poslovne logike mora voditi računa o tenant ownershipu.


## 3. Tenant princip

Većina glavnih poslovnih entiteta ima vlastiti:

```text
agencyId
```

odnosno database kolonu:

```text
agency_id
```

Neki child entiteti nemaju vlastiti `agency_id`, nego tenant pripadnost nasljeđuju preko roditeljskog entiteta.

Primjer:

```text
pricelist
↓
accommodation
↓
agency
```

Zato budući SaaS nije samo zamjena `AGENCY_ID` env varijable autentificiranim tenantom.

Prije SaaS faze potrebno je osigurati:

- tenant-scoped read queryje
- tenant-scoped update i delete operacije
- provjeru tenant ownershipa povezanih FK vrijednosti
- tenant-scoped uniqueness pravila
- zaštitu od cross-tenant povezivanja podataka

Detaljna pravila nalaze se u:

```text
docs/development-rules.md
docs/database.md
```


# Terminologija

## 4. Baza i UI

U projektnoj dokumentaciji vrijedi:

**tabela**  
= tabela u bazi podataka

Primjer:

```text
reservations tabela
```

**tablica**  
= UI grid/table komponenta prikazana korisniku.


## 5. Iznajmljivač

U hrvatskoj dokumentaciji i korisničkom sučelju koristi se:

**iznajmljivač**

U tehničkom sloju koristi se:

```text
landlord
landlords
landlordId
```


## 6. Smještajna jedinica

Opći poslovni naziv je:

**smještajna jedinica**

Tehnički naziv:

```text
accommodation
accommodations
accommodationId
```

Postojeći UI često koristi naziv:

**apartman**

jer je većina smještaja tog tipa.

Entitet ipak podržava i druge vrste smještaja, pa dokumentacija koristi širi naziv **smještajna jedinica**.


## 7. Rezervacija

**Rezervacija** predstavlja najavu budućeg boravka gosta u konkretnoj smještajnoj jedinici.

Rezervacija još ne znači da je gost fizički stigao.


## 8. Prijava / stay

**Prijava** ili tehnički **stay** predstavlja stvarni boravak gosta.

Prijava može:

- nastati iz rezervacije
- nastati bez rezervacije kao walk-in prijava

Jedna prijava može sadržavati više osoba kroz `stays_stavke`.


## 9. Ponuda

**Ponuda** je poslovni dokument vezan uz rezervaciju.

Sadrži stavke usluga, iznose, porezne podatke i podatke o predujmu.


## 10. Izvod i uplata

**Izvod** predstavlja bankovni izvod uvezen u aplikaciju.

**Payment / uplata** predstavlja proknjiženu bankovnu transakciju koja se može povezati s rezervacijom.


## 11. Evidencija

Naziv **evidencija** koristi se za pomoćne ili matične podatke, primjerice:

- gradove
- goste
- partnere
- usluge
- poreze

Takvi entiteti ne moraju nužno imati vlastiti modul dokumentacije dok njihova poslovna pravila nisu dovoljno razvijena.


# Ključni poslovni entiteti

## 12. Agencija

Agencija predstavlja tenant.

Trenutno postoji jedna aktivna agencija.

U budućem SaaS modelu ista aplikacija mora podržavati više međusobno izoliranih agencija.


## 13. Iznajmljivač

Iznajmljivač je osoba, obrt ili tvrtka koja agenciji daje jednu ili više smještajnih jedinica na posredovanje.

Trenutno podržane vrste:

```text
fizicka_osoba
fizicka_osoba_pdv
obrt
tvrtka
```

Detalji:

```text
docs/modules/landlords.md
```


## 14. Smještajna jedinica

Smještajna jedinica pripada jednom iznajmljivaču.

Može biti:

```text
apartman
soba
studio
vila
kuca
mobilna_kucica
```

Smještajna jedinica povezuje:

```text
iznajmljivača
↓
cjenik
↓
rezervacije
↓
prijave
```

Detalji:

```text
docs/modules/accommodations.md
```


## 15. Gost

Gost predstavlja osobu koja rezervira ili boravi u smještaju.

Potrebni podaci o gostima još nisu konačno definirani jer će njihov puni model ovisiti i o:

- prijavama
- eVisitoru
- računima
- fiskalizaciji

Zato se trenutna schema gostiju ne smatra konačnom poslovnom specifikacijom.


## 16. Partner

Partner je poslovni subjekt preko kojeg može doći rezervacija.

Primjeri:

```text
Booking.com
Airbnb
druga turistička agencija
drugi poslovni partner
```

`partners` je namjerno odvojen od `agencies`.

Partner nije tenant.


## 17. Rezervacija

Rezervacija povezuje najmanje:

```text
gosta
+
smještajnu jedinicu
+
period
```

Može biti:

```text
nepotvrđena
potvrđena
stornirana
realizirana — izvedeno iz stay zapisa
```

Detalji:

```text
docs/modules/reservations.md
```


## 18. Prijava

`stay` predstavlja stvarni boravak.

Povezan je sa:

```text
smještajnom jedinicom
gostom
datumima boravka
rezervacijom — opcionalno
partnerom — opcionalno
```

Pojedinačne osobe u boravku vode se kroz:

```text
stays_stavke
```

Detalji:

```text
docs/modules/stays.md
```


## 19. Ponuda

Ponuda je povezana s rezervacijom i sadrži zasebne stavke.

Stavke ponude čuvaju snapshot relevantnih podataka kako kasnije promjene matičnih podataka ne bi nekontrolirano promijenile već izrađeni poslovni dokument.

Detalji:

```text
docs/modules/offers.md
```


## 20. Bankovni izvod i uplate

Uvoz bankovnog izvoda koristi staging tabelu:

```text
izvod_tmp
```

Korisnik povezuje stavke izvoda s rezervacijama, nakon čega se povezane stavke mogu proknjižiti u:

```text
payments
```

Detalji:

```text
docs/modules/payments.md
```


# Pretraga smještaja

## 21. Svrha pretrage

Djelatnik agencije mora pronaći odgovarajući raspoloživi smještaj prema zahtjevu gosta.


## 22. Kriteriji

Trenutni i planirani kriteriji uključuju podatke kao što su:

- grad
- period boravka
- kapacitet
- broj soba
- broj kreveta
- vrsta smještaja
- pojedini sadržaji
- udaljenosti
- prioritet

Konačan skup kriterija nije zaključen.


## 23. Dostupnost

Dostupnost nije samo svojstvo smještajne jedinice.

Ona ovisi o kombinaciji:

```text
smještajna jedinica
+
period
+
postojeće rezervacije
+
postojeće prijave
```

Detaljna logika nalazi se u:

```text
docs/modules/calendar.md
docs/modules/reservations.md
```


# Rezervacije i preklapanja

## 24. Nepotvrđene rezervacije

Za isti apartman i isti period može postojati više nepotvrđenih rezervacija.

To je normalno poslovno stanje.

Razlog je što više gostiju može istodobno iskazati interes prije konačne uplate i potvrde.


## 25. Potvrđena rezervacija

Potvrđena rezervacija blokira novu rezervaciju koja se s njom vremenski preklapa.


## 26. Prijava

Postojeća prijava također blokira novu rezervaciju koja se preklapa s boravkom.


## 27. Checkout i check-in istog datuma

Datum odlaska prethodnog gosta i datum dolaska sljedećeg gosta mogu biti isti kalendarski datum.

Primjer:

```text
Gost A:
01.07. – 07.07.

Gost B:
07.07. – 14.07.
```

To predstavlja:

```text
checkout gosta A
+
check-in gosta B
```

istog dana.

Ovo se ne tretira kao stvarni konflikt smještaja.


## 28. Točna tehnička pravila

Točna implementacijska pravila provjere dostupnosti pripadaju:

```text
docs/modules/calendar.md
docs/modules/reservations.md
```

Overview ne treba duplicirati detaljni algoritam.


# Datumi rezervacije

## 29. Početak rezervacije

Trenutna rezervacijska validacija zahtijeva da:

```text
dateFrom > danas
```

Walk-in stay može nastati i za današnji datum.


## 30. Datum završetka

Vrijedi:

```text
dateTo > dateFrom
```


## 31. Vrijedi do

Rezervacija ima:

```text
rezervationValid
```

odnosno datum do kojeg rezervacija vrijedi prije potvrde.

Default se temelji na:

```text
NEXT_PUBLIC_RESERVATION_VALID_DAYS
```

uz prilagodbu kada je datum dolaska blizu.


# Provizija agencije

## 32. Osnovni princip

Agencija naplaćuje iznajmljivaču proviziju za posredovanje.

Iznajmljivač trenutno ima:

```text
tipProvizije
iznos
```


## 33. Tip `P`

```text
P
```

predstavlja postotnu proviziju.

Kod ovog tipa `iznos` predstavlja postotak.

Trenutna validacija dopušta:

```text
0 < iznos <= 99.99
```


## 34. Tip `I`

```text
I
```

u trenutnoj implementaciji znači da se provizija određuje individualno u konkretnom poslovnom slučaju.

Kod iznajmljivača se tada sprema:

```text
iznos = 0
```

Zato `I` ne treba opisivati kao trajni fiksni iznos spremljen na iznajmljivaču.


## 35. Budući obračun

Konačni model obračuna provizije još nije implementiran.

Posebno treba definirati odnos između:

```text
cijene za gosta
landlordPrice
provizije
rezervacije
računa iznajmljivaču
```

To će biti definirano kada se razvije commission/invoicing workflow.


# Glavni poslovni proces

## 36. Puni ciljani workflow

Ciljani poslovni proces aplikacije je:

1. Gost šalje upit agenciji.
2. Djelatnik traži odgovarajući raspoloživi smještaj.
3. Kreira se rezervacija.
4. Za rezervaciju se izrađuje ponuda.
5. Gost ili partner vrši uplatu.
6. Bankovna uplata povezuje se s rezervacijom.
7. Rezervacija se potvrđuje.
8. Gostu se izdaje voucher.
9. Gost dolazi u smještaj.
10. Kreira se prijava / `stay`.
11. Podaci se prijavljuju u eVisitor.
12. Gost se odjavljuje iz smještaja.
13. Gostu se u ime iznajmljivača izdaje račun.
14. Račun se fiskalizira i/ili šalje kao eRačun gdje je primjenjivo.
15. Izračunava se provizija agencije.
16. Agencija izdaje račun iznajmljivaču za svoju proviziju.
17. Podaci ulaze u poslovne evidencije i izvještaje.


## 37. Workflow nije isto što i trenutno stanje implementacije

Prethodni popis predstavlja ciljani poslovni proces.

Ne znači da su svi koraci trenutno implementirani.

Stvarno stanje pojedinih dijelova vodi se u:

```text
docs/status-projekta.md
```


# Poslovni dokumenti

## 38. Ponuda

Ponuda nastaje u kontekstu rezervacije.

Sadrži header podatke i zasebne stavke.

Detalji:

```text
docs/modules/offers.md
```


## 39. Voucher

Voucher je planirani dokument koji se izdaje nakon potvrde rezervacije.

Njegova konačna struktura još nije definirana.


## 40. Račun gostu

Račun gostu izdaje se:

**u ime iznajmljivača**

To je odvojeni poslovni dokument od računa koji agencija izdaje iznajmljivaču.


## 41. Račun za proviziju

Agencija iznajmljivaču izdaje vlastiti račun za uslugu posredovanja odnosno proviziju.


## 42. Fiskalizacija i eRačun

Točna pravila ovisit će o:

- vrsti iznajmljivača
- poreznom statusu
- vrsti računa
- zakonskim pravilima koja vrijede u trenutku implementacije

Ta pravila ne definirati unaprijed u ovom dokumentu.


# Numeriranje dokumenata

## 43. Poslovni brojevi

Poslovni dokumenti koji zahtijevaju godišnje numeriranje trebaju koristiti broj koji je jedinstven unutar odgovarajuće:

```text
agencije
+
godine
+
vrste dokumenta
```

Konačna implementacija mora biti concurrency-safe.


## 44. Ne koristiti nezaštićeni `MAX + 1`

Kod buduće SaaS/produkcijske implementacije ne koristiti nezaštićeni obrazac:

```text
SELECT MAX(broj) + 1
```

bez odgovarajuće zaštite od paralelnog kreiranja dokumenata.

Detaljna database pravila nalaze se u:

```text
docs/database.md
```


# Deaktivacija i brisanje

## 45. Brisanje još nije konačno definirano

Konačna politika brisanja poslovnih podataka namjerno još nije donesena.

Prije odluke treba razumjeti sve veze između:

```text
iznajmljivača
smještajnih jedinica
cjenika
rezervacija
ponuda
uplata
prijava
računa
fiskalizacije
izvještaja
```


## 46. Mogući mehanizmi

Ovisno o vrsti entiteta, budući model može koristiti:

- fizički DELETE
- status
- deaktivaciju
- storno
- soft delete

Ne primjenjivati jedan model automatski na sve entitete.


## 47. Primjer smještajne jedinice

`accommodations` već ima:

```text
aktivan
```

pa postoji mogućnost povlačenja smještajne jedinice iz operativnog korištenja bez fizičkog brisanja.

To ne određuje automatski pravila za ostale entitete.


# Moduli

## 48. Dokumentirani glavni moduli

Trenutno postoje module dokumenti:

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


## 49. `calendar.md`

Opisuje:

- Gantt prikaz
- pretragu i filtriranje smještaja
- događaje
- vremenska preklapanja
- vezu rezervacija i prijava s kalendarom


## 50. `reservations.md`

Opisuje:

- rezervacije
- status rezervacije
- availability validaciju
- kreiranje i prikaz rezervacija
- vezu prema ponudi, uplati i stayu


## 51. `offers.md`

Opisuje:

- ponude
- stavke ponude
- izračune
- PDF
- trenutni line-item state pattern
- poznata ograničenja implementacije


## 52. `payments.md`

Opisuje:

- CAMT XML import
- staging tabelu `izvod_tmp`
- povezivanje s rezervacijama
- knjiženje u `payments`
- deduplikaciju
- trenutna ograničenja workflowa


## 53. `stays.md`

Opisuje trenutni model:

```text
stays
stays_stavke
```

i vezu prijave s rezervacijom, gostima i Kalendarom.

Modul je tek u ranoj fazi razvoja.


## 54. `landlords.md`

Opisuje:

- evidenciju iznajmljivača
- vrste iznajmljivača
- OIB
- proviziju
- eVisitor podatke
- povezanost sa smještajnim jedinicama
- tenant ograničenja


## 55. `accommodations.md`

Opisuje:

- smještajne jedinice
- kapacitet
- kategorizaciju
- sadržaje
- status
- vezu s iznajmljivačem
- cjenik
- Kalendar
- Rezervacije
- Prijave


# Pomoćne evidencije

## 56. Bez nepotrebnih module dokumenata

Za pomoćne entitete trenutno se ne izrađuju zasebni `.md` dokumenti samo zato što postoje njihove schema i query datoteke.

To se posebno odnosi na evidencije kao što su:

```text
guests
partners
cities
services
taxes
```

Njihova fizička struktura pripada Drizzle schemi i `database.md` dokumentu.

Zaseban modul dokument treba napraviti tek kada entitet dobije dovoljno vlastite poslovne logike da to opravdava.


# Granice dokumentacije

## 57. Uloga `project-overview.md`

Ovaj dokument opisuje:

- svrhu aplikacije
- ključne poslovne pojmove
- glavne entitete
- osnovni poslovni workflow
- najvažnija cross-module pravila


## 58. Što ne pripada ovom dokumentu

Ovdje ne treba detaljno dokumentirati:

- DB kolone
- Drizzle syntax
- pojedinačne queryje
- React komponente
- Server Actions
- Zod pravila pojedinih formi
- UI implementacijske detalje
- poznate bugove
- trenutni status svake funkcije

Za to postoje:

```text
docs/database.md
docs/development-rules.md
docs/ui-design-system.md
docs/status-projekta.md
docs/known-issues.md
docs/modules/*.md
```


# Pravilo za Claude Code

## 59. Prije rada na poslovnom modulu

Claude Code treba:

1. pročitati `CLAUDE.md`
2. pročitati ovaj dokument radi šireg poslovnog konteksta
3. pročitati odgovarajući `docs/modules/<module>.md`
4. po potrebi pročitati `database.md`
5. po potrebi pročitati `development-rules.md`
6. pregledati stvarni source prije izmjene
7. ne izmišljati business pravila koja dokumentacija ili source ne potvrđuju


## 60. Source vs dokumentacija

Ako postoji razlika između dokumentacije i stvarnog sourcea:

- ne pretpostavljati automatski da je source ispravan
- ne pretpostavljati automatski da je dokumentacija ispravna
- utvrditi radi li se o zastarjeloj dokumentaciji, bugu ili namjernoj promjeni
- ažurirati odgovarajući dokument nakon donesene odluke


## 61. Pravilo održavanja overviewa

`project-overview.md` treba ostati relativno stabilan.

Ažurirati ga kada se promijeni:

- poslovni model
- glavni workflow
- značenje ključnih entiteta
- važna cross-module pravila
- struktura glavnih modula

Sitne implementacijske promjene ne unositi ovdje.