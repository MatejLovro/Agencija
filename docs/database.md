# database.md — Podatkovni model i pravila baze

## 1. Svrha dokumenta

Ovaj dokument opisuje:

- značenje glavnih tabela
- njihove međusobne odnose
- tenant ownership
- važne FK odnose
- poslovne invarijante vezane uz bazu
- snapshot principe
- pravila numeriranja
- poznate database arhitekturne rizike

Ovaj dokument **nije kopija Drizzle schema datoteka**.


## 2. Source of truth

Za stvarnu fizičku strukturu baze source of truth su:

```text
src/lib/db/schema/*.ts
```

Drizzle schema definira:

- stvarne kolone
- tipove podataka
- nullability
- default vrijednosti
- FK-ove
- indekse
- unique constraints
- `onDelete` ponašanje
- enum vrijednosti

Ako se ovaj dokument i stvarna Drizzle schema razlikuju, razliku treba analizirati i dokumentaciju ažurirati.

Ne pretpostavljati da dokument automatski ima prednost nad sourceom.


# Tenant model

## 3. Trenutni model

Aplikacija trenutno radi za jednu agenciju.

Tenant se privremeno određuje preko:

```text
AGENCY_ID
```

env varijable.


## 4. Budući model

Dugoročni cilj je multi-tenant SaaS za više turističkih agencija.

Zbog toga svi poslovni podaci moraju imati jednoznačno određenu tenant pripadnost.


## 5. Direktni tenant ownership

Glavni poslovni entiteti uglavnom imaju vlastiti:

```text
agencyId
```

odnosno:

```text
agency_id
```

Primjeri:

```text
landlords
accommodations
reservations
stays
offers
izvod_tmp
payments
```

Tenant ownership takvog zapisa određen je neposredno.


## 6. Naslijeđeni tenant ownership

Neke child tabele nemaju vlastiti `agency_id`.

Tenant pripadnost određuje se preko roditelja.

Primjeri:

```text
pricelist
→ accommodations
→ agencies
```

```text
stays_stavke
→ stays
→ agencies
```

```text
offers_stavke
→ offers
→ agencies
```

Takve tabele ne trebaju automatski dobiti redundantni `agency_id` samo radi uniformnosti.


## 7. Tenant-safe query pravilo

Kod entiteta s direktnim `agencyId`, ID-based query u SaaS modelu treba koristiti princip:

```text
id = requestedId
AND
agencyId = currentAgencyId
```

Ne oslanjati se samo na globalnu jedinstvenost UUID-a kao sigurnosni mehanizam.


## 8. Cross-tenant FK zaštita

Kod kreiranja ili izmjene zapisa nije dovoljno provjeriti samo glavni zapis.

Potrebno je osigurati da povezani FK entiteti pripadaju istom dopuštenom tenant kontekstu.

Primjer:

```text
accommodation.agencyId
=
landlord.agencyId
```

Isto vrijedi za veze poput:

```text
reservation → accommodation
stay → accommodation
offer → reservation
payment → reservation
```


## 9. Trenutni tenant debt

Dio postojećih queryja nastao je u single-agency fazi i još nije tenant-scoped.

To trenutno postoji posebno kod pojedinih queryja za:

```text
landlords
accommodations
pricelist
```

To nije konačni SaaS model.

Detaljni slučajevi vode se u odgovarajućim module dokumentima i `known-issues.md`.


# Opće database konvencije

## 10. Primary keys

Većina poslovnih tabela koristi:

```text
UUID
```

s:

```text
defaultRandom()
```

kao primary key.


## 11. Foreign keys

Za FK prema matičnim poslovnim entitetima preferira se:

```text
onDelete: "restrict"
```

kada child zapis ima samostalno poslovno značenje ili povijesnu važnost.


## 12. Cascade

`cascade` koristiti samo kada child zapis nema smisla bez roditelja.

Potvrđeni primjeri:

```text
offers_stavke
→ offer
```

```text
stays_stavke
→ stay
```

```text
pricelist
→ accommodation
```

Postojanje cascade FK-a ne znači automatski da poslovni UI treba omogućiti fizički DELETE roditelja.


## 13. `set null`

`set null` ima smisla kada child zapis treba preživjeti uklanjanje opcionalne veze.

