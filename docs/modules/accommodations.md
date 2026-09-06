# accommodations.md — Evidencija smještajnih jedinica

## 1. Terminologija

U tehničkom sloju aplikacije koristi se naziv:

```text
accommodation
accommodations
accommodationId
```

U hrvatskom korisničkom sučelju često se koristi naziv:

```text
apartman
apartmani
```

Međutim, entitet nije ograničen samo na apartmane jer podržava više vrsta smještaja.

U projektnoj dokumentaciji zato se koristi opći naziv:

**smještajna jedinica**

Kada se opisuje postojeći UI, može se koristiti naziv **apartman**, jer ga trenutno koristi korisničko sučelje.


## 2. Svrha modula

`accommodations` predstavlja pojedinačnu smještajnu jedinicu koju iznajmljivač daje agenciji na posredovanje.

Smještajna jedinica povezuje:

```text
agenciju
↓
iznajmljivača
↓
smještajnu jedinicu
↓
cjenik
↓
rezervacije
↓
prijave / boravke
```

To je jedan od temeljnih poslovnih entiteta aplikacije jer Kalendar, Rezervacije i Prijave rade s konkretnom smještajnom jedinicom.


## 3. Status

**Status: Djelomično implementirano**

Trenutno postoji:

- database schema
- query sloj
- Server Actions
- Zod validacija
- unos nove smještajne jedinice
- izmjena postojeće smještajne jedinice
- prikaz smještajnih jedinica po iznajmljivaču
- osnovni podaci
- kapacitet
- kategorizacija
- sadržaji
- lokacija i udaljenosti
- aktivnosti
- status aktivan/neaktivan
- prioritet
- oznaka čišćenja od strane agencije
- povezani cjenik
- korištenje podataka u Kalendaru i Rezervacijama

Modul još nije konačno razrađen.

Posebno još nisu konačno definirani:

- svi podaci koje treba voditi o smještajnoj jedinici
- konačna pravila deaktivacije i brisanja
- tenant zaštita svih queryja
- konačna poslovna pravila kapaciteta
- obračun cijena
- odnos prema budućem obračunu provizije
- eventualne fotografije i drugi sadržaji objekta


## 4. Glavne datoteke

Trenutna implementacija koristi najmanje:

```text
src/lib/db/schema/accommodations.ts
src/lib/db/queries/accommodations.ts
src/lib/validations/accomodation.ts
src/lib/actions/landlords.ts
src/components/iznajmljivaci/ApartmanModal.tsx
```

Napomena: validation datoteka trenutno se zove:

```text
accomodation.ts
```

s jednim `m`, dok se ostatak tehničke terminologije uglavnom koristi kao:

```text
accommodation
accommodations
```

Ne preimenovati datoteku usput bez provjere svih importa.


## 5. Trenutna UI lokacija

Smještajne jedinice trenutno nemaju vlastitu glavnu dashboard evidenciju.

Njima se upravlja unutar evidencije iznajmljivača:

```text
/iznajmljivaci
```

To je trenutna UI organizacija, a ne ograničenje domenskog modela.


# Podatkovni model

## 6. Tabela `accommodations`

Glavna tabela:

```text
accommodations
```

sadrži skupine podataka:

```text
tenant i vlasništvo
osnovni podaci
vrsta smještaja
kategorizacija
kapacitet
status
opis
sadržaji
lokacija i udaljenosti
aktivnosti
katastarski podaci
timestamps
```


## 7. Tenant ownership

Svaka smještajna jedinica izravno pripada agenciji preko:

```text
agencyId
```

Veza:

```text
accommodations.agencyId
→ agencies.id
```

koristi:

```text
onDelete: restrict
```

Iako se tenant može zaključiti i preko iznajmljivača, `accommodations` ima vlastiti `agencyId`.

Budući SaaS mora osigurati da:

```text
accommodation.agencyId
=
landlord.agencyId
```

i da svi read/update/delete queryji budu tenant-scoped.


## 8. Veza s iznajmljivačem

Svaka smještajna jedinica mora pripadati jednom iznajmljivaču preko:

```text
landlordId
```

Veza:

```text
accommodations.landlordId
→ landlords.id
```

koristi:

```text
onDelete: restrict
```

Smještajna jedinica zato nema smisla bez iznajmljivača kojem pripada.


# Vrsta smještaja

## 9. Podržane vrste

Schema i Zod validation dopuštaju:

```text
apartman
soba
studio
vila
kuca
mobilna_kucica
```

Te vrijednosti pripadaju enum-u:

```text
vrsta_apartmana
```

Naziv enum-a je povijesno vezan uz apartmane, iako stvarni model podržava više vrsta smještaja.

Ne mijenjati tehnički naziv bez stvarne potrebe za refactorom.


# Osnovni podaci

## 10. Naziv

Obavezno polje:

```text
name
```

mora imati između:

```text
1 i 100 znakova
```

To je osnovni naziv koji se koristi u operativnom radu aplikacije.


## 11. Puni naziv

Opcionalno polje:

```text
fullName
```

može imati najviše:

```text
200 znakova
```

Trenutna implementacija još ne definira konačno poslovno pravilo kada se koristi `name`, a kada `fullName`.


## 12. Grad

Svaka smještajna jedinica mora imati:

```text
cityId
```

povezan s:

```text
cities.id
```

FK koristi:

```text
onDelete: restrict
```


## 13. Adresa

Adresa je obavezna i mora imati između:

```text
1 i 100 znakova
```

Smještajna jedinica ima vlastitu adresu, neovisno o adresi iznajmljivača.


## 14. Preuzimanje grada i adrese iznajmljivača

Kod kreiranja smještajne jedinice UI predviđa da se grad i adresa mogu početno preuzeti od iznajmljivača.

To je samo UX pomoć.

Smještajna jedinica mora imati vlastite:

```text
cityId
address
```

jer smještaj ne mora biti na adresi prebivališta ili sjedišta iznajmljivača.


## 15. Web adresa

Opcionalno:

```text
webUrl
```

može imati najviše:

```text
255 znakova
```

Ako je unesena, mora biti ispravan URL.

Konačna poslovna namjena tog podatka još nije posebno definirana.


# Kategorizacija

## 16. Broj zvjezdica

Obavezno polje:

```text
brojZvjezdica
```

mora biti cijeli broj:

```text
>= 1
<= 5
```

Trenutni UI za novu smještajnu jedinicu koristi početnu vrijednost:

```text
3
```


## 17. Kategorizacijski broj

Opcionalno:

```text
kategorizacijskiBroj
```

može imati najviše:

```text
50 znakova
```

Konačni format i poslovna uporaba još nisu posebno definirani.


# Kapacitet

## 18. Broj soba

Obavezni:

```text
brojSoba
```

mora biti cijeli broj:

```text
>= 1
```

Početna vrijednost nove smještajne jedinice:

```text
1
```


## 19. Broj kreveta

Obavezni:

```text
brojKreveta
```

mora biti cijeli broj:

```text
>= 1
```

Početna vrijednost:

```text
1
```


## 20. Pomoćni ležajevi

Opcionalni:

```text
brojPomocnihLezajeva
```

ako je zadan, mora biti cijeli broj:

```text
>= 0
```

Početna vrijednost u formi:

```text
0
```


## 21. Maksimalni broj osoba

Opcionalni:

```text
maxOsoba
```

ako je zadan, mora biti cijeli broj:

```text
>= 1
```

`maxOsoba` ima stvarno poslovno značenje jer se već koristi pri traženju odgovarajućeg smještaja.


## 22. Nema automatske formule kapaciteta

Trenutni validation layer ne provjerava odnose poput:

```text
maxOsoba
brojKreveta
brojPomocnihLezajeva
```

Zato trenutno nije definirano pravilo:

```text
maxOsoba =
brojKreveta + brojPomocnihLezajeva
```

niti druga automatska formula.

Takvo pravilo ne uvoditi bez poslovne odluke.


# Status

## 23. Aktivan

Smještajna jedinica ima:

```text
aktivan
```

s default vrijednošću:

```text
true
```

To omogućuje povlačenje jedinice iz operativnog rada bez fizičkog brisanja.


## 24. Utjecaj na Kalendar

Postojeći Kalendar dohvaća aktivne smještajne jedinice.

Zato:

```text
aktivan = false
```

već ima stvaran funkcionalni učinak.


## 25. Prioritet

Smještajna jedinica ima:

```text
prioritetan
```

s default vrijednošću:

```text
false
```

Prioritet postoji zasebno od:

```text
landlords.prioritetan
```

Model zato razlikuje:

```text
prioritetnog iznajmljivača
```

i:

```text
prioritetnu smještajnu jedinicu
```

Konačno pravilo kombiniranja ova dva podatka treba definirati tamo gdje se prioritet koristi.


## 26. Čišćenje od strane agencije

Polje:

```text
cistiAgencija
```

ima default:

```text
false
```

i označava obavlja li agencija čišćenje smještajne jedinice.

Zaseban workflow čišćenja još nije implementiran.


# Opis

## 27. Opis smještaja

Opcionalno polje:

```text
opis
```

je slobodan tekst.

Trenutna Zod schema ne postavlja maksimalnu duljinu.


# Sadržaji

## 28. Podržani sadržaji

Trenutno postoje boolean podaci:

```text
imaKlima
imaParking
imaWifi
imaRostilj
imaTerasu
pogledNaMore
kucniLjubimac
nepusaci
pristupacnoInvalidima
imaKuhinju
imaCajnuKuhinju
kupаonaTus
imaJacuzzi
imaBasen
imaSpa
imaFitness
imaRestoran
imaPunjacAuta
```

Svi početno imaju:

```text
false
```


## 29. Kupaonice

Opcionalni:

```text
brojKupaonica
```

ako je zadan, mora biti cijeli broj:

```text
>= 0
```

Postoji i boolean:

```text
kupаonaTus
```


## 30. Unicode problem u `kupаonaTus`

I Drizzle schema i Zod schema koriste TypeScript identifikator:

```text
kupаonaTus
```

U tom identifikatoru znak koji vizualno izgleda kao latinično `a` nije standardni ASCII/latinični znak `a`.

Database kolona je normalno definirana kao:

```text
kupaona_tus
```

Ovo je tehnička nedosljednost koja može uzrokovati probleme kod:

- pretraživanja sourcea
- ručnog upisivanja identifikatora
- refactora
- uspoređivanja naziva
- budućeg održavanja

Promjenu treba napraviti zasebnim kontroliranim refactorom nakon pronalaska svih referenci.


## 31. Kat

Opcionalni:

```text
kat
```

ako je zadan, mora biti cijeli broj:

```text
>= 0
<= 50
```


# Lokacija i udaljenosti

## 32. Udaljenosti

Schema sadrži opcionalne:

```text
udaljenostMore
udaljenostCentar
udaljenostTrgovina
```

Ako su zadani, moraju biti cijeli brojevi:

```text
>= 0
```

Trenutna schema i validation ne definiraju jedinicu mjere.

Zato dokument ne pretpostavlja jesu li vrijednosti izražene u metrima ili drugoj jedinici.


# Aktivnosti

## 33. Podržane aktivnosti

Trenutno postoje:

```text
aktivnostBicikliranje
aktivnostRonjenje
aktivnostPlaninarenje
```

Sve su boolean vrijednosti s defaultom:

```text
false
```

Njihova konačna uporaba u filtriranju ili prezentaciji smještaja još nije razrađena.


# Katastarski podaci

## 34. Katastarska općina

Opcionalni:

```text
katastarskaOpcina
```

može imati najviše:

```text
100 znakova
```


## 35. Katastarska čestica

Opcionalni:

```text
katastarskaCestica
```

može imati najviše:

```text
50 znakova
```

Za sada su to informativni podaci bez dodatnog workflowa.


# Validation schema

## 36. Zod validation

Forma koristi:

```text
src/lib/validations/accomodation.ts
```

i:

```text
accommodationSchema
```

Validation schema je glavni source of truth za podatke koje forma prihvaća prije spremanja.