Primjer u trenutnom modelu:

```text
payments.reservationId
```

ima nullable vezu prema rezervaciji.


## 14. Timestamps

Većina poslovnih tabela ima:

```text
createdAt
updatedAt
```

Ne pretpostavljati da se `updatedAt` automatski mijenja na razini PostgreSQL-a ako to nije eksplicitno definirano.

Dio queryja trenutno ga postavlja ručno.


## 15. Enumi

Domenski statusi i zatvoreni skupovi vrijednosti koriste Drizzle:

```text
pgEnum
```

Ne proširivati enum bez provjere utjecaja na:

- validation
- TypeScript tipove
- UI
- query logiku
- postojeće podatke


# Glavne tabele

## 16. `agencies`

`agencies` predstavlja tenant.

Trenutno se aktivna agencija bira preko:

```text
AGENCY_ID
```

U budućem SaaS modelu tenant mora proizlaziti iz autentificiranog korisnika/session konteksta, a ne iz globalne env varijable.


## 17. `cities`

`cities` je pomoćna evidencija gradova.

Koristi se iz više entiteta, uključujući:

```text
landlords
accommodations
partners
```

Postoji aplikacijski koncept:

```text
UNKNOWN_CITY_ID
```

koji se koristi kod pojedinih quick-create workflowa.

Ne tretirati ga kao generičko poslovno pravilo za sve forme.

### Jedinstvenost naziva

Naziv grada (`cities.name`) mora biti jedinstven **case-insensitive**, uz zanemarivanje vodećih/završnih razmaka.

Ovo je implementirano kao Postgres unique index preko izraza:

```sql
CREATE UNIQUE INDEX cities_name_lower_unique ON cities USING btree (lower(trim(name)));
```

(zamijenio je raniji jednostavan `UNIQUE(name)` constraint, koji je bio case-sensitive).

Aplikacijska (server action) provjera prije INSERT-a postoji radi boljeg UX-a (jasna poruka uz polje umjesto generičke DB greške), ali **konačna zaštita od race conditiona je DB unique index** — dva istovremena zahtjeva s istim nazivom (case-insensitive) uvijek rezultiraju točno jednim uspješnim insertom; drugi dobiva Postgres `23505` grešku koju server action hvata i pretvara u istu korisničku poruku.

Prikazani naziv grada ostaje onakav kakav je korisnik unio (uz standardnu capitalize-first normalizaciju na klijentu) — case-insensitive usporedba vrijedi samo za provjeru duplikata, ne mijenja spremljenu vrijednost.

Nije uvedena dodatna normalizacija (npr. `unaccent`, locale-specifična pravila) — samo `lower(trim(...))`.


# Iznajmljivači

## 18. `landlords`

`landlords` predstavlja iznajmljivače.

Svaki zapis ima direktni:

```text
agencyId
```

i pripada jednoj agenciji.


## 19. Vrste iznajmljivača

Enum:

```text
fizicka_osoba
fizicka_osoba_pdv
obrt
tvrtka
```


## 20. Osnovni podaci

Tabela trenutno sadrži između ostalog:

```text
surname
name
vrstaIznajmljivaca
oib
cityId
address
phone
email
iban
rjesenje
brUgovora
tipProvizije
iznos
datumRodjenja
eVisitName
eVisitPass
prioritetan
```


## 21. OIB indeks

Trenutna schema ima indeks:

```text
(agencyId, oib)
```

ali to je **obični index**, ne database `UNIQUE` constraint.

Zato baza trenutno sama ne sprečava dva iznajmljivača iste agencije s istim OIB-om.


## 22. OIB provjera u aplikaciji

Create/update workflow trenutno prije spremanja provjerava postoji li isti OIB unutar:

```text
agencyId
```

To pruža aplikacijsku zaštitu, ali ne uklanja race condition kod paralelnih zahtjeva.

Ako jedinstvenost OIB-a po agenciji ostane konačno poslovno pravilo, prije produkcijskog SaaS modela treba razmotriti database unique constraint:

```text
UNIQUE (agency_id, oib)
```

Ne uvoditi ga bez potvrde da je pravilo zaista konačno.


## 23. Provizija iznajmljivača

Enum:

```text
P
I
```

Trenutno značenje:

```text
P = postotna provizija
I = individualni obračun
```