## 37. Obavezna polja

Validation zahtijeva najmanje:

```text
name
vrstaApartmana
cityId
address
brojZvjezdica
brojSoba
brojKreveta
```

Ostala polja imaju vlastita opcionalna pravila ili default vrijednosti.


## 38. Boolean default vrijednosti

Schema definira:

```text
aktivan = true
prioritetan = false
cistiAgencija = false
```

Sadržaji i aktivnosti početno imaju:

```text
false
```


## 39. TypeScript tip forme

Tip forme izvodi se iz Zod sheme:

```text
AccommodationFormValues =
  z.infer<typeof accommodationSchema>
```

Time validation schema definira TypeScript oblik podataka forme.


# UI

## 40. `ApartmanModal`

Za unos i izmjenu koristi se:

```text
ApartmanModal
```

Smještajne jedinice se trenutno uređuju u kontekstu odabranog iznajmljivača.


## 41. Organizacija forme

Forma je podijeljena na četiri kartice:

```text
1. Osnovni podaci
2. Sadržaji
3. Lokacija i aktivnosti
4. Ostalo
```

Ovo je trenutna UI organizacija i nije nužno konačna struktura modula.


## 42. Default vrijednosti nove jedinice

Nova smještajna jedinica početno koristi:

```text
vrstaApartmana = apartman
brojZvjezdica = 3
brojSoba = 1
brojKreveta = 1
brojPomocnihLezajeva = 0

aktivan = true
prioritetan = false
cistiAgencija = false
```

Svi sadržaji i aktivnosti početno su isključeni.


## 43. Zod resolver workaround

`ApartmanModal` trenutno koristi obrazac:

```text
zodResolver(accommodationSchema) as any
```

To odgovara ranije zabilježenom workaroundu vezanom uz Zod v4 i React Hook Form tipove.

Ne uklanjati ga bez provjere stvarnog razloga zbog kojeg je uveden.


# Lista smještajnih jedinica

## 44. Dohvat po iznajmljivaču

Query:

```text
getAccommodationsByLandlord(landlordId)
```

trenutno vraća samo podatke potrebne postojećoj listi:

```text
id
name
brojSoba
brojKreveta
maxOsoba
vrstaApartmana
```

To nije puni accommodation DTO.


## 45. Sortiranje

Lista se iz queryja trenutno vraća sortirana prema:

```text
createdAt ASC
```


## 46. Prikaz

Postojeća tablica uz iznajmljivača prikazuje:

```text
Naziv
Br. soba
Br. kreveta
Maks. osoba
Tip smještaja
```

Odabir smještajne jedinice zatim služi i za prikaz povezanog cjenika.


# Kreiranje

## 47. Server Action

Za kreiranje se koristi:

```text
actionCreateAccommodation()
```

Action prima:

```text
landlordId
+
AccommodationFormValues
```

i dodaje:

```text
agencyId = AGENCY_ID
```

prije INSERT-a.


## 48. Query za kreiranje

Query:

```text
createAccommodation()
```

prima:

```text
typeof accommodations.$inferInsert
```

i nakon INSERT-a vraća kreirani zapis.


# Izmjena

## 49. Server Action

Za izmjenu se koristi:

```text
actionUpdateAccommodation()
```


## 50. Query za izmjenu

Query:

```text
updateAccommodation()
```

prima:

```text
Partial<typeof accommodations.$inferInsert>
```

i pri izmjeni eksplicitno postavlja:

```text
updatedAt = new Date()
```


# Dohvat pojedinačne jedinice

## 51. Query

Postoji:

```text
getAccommodationById(id)
```

koji vraća puni accommodation zapis ili:

```text
null
```

ako zapis ne postoji.


## 52. Server Action

Za UI dohvat postoji i:

```text
actionGetAccommodationById(id)
```


# Multi-tenant zaštita

## 53. Trenutni single-agency model

Aplikacija trenutno koristi:

```text
AGENCY_ID
```

i radi kao single-agency sustav.

To trenutno prikriva dio tenant problema u query sloju.