Za `P`:

```text
iznos
```

sadrži postotak.

Za `I` trenutna validation schema zahtijeva:

```text
iznos = 0
```

Zato `I` ne predstavlja jedan landlord-level fiksni iznos provizije.


## 24. eVisitor credentials

Tabela trenutno sadrži:

```text
eVisitName
eVisitPass
```

`eVisitPass` se prema pregledanom sourceu sprema kao običan string.

Prije produkcije treba donijeti sigurnosnu odluku o:

- potrebi pohrane lozinke
- enkripciji
- pristupnim pravima
- prikazu u UI-u
- auditiranju pristupa

Hashiranje nije automatski prikladno ako aplikacija kasnije mora dohvatiti originalnu lozinku za integraciju.


## 25. Detaljna pravila

Detalji pripadaju:

```text
docs/modules/landlords.md
```


# Smještajne jedinice

## 26. `accommodations`

`accommodations` predstavlja smještajne jedinice.

Svaka jedinica ima direktni:

```text
agencyId
```

i obavezni:

```text
landlordId
```


## 27. Tenant invariant

Mora vrijediti:

```text
accommodation.agencyId
=
landlord.agencyId
```

Trenutni create/query sloj još ne provodi ovu provjeru svugdje eksplicitno.


## 28. Vrste smještaja

Podržani tipovi:

```text
apartman
soba
studio
vila
kuca
mobilna_kucica
```


## 29. Grupe podataka

Tabela sadrži podatke o:

- nazivu
- punom nazivu
- gradu i adresi
- vrsti smještaja
- kategorizaciji
- kapacitetu
- statusu aktivnosti
- prioritetu
- čišćenju od strane agencije
- opisu
- sadržajima
- kupaonicama
- katu
- udaljenostima
- aktivnostima
- katastarskim podacima


## 30. `aktivan`

Smještajna jedinica ima:

```text
aktivan
```

s default vrijednošću:

```text
true
```

Ovo je već aktivni poslovni mehanizam jer Kalendar koristi aktivne smještajne jedinice.


## 31. `maxOsoba`

`maxOsoba` je zasebno polje.

Trenutno nije definiran database invariant:

```text
maxOsoba =
brojKreveta + brojPomocnihLezajeva
```

Takvu formulu ne uvoditi bez poslovne odluke.


## 32. Tehnički naming problem

U trenutnom TypeScript sourceu postoji identifikator:

```text
kupаonaTus
```

s Unicode znakom koji vizualno izgleda kao latinično `a`.

Database kolona je:

```text
kupaona_tus
```

Problem pripada source naming debt-u, ne modelu podataka, i vodi se u `known-issues.md`.


## 33. Detaljna pravila

Detalji:

```text
docs/modules/accommodations.md
```


# Cjenik

## 34. `pricelist`

`pricelist` predstavlja vremenske periode cijena jedne smještajne jedinice.

Nema vlastiti:

```text
agencyId
```

nego tenant pripadnost nasljeđuje:

```text
pricelist
→ accommodation
→ agency
```


## 35. Glavna polja

Trenutni model sadrži:

```text
accommodationId
dateFrom
dateTo
pricePerNight
landlordPrice
```


## 36. `landlordPrice`

`landlordPrice` je nullable.

Ne tretirati ga automatski kao konačnu formulu:

```text
provizija = pricePerNight - landlordPrice
```

dok commission workflow nije definiran.


## 37. FK prema smještajnoj jedinici

Veza:

```text
pricelist.accommodationId
→ accommodations.id
```

koristi:

```text
onDelete: cascade
```

To je tehničko FK ponašanje, ne odluka da se accommodation smije fizički brisati.


## 38. Periodi cjenika

Trenutna schema opisuje:

```text
dateFrom
dateTo
```

ali konačna pravila preklapanja perioda nisu dovoljno definirana da bi se ovdje proglasila database invariantom.

Ne dokumentirati nepostojeći constraint kao da ga baza provodi.


# Gosti

## 39. `guests`

`guests` je matična evidencija osoba potrebnih posebno za:

```text
stays
stays_stavke
eVisitor
buduće račune
```

Model još nije konačna specifikacija jer će se razvijati zajedno sa stay/eVisitor/invoice workflowom.


## 40. Rezervacija vs guest tabela

Trenutne rezervacije koriste vlastita tekstualna polja gosta umjesto obaveznog FK-a prema `guests`.

To znači da:

```text
reservation guest
```

i:

```text
guests master record
```

trenutno nisu isti podatkovni koncept.


# Partneri

## 41. `partners`

`partners` predstavlja:

- booking kanale
- partnerske agencije
- druge poslovne partnere

Partner nije tenant.


## 42. Tenant ownership partnera

Ako tabela partnera ima direktni tenant ownership u stvarnoj schemi, svi queryji moraju ga poštovati.

Fizičke detalje uvijek provjeriti u stvarnoj `partners.ts` schemi prije izmjene.

Ovaj dokument ne zamjenjuje source.


# Rezervacije

## 43. `reservations`

Rezervacija pripada jednoj agenciji i jednoj smještajnoj jedinici.

Osnovne veze:

```text
agency
accommodation
partner — opcionalno
```


## 44. Gost rezervacije

Trenutno se ime i prezime gosta čuvaju kao snapshot/plain-text podaci rezervacije.

Rezervacija nije obavezno povezana s `guests` tabelom.


## 45. Status rezervacije

Database enum sadrži:

```text
nepotvrdjena
potvrdjena
```

Storno se vodi zasebnim boolean podatkom:

```text
stornirana
```


## 46. Realizirana rezervacija

`realizirana` nije zasebna database status vrijednost.

UI je izvodi iz postojanja povezanog:

```text
stay
```


## 47. Availability invariant

Na poslovnoj razini:

- više nepotvrđenih rezervacija može se međusobno preklapati
- potvrđena rezervacija blokira novu rezervaciju
- stay blokira novu rezervaciju

To se trenutno provodi aplikacijskom logikom, ne database exclusion constraintom.


## 48. Datumi

Rezervacija ima:

```text
dateFrom
dateTo
rezervationValid
```

Detaljna validation pravila pripadaju:

```text
docs/modules/reservations.md
```


## 49. Financijska polja rezervacije

Schema sadrži i određena financijska polja poput cijene/predujma.

Njihovu konačnu ulogu ne treba zaključivati iz same prisutnosti kolona.

Aktualna ponuda i payment workflow imaju vlastite podatkovne modele.


# Prijave / boravci

## 50. `stays`

`stays` predstavlja stvarni boravak.

Trenutna schema sadrži:

```text
id
agencyId
accommodationId
redniBroj
reservationId
guestId
dateFrom
dateTo
iznosSmjestaja
fakturirana
racunUimeIznajmljivaca
partnerId
status
remark
createdAt
updatedAt
```


## 51. Reservation veza

```text
reservationId
```

je nullable.

Zato podatkovni model podržava:

```text
stay iz rezervacije
```

i:

```text
walk-in stay bez rezervacije
```


## 52. Glavni gost

```text
guestId
```

na `stays` je obavezan.

Trenutno još nije konačno definirano mora li isti gost obavezno biti i među `stays_stavke`.


## 53. Status prijave

Enum:

```text
aktivna
odjavljena
```


## 54. `stays_stavke`

`stays_stavke` predstavlja pojedinačne osobe unutar boravka.

Sadrži:

```text
stayId
guestId
dateFrom
dateTo
dateEnter
dateOfResidPermit
category
remark
createdAt
updatedAt
```


## 55. FK stavke

```text
stayId
→ stays.id
```

koristi:

```text
onDelete: cascade
```

dok:

```text
guestId
→ guests.id
```

koristi:

```text
onDelete: restrict
```


## 56. Stay kategorije

Trenutni enum uključuje:

```text
turisti
djeca_do_12
mladi_12_18
osobe_invaliditet
ekskurzija
sezonski_radnici
bolesnici_u_ljecilistima
vikendasi_prijatelji
vlasnik
uza_obitelj
ostale_osobe
```

Ne mijenjati značenje kategorija bez provjere budućeg eVisitor workflowa.


## 57. Trenutni status implementacije

Schema postoji, ali puni stay/eVisitor workflow još nije implementiran.

Testni `stays` zapisi koji se koriste za Gantt nisu poslovna specifikacija.


## 58. Detalji

```text
docs/modules/stays.md
```


# Ponude

## 59. `offers`