## 54. `getAccommodationsByLandlord()`

Trenutni query filtrira po:

```text
landlordId
```

ali ne i po:

```text
agencyId
```


## 55. `getAccommodationById()`

Trenutni query filtrira samo po:

```text
accommodations.id
```

bez tenant scopea.


## 56. `updateAccommodation()`

Update koristi samo:

```text
id
```

u WHERE uvjetu.

Nema provjere:

```text
agencyId
```


## 57. `deleteAccommodation()`

Delete također filtrira samo po:

```text
id
```

bez tenant scopea.


## 58. Zahtjev prije SaaS faze

Prije multi-tenant SaaS implementacije svi ID-based queryji moraju koristiti princip:

```text
accommodation.id = requestedId
AND
accommodation.agencyId = currentAgencyId
```

ili ekvivalentnu sigurnu tenant provjeru.

Pri kreiranju i izmjeni također treba provjeriti da povezani:

```text
landlordId
cityId
```

pripadaju dopuštenom tenant kontekstu.


# Veza s Kalendarom

## 59. Osnovni red Gantta

Smještajna jedinica je osnovni operativni red Gantt prikaza.

Hijerarhija:

```text
iznajmljivač
└── smještajna jedinica
    └── dani / događaji
```


## 60. Aktivne jedinice

Kalendar koristi aktivne smještajne jedinice.

Zato status:

```text
aktivan
```

ima neposredan utjecaj na prikaz i dostupnost.


## 61. Filtriranje

Podaci smještajne jedinice već se koriste pri traženju odgovarajućeg smještaja.

Relevantni kriteriji uključuju podatke poput:

- kapaciteta
- vrste smještaja
- sadržaja
- statusa aktivnosti
- prioriteta

Točna logika pripada:

```text
docs/modules/calendar.md
```


# Veza s Rezervacijama

## 62. Reservation FK

Svaka rezervacija povezana je s:

```text
accommodationId
```

Smještajna jedinica time određuje:

- gdje gost boravi
- kojem iznajmljivaču rezervacija pripada
- koji se apartman provjerava za dostupnost


## 63. Availability

Provjera dostupnosti temelji se na:

```text
accommodation
+
dateFrom
+
dateTo
```

Potvrđene rezervacije i postojeće prijave mogu blokirati novu rezervaciju za istu smještajnu jedinicu.

Detaljna pravila pripadaju:

```text
docs/modules/reservations.md
docs/modules/calendar.md
```


# Veza s Prijavama

## 64. Stay

Svaki:

```text
stay
```

ima obavezni:

```text
accommodationId
```

Smještajna jedinica zato povezuje stvarni boravak gosta s:

- iznajmljivačem
- kalendarom
- rezervacijom, ako postoji


# Cjenik

## 65. Veza s cjenikom

Cjenik je vezan izravno uz smještajnu jedinicu:

```text
pricelist.accommodationId
→ accommodations.id
```


## 66. Cijene nisu dio `accommodations`

Cijene nisu spremljene u:

```text
accommodations
```

nego u zasebnoj tabeli:

```text
pricelist
```

To omogućuje različite cijene po vremenskim periodima.


## 67. Trenutna polja cjenika

Svaki period trenutno koristi:

```text
dateFrom
dateTo
pricePerNight
landlordPrice
```

Detaljna poslovna logika cjenika još nije konačno definirana.


## 68. Cascade prema cjeniku

FK iz `pricelist` prema `accommodations` koristi:

```text
onDelete: cascade
```

Ako bi se smještajna jedinica fizički obrisala, povezani zapisi cjenika bili bi automatski obrisani.

To je database ponašanje, a ne potvrđena poslovna politika brisanja.


# Brisanje i deaktivacija

## 69. Delete query postoji

Query sloj sadrži:

```text
deleteAccommodation(id)
```

koji izvršava fizički DELETE.


## 70. Server Action postoji

Postoji i:

```text
actionDeleteAccommodation(id)
```

Međutim, u trenutnom UI-u brisanje smještajne jedinice nije dovršen korisnički workflow.


## 71. Postojanje delete funkcije nije poslovna odluka

Tehnička mogućnost fizičkog DELETE-a ne znači da se smještajne jedinice trebaju fizički brisati.

Posebno zato što već postoji:

```text
aktivan
```

kao prirodan mehanizam deaktivacije.


## 72. Konačna deletion politika

Prije omogućavanja fizičkog brisanja treba analizirati veze prema:

```text
pricelist
reservations
stays
offers preko reservations
budućim računima
izvještajima
```

Konačna odluka ostaje dio cross-module arhitekture brisanja.


# Trenutne tehničke napomene

## 73. Grad i adresa novog apartmana

`ApartmanModal` može primiti početne vrijednosti grada i adrese iznajmljivača.

U postojećem landlord workflowu postoji poznata nedosljednost pri prosljeđivanju tih podataka nakon kreiranja novog iznajmljivača.

To je problem UI/source povezivanja, a ne problema accommodation podatkovnog modela.


## 74. Naming debt — `accomodation.ts`

Validation datoteka koristi naziv:

```text
accomodation.ts
```

umjesto standardnog:

```text
accommodation.ts
```

To nije funkcionalni problem, ali predstavlja naming inconsistency.

Preimenovanje treba napraviti zasebno uz provjeru svih importa.


## 75. Unicode identifikator

```text
kupаonaTus
```

predstavlja stvarnu tehničku nedosljednost u sourceu.

Ovaj problem treba evidentirati u:

```text
docs/known-issues.md
```

i riješiti kontroliranim refactorom.


## 76. Error handling

Kod spremanja `ApartmanModal` trenutno prvenstveno koristi:

```text
console.error(...)
```

za server-side greške.

Kompletan korisnički error feedback još nije definiran.


# Otvorena poslovna pitanja

## 77. Konačni model smještajne jedinice

Prije potpune razrade modula treba odlučiti najmanje:

1. koji su svi podaci o smještajnoj jedinici stvarno potrebni
2. koja je konačna razlika između `name` i `fullName`
3. kakva su pravila kapaciteta
4. kako se povezuju `maxOsoba`, kreveti i pomoćni ležajevi
5. u kojoj jedinici se vode udaljenosti
6. kakva je konačna logika prioriteta
7. kako `cistiAgencija` utječe na poslovni workflow
8. trebaju li fotografije
9. trebaju li dodatni sadržaji i opisne karakteristike
10. trebaju li podaci za vanjske booking sustave
11. koja su konačna pravila kategorizacije
12. kako će raditi cjenik
13. kakav je odnos `pricePerNight` i `landlordPrice`
14. kako deaktivacija utječe na postojeće rezervacije
15. kada je fizičko brisanje dopušteno, ako uopće jest


# Granice modula

## 78. Ovaj dokument ne definira detaljno

- poslovne podatke iznajmljivača
- Gantt implementaciju
- availability algoritam
- reservation workflow
- stay workflow
- ponude
- automatski obračun cijene
- proviziju agencije
- račune
- fiskalizaciju
- eVisitor

Ta pravila pripadaju odgovarajućim modulima.


# Pravila za budući razvoj

## 79. Prije promjene accommodation modela

1. pregledati ovaj dokument
2. pregledati stvarnu Drizzle schemu
3. pregledati `accommodationSchema`
4. provjeriti utjecaj na Kalendar
5. provjeriti utjecaj na Rezervacije
6. provjeriti utjecaj na Prijave
7. provjeriti utjecaj na cjenik
8. tenant-scopeati nove queryje
9. ne uvoditi nova polja bez stvarnog use casea
10. ne uvoditi fizičko brisanje bez analize relacija
11. ažurirati dokument nakon značajne promjene implementacije


## 80. Pravilo dokumentiranja

`accommodations.md` treba opisivati:

```text
smještajnu jedinicu kao poslovni entitet
+
potvrđene podatke
+
potvrđene odnose prema drugim modulima
+
poznata ograničenja trenutne implementacije
```

Ne treba unaprijed pretvarati današnju shemu u konačnu specifikaciju budućeg SaaS proizvoda.