Ponuda je poslovni dokument s direktnim tenant ownershipom:

```text
agencyId
```

Trenutni model uključuje podatke poput:

```text
broj
datum
reservationId
partnerId
vrijediDo
predujam
footer
poslana
```

Točan naziv i tip svake kolone provjeriti u aktualnoj Drizzle schemi prije izmjene.


## 60. Veza s rezervacijom

Ponuda se u trenutnom workflowu izrađuje u kontekstu rezervacije.

Database veza je nullable u trenutnoj schemi, pa sama baza ne nameće sve UI poslovne pretpostavke.


## 61. Partner na ponudi

Ponuda ima mogućnost vlastite veze prema partneru.

Kod čitanja liste trenutno postoje query detalji koji ne koriste nužno taj FK na isti način.

Takve razlike rješavati u module/query sloju, ne redefiniranjem sheme u ovom dokumentu.


## 62. `offers_stavke`

Stavke ponude pripadaju jednom offeru:

```text
offerId
```

i čuvaju snapshot podataka potrebnih za poslovni dokument.


## 63. Snapshot usluge

Stavka čuva tekst usluge:

```text
serviceText
```

odvojeno od matične evidencije usluga.

To je namjerno.

Promjena naziva usluge kasnije ne smije automatski promijeniti povijesnu ponudu.


## 64. Financijski podaci stavke

Aktualna schema stavke podržava podatke potrebne za:

- količinu
- jediničnu cijenu
- popust
- neto iznos
- porez
- bruto iznos

Fizičke nazive i tipove uvijek uzeti iz aktualne `offers` schema datoteke.


## 65. Snapshot princip poslovnih dokumenata

Za poslovne dokumente vrijedi opće pravilo:

**podaci koji moraju ostati povijesno nepromijenjeni trebaju biti spremljeni kao snapshot na dokumentu/stavci, a ne se uvijek čitati iz današnjeg matičnog zapisa.**

To će biti posebno važno za buduće:

```text
ponude
vouchere
račune gostu
račune iznajmljivaču
fiskalne dokumente
```


## 66. Detalji

```text
docs/modules/offers.md
```


# Usluge i porezi

## 67. `services`

`services` predstavlja matične vrste usluga koje se mogu koristiti na poslovnim dokumentima.

Trenutna implementacija uključuje i način obračuna usluge.

Matična usluga nije zamjena za snapshot podataka na već izrađenom dokumentu.


## 68. `taxes`

`taxes` predstavlja matične porezne stope/kategorije.

Budući fiskalizacijski i eRačun zahtjevi mogu proširiti model.

Ne dodavati unaprijed fiskalne kolone bez stvarnog zahtjeva.


# Uvoz bankovnog izvoda

## 69. `izvod_tmp`

`izvod_tmp` je staging tabela za trenutno učitani bankovni izvod.

Ima direktni:

```text
agencyId
```


## 70. Svrha staginga

Workflow:

```text
CAMT XML
↓
parse
↓
izvod_tmp
↓
ručno povezivanje s rezervacijom
↓
payments
```


## 71. Jedan aktivni staging set

Trenutni import workflow prije novog importa briše postojeće staging retke iste agencije.

Zato trenutni model praktično predstavlja:

**jedan aktivni staging skup po agenciji.**

Ne postoji zaseban import batch entitet.


## 72. Glavna staging polja

Trenutni podaci uključuju:

```text
agencyId
year
brojIzvoda
bankRef
datum
platitelj
pozivNaBroj
opisPlacanja
uplaceno
reservationId
```


## 73. Predznak iznosa

Parser trenutno sprema:

```text
CRDT → pozitivan iznos
DBIT → negativan iznos
```

Database schema sama ne zabranjuje negativan iznos.


## 74. Staging nema unique bank reference

`izvod_tmp` nema potvrđen unique constraint za:

```text
bankRef
```

Duplikati zato mogu postojati u stagingu.


# Trajne uplate

## 75. `payments`

`payments` predstavlja trajno proknjižene bankovne transakcije.

Ima direktni:

```text
agencyId
```


## 76. Glavna polja

Trenutna schema sadrži:

```text
id
agencyId
year
brojIzvoda
bankRef
datum
platitelj
pozivNaBroj
opisPlacanja
uplaceno
reservationId
createdAt
updatedAt
```


## 77. Veza s rezervacijom

```text
reservationId
```

je nullable.

To omogućuje da payment zapis može postojati i ako veza s rezervacijom kasnije nije dostupna.


## 78. Deduplikacija

`payments` ima unique constraint:

```text
(agencyId, bankRef)
```

To je osnovni idempotency mehanizam bankovnog importa.


## 79. `onConflictDoNothing`

Current posting koristi conflict handling tako da već postojeća:

```text
agencyId + bankRef
```

kombinacija ne proizvodi novi payment zapis.

Zato broj povezanih staging stavki i broj stvarno umetnutih payment zapisa mogu biti različiti.


## 80. Payment nema offer FK

Trenutna schema nema:

```text
offerId
```

na `payments`.

Uplata se povezuje s:

```text
reservationId
```

a ponuda se iz tog konteksta može tražiti zasebno.


## 81. Trenutna ograničenja modela

Schema trenutno nema zaseban:

```text
payment status
payment type
currency
bank account
import batch
reversal relation
expected amount
```

Ne dodavati ih samo zato što bi teoretski mogli biti korisni.

Dodati ih kada konkretni workflow to zahtijeva.


## 82. Detalji

```text
docs/modules/payments.md
```


# Relacije ključnog workflowa

## 83. Osnovna hijerarhija smještaja

```text
agencies
└── landlords
    └── accommodations
        └── pricelist
```


## 84. Rezervacijski workflow

```text
accommodations
└── reservations
    ├── offers
    │   └── offers_stavke
    ├── payments
    └── stays
        └── stays_stavke
```

Ovaj prikaz opisuje poslovne odnose.

Ne znači da je svaki FK obavezan niti da svaka relacija ima točno takav `onDelete`.


## 85. Matični podaci

Dodatni entiteti poput:

```text
guests
partners
cities
services
taxes
```

sudjeluju u više dijelova workflowa i nisu strogo child entiteti jedne grane.


# Poslovne invarijante

## 86. Tenant isolation

Najvažniji budući SaaS invariant:

```text
zapis jednog tenanta
ne smije biti pročitan, povezan ili izmijenjen
iz konteksta drugog tenanta
```


## 87. Rezervacija i accommodation

Mora vrijediti:

```text
reservation.agencyId
=
accommodation.agencyId
```


## 88. Stay i accommodation

Mora vrijediti:

```text
stay.agencyId
=
accommodation.agencyId
```


## 89. Stay i reservation

Ako `stay.reservationId` nije null, povezana rezervacija mora pripadati istom tenant kontekstu.

Aplikacija treba dodatno provjeriti poslovnu kompatibilnost accommodationa i datuma.


## 90. Offer i reservation

Ako je ponuda povezana s rezervacijom:

```text
offer.agencyId
=
reservation.agencyId
```


## 91. Payment i reservation

Ako:

```text
payment.reservationId
```

nije null, rezervacija mora pripadati istoj agenciji.


## 92. Child tenant ownership

Za child tabele bez `agencyId`, tenant se mora provjeriti kroz parent join kada je to potrebno za autorizaciju.


# Numeriranje poslovnih dokumenata

## 93. Poslovni broj nije isto što i primary key

UUID služi kao tehnički identifikator.

Poslovni broj služi korisniku i dokumentu.

To su dva odvojena koncepta.


## 94. Godišnje numeriranje

Za dokumente za koje poslovna ili zakonska pravila zahtijevaju godišnje numeriranje cilj je jedinstvenost prema:

```text
tenant
+
godina
+
vrsta dokumenta
+
broj
```


## 95. Concurrency

Generiranje broja mora biti concurrency-safe.

Ne koristiti nezaštićeni:

```sql
MAX(broj) + 1
```

u produkcijskom multi-user sustavu.


## 96. Trenutni `bigserial`

Postojanje `bigserial` kolone u trenutnoj razvojnoj fazi ne treba automatski smatrati konačnim modelom godišnjeg numeriranja.

Konačni numbering model treba riješiti prije produkcijske uporabe dokumenata koji ga zahtijevaju.


# Deletion strategija

## 97. Globalna odluka još nije donesena

Konačna deletion politika namjerno još nije zaključena.

Ne dodavati DELETE funkcionalnost samo radi “potpunog CRUD-a”.


## 98. Različiti entiteti mogu zahtijevati različita pravila

Mogući modeli:

```text
physical delete
deactivation
soft delete
status
storno
```

Ne postoji pravilo da svi entiteti moraju koristiti isti pristup.


## 99. Povijesni poslovni dokumenti

Ponude, uplate, prijave, računi i drugi poslovni dokumenti u pravilu će zahtijevati strožu povijesnu zaštitu od pomoćnih draft/child podataka.

Točna pravila definirati uz konkretni workflow i zakonske zahtjeve.


## 100. Postojeće delete funkcije

Činjenica da query/action sloj već sadrži pojedine fizičke delete funkcije, primjerice za:

```text
accommodations
pricelist
```

ne predstavlja konačnu poslovnu odluku.

UI ih trenutno ne mora koristiti.


# Migrations

## 101. Preferirani pristup

Promjene fizičke sheme treba u pravilu provoditi kroz Drizzle migrations.


## 102. Manual SQL

Ako se zbog razvoja izvrši ručna SQL izmjena direktno na Neon bazi, potrebno je uskladiti:

```text
stvarnu bazu
Drizzle schemu
migration state
```

Ne ostavljati dugotrajno stanje u kojem source schema i produkcijska baza opisuju različite modele.


## 103. Schema promjene

Prije promjene FK-a, unique constrainta ili nullabilityja provjeriti postojeće podatke.

Migracija koja je sintaktički ispravna može biti poslovno pogrešna.


# Snapshot pravilo

## 104. Matični podatak vs povijesni dokument

Matična tabela opisuje podatak **sada**.

Poslovni dokument mora često sačuvati podatak **kakav je bio u trenutku izdavanja**.


## 105. Kada koristiti snapshot

Snapshot je poželjan kada bi kasnija promjena matičnog podatka neprihvatljivo promijenila povijesni dokument.

Primjeri:

- naziv usluge
- cijena
- porezna stopa
- naziv kupca
- adresa
- OIB
- opis stavke


## 106. Ne pretjerivati sa snapshotovima

Snapshot ne treba automatski kopirati cijeli povezani entitet.

Spremiti samo podatke koji su potrebni za povijesnu točnost dokumenta.


# Granice dokumenta

## 107. Što pripada `database.md`

Ovdje pripadaju:

- značenje tabela
- relacije
- tenant ownership
- FK strategija
- važni constraints
- database invariants
- snapshot principi
- numeriranje
- deletion principi
- migration pravila


## 108. Što ne pripada `database.md`

Ovdje ne treba duplicirati:

- svaki Drizzle field
- Zod validation poruke
- UI strukturu forme
- detalje Server Actiona
- detaljne query implementacije
- status implementacije svakog modula
- bug listu

Za to postoje:

```text
src/lib/db/schema/
docs/modules/
docs/status-projekta.md
docs/known-issues.md
```


# Pravilo za Claude Code

## 109. Prije database promjene

Claude Code treba:

1. pregledati `docs/project-overview.md`
2. pregledati ovaj dokument
3. pregledati odgovarajući module dokument
4. otvoriti stvarnu Drizzle schemu
5. pronaći sve queryje i actione koji koriste promijenjeni entitet
6. provjeriti tenant ownership
7. provjeriti FK ponašanje
8. provjeriti postojeće podatke i migraciju
9. provjeriti utjecaj na snapshot poslovnih dokumenata
10. ažurirati dokumentaciju nakon značajne promjene


## 110. Ne pretpostavljati konačni model

Projekt je još u aktivnom razvoju.

Postojeća tabela ili kolona nije automatski konačna poslovna odluka.

Database model treba razvijati iz stvarnog workflowa, a ne unaprijed dizajnirati sve moguće buduće slučajeve.


## 111. Modul dokumenti

Detaljna poslovna pravila trenutno se nalaze u:

```text
docs/modules/calendar.md
docs/modules/reservations.md
docs/modules/offers.md
docs/modules/payments.md
docs/modules/stays.md
docs/modules/landlords.md
docs/modules/accommodations.md
```

Kod rada na određenom entitetu koristiti ovaj dokument zajedno s odgovarajućim module dokumentom i stvarnim sourceom.