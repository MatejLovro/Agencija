# stays.md — Prijave / boravak gosta

## 1. Svrha modula

Modul Prijave predstavlja stvarni boravak gosta u apartmanu.

U projektu se koristi pojam:

```text
stay / prijava
```

za evidentirani boravak gosta nakon dolaska.

Prijava može biti povezana s prethodnom rezervacijom, ali podatkovni model dopušta i prijavu bez rezervacije.

To omogućuje budući:

```text
walk-in gost
→ prijava bez prethodne rezervacije
```


## 2. Status

**Status: U razvoju**

Modul trenutno nije funkcionalno implementiran kao korisnički workflow.

Za sada postoje:

- database schema `stays`
- database schema `stays_stavke`
- veze prema rezervacijama, gostima, apartmanima, partnerima i agenciji
- status prijave
- kategorije osoba
- nekoliko ručno kreiranih testnih prijava u bazi
- korištenje tih testnih prijava u Gantt kalendaru

Trenutno ne postoji kompletan:

- ekran evidencije prijava
- forma nove prijave
- Server Action workflow
- query sloj za kompletno upravljanje prijavama
- validacijski sloj
- check-in workflow
- check-out workflow
- eVisitor workflow

Zato se ovaj dokument ne smije tretirati kao konačna poslovna specifikacija modula.


## 3. Glavne sheme

Trenutno postoje:

```text
src/lib/db/schema/stays.ts
```

s dvije tabele:

```text
stays
stays_stavke
```


## 4. Razlika između `stays` i `stays_stavke`

Model je zamišljen u dvije razine:

```text
stays
↓
glavna prijava / boravak

stays_stavke
↓
pojedinačne osobe unutar prijave
```

`stays` predstavlja jedan boravak u apartmanu.

`stays_stavke` omogućuje evidentiranje pojedinih osoba koje borave u sklopu te prijave.


## 5. `stays`

Glavna tabela trenutno sadrži:

- `id`
- `agencyId`
- `accommodationId`
- `redniBroj`
- `reservationId`
- `guestId`
- `dateFrom`
- `dateTo`
- `iznosSmjestaja`
- `fakturirana`
- `racunUimeIznajmljivaca`
- `partnerId`
- `status`
- `remark`
- `createdAt`
- `updatedAt`


## 6. Tenant ownership

Svaka prijava pripada agenciji preko:

```text
agencyId
```

Veza prema `agencies` koristi:

```text
onDelete: restrict
```

Budući multi-tenant SaaS mora sve queryje za prijave ograničavati na tenant autentificiranog korisnika.


## 7. Apartman

Svaka prijava mora imati:

```text
accommodationId
```

Veza prema apartmanu je obavezna.

To odgovara poslovnom značenju prijave:

```text
gost
+
konkretan apartman
+
period boravka
```


## 8. Veza s rezervacijom

Polje:

```text
reservationId
```

je nullable.

To znači da podatkovni model dopušta oba slučaja:

```text
rezervacija
↓
prijava
```

i:

```text
prijava bez rezervacije
```

Drugi slučaj omogućuje budući walk-in workflow.


## 9. Rezervacija nije obavezna

Ne uvoditi pravilo:

```text
svaka prijava mora imati reservationId
```

jer trenutna schema to namjerno ne zahtijeva.

Ako se poslovno pravilo kasnije promijeni, promjenu treba posebno definirati.


## 10. Glavni gost

`stays` ima obavezni:

```text
guestId
```

prema tabeli:

`guests`.

To znači da svaka glavna prijava mora imati povezanog gosta.


## 11. Razlika prema rezervacijama

Rezervacija trenutno čuva podatke gosta direktno:

- ime
- prezime
- email
- telefon

Prijava, za razliku od toga, koristi pravi FK:

```text
guestId → guests.id
```

To je važno jer modul prijava treba detaljnije osobne podatke gosta, osobito za budući eVisitor workflow.


## 12. Period boravka

Svaka prijava ima:

```text
dateFrom
dateTo
```

Oba podatka su obavezna.

Trenutna schema sama po sebi ne definira dodatna business pravila poput:

- `dateTo > dateFrom`
- smije li prijava početi danas
- smije li se evidentirati retroaktivno
- kako se tretira isti dan dolaska i odlaska

Ta pravila treba definirati kada se razvija forma prijave.


## 13. Prijava i Gantt

Postojeći Gantt koristi zapise iz `stays` kao jedan od dva glavna tipa događaja:

```text
reservations
stays
```

Prijava blokira dostupnost apartmana za relevantni period.


## 14. Prioritet prijave u kalendaru

U postojećem Gantt workflowu prijava ima jače poslovno značenje od nepotvrđene rezervacije.

Ako postoji prijava u periodu, novi reservation workflow je blokiran.

To odgovara činjenici da `stay` predstavlja stvarni evidentirani boravak gosta.


## 15. Prijava i dostupnost

Kod provjere mogućnosti rezerviranja postoji posebna provjera:

```text
checkPostojiPrijavaUPeriodu()
```

Ako se nova rezervacija preklapa s postojećom prijavom, rezervacija se ne dopušta.


## 16. Checkout / novi check-in

Projekt već koristi poslovno pravilo:

```text
odjava jednog gosta
=
dolazak drugog gosta isti datum
```

može biti dopušten.

Zbog toga buduća validacija prijava mora jasno razlikovati:

- stvarno preklapanje noćenja
- zajednički rubni datum checkout/check-in


## 17. Status prijave

Schema definira:

```text
stay_status
```

s vrijednostima:

```text
aktivna
odjavljena
```


## 18. Default status

Nova prijava prema trenutnoj shemi automatski dobiva:

```text
aktivna
```

ako status nije eksplicitno zadan.


## 19. Značenje statusa

Trenutni model sugerira:

```text
aktivna
→ boravak nije odjavljen

odjavljena
→ boravak je završen / odjavljen
```

Međutim, kompletan check-out workflow još nije implementiran.

Zato detaljna pravila promjene statusa još nisu konačno definirana.


## 20. Ne dodavati nepotrebne statuse

Dok se ne definira stvarni workflow, ne dodavati statuse poput:

- planirana
- potvrđena
- stornirana
- fakturirana

bez jasne poslovne potrebe.

Za neke od tih stanja već postoje druga polja ili drugi entiteti.


## 21. Redni broj prijave

`stays` koristi:

```text
redniBroj
```

trenutno kao:

```text
bigserial
```

Postojeći kalendar može prijavu prikazivati npr.:

```text
P699
```

gdje prefiks `P` služi kao vizualna razlika od rezervacije.


## 22. Konačna numeracija

Trenutni `bigserial` nije nužno konačni model numeracije za budući SaaS.

Prije produkcije treba odlučiti treba li redni broj prijave biti:

- po agenciji
- po godini
- globalan unutar tenanta
- samo interni tehnički broj

Ne mijenjati numeraciju bez zasebne odluke.


## 23. Iznos smještaja

Prijava ima opcionalno polje:

```text
iznosSmjestaja
```

tipa:

```text
numeric(10,2)
```

Trenutno nije dokumentirano kako se taj iznos izračunava niti iz kojeg modula se preuzima.

Mogući budući izvori mogu biti:

- ponuda
- cjenik
- rezervacija
- ručni unos

ali to trenutno nije definirano.


## 24. Fakturirana

Schema sadrži:

```text
fakturirana
```

boolean, default:

```text
false
```

To upućuje na buduću vezu prema procesu izdavanja računa.

Međutim, samo boolean polje još ne definira kompletan invoice workflow.


## 25. Račun u ime iznajmljivača

Postoji boolean:

```text
racunUimeIznajmljivaca
```

default:

```text
false
```

To je povezano s budućom funkcionalnošću izdavanja računa gostu u ime privatnog iznajmljivača.

Detaljna pravila ne pripadaju ovom dokumentu dok invoice modul ne bude definiran.


## 26. Partner

Prijava može imati:

```text
partnerId
```

Veza prema partneru je opcionalna.

To omogućuje slučajeve kada gost dolazi preko:

- partnerske agencije
- booking platforme
- drugog poslovnog kanala


## 27. Napomena

Prijava ima opcionalno:

```text
remark
```

za dodatne informacije koje nisu pokrivene strukturiranim poljima.


# `stays_stavke`

## 28. Svrha `stays_stavke`

`stays_stavke` predstavljaju pojedinačne osobe unutar jednog boravka.

Model omogućuje:

```text
stay
├── osoba 1
├── osoba 2
├── osoba 3
└── ...
```

Svaka osoba može imati vlastite podatke vezane uz period i kategoriju boravka.


## 29. Veza s glavnom prijavom

Svaka stavka ima:

```text
stayId
```

koji je obavezan.


## 30. Cascade delete stavki

Veza:

```text
stays_stavke.stayId
→ stays.id
```

koristi:

```text
onDelete: cascade
```

To znači da stavka nema samostalno poslovno značenje bez parent prijave.

Ovo ne znači da samu prijavu treba slobodno fizički brisati.


## 31. Gost stavke

Svaka stavka ima:

```text
guestId
```

obavezno povezan s tabelom:

`guests`.

Tako se svaka osoba boravka može povezati s punim podacima gosta.


## 32. Više osoba

Model omogućuje da jedna glavna prijava sadrži više gostiju.

Primjer:

```text
stay
├── glavni gost
├── supružnik
└── dijete
```


## 33. Odnos `stays.guestId` i stavki

`stays` već ima:

```text
guestId
```

a `stays_stavke` također imaju pojedinačne `guestId` vrijednosti.

Prije izrade UI-a treba definirati:

- mora li glavni gost iz `stays.guestId` obavezno imati i vlastitu stavku u `stays_stavke`
- ili `stays_stavke` sadrži samo dodatne osobe

To trenutno nije moguće pouzdano zaključiti samo iz sheme.


## 34. Datumi pojedinačne osobe

Svaka stavka ima vlastite:

```text
dateFrom
dateTo
```

To znači da pojedini gost može teoretski imati drukčiji period od glavnog stay zapisa.

Primjer:

```text
glavna prijava:
01.08. – 10.08.

gost A:
01.08. – 10.08.

gost B:
03.08. – 08.08.
```


## 35. Pravilo granica perioda

Budući validation layer treba definirati mora li vrijediti:

```text
stays.dateFrom
<=
stays_stavke.dateFrom
```

i:

```text
stays_stavke.dateTo
<=
stays.dateTo
```

Schema sama to ne osigurava.


## 36. `dateEnter`

Stavka ima opcionalno:

```text
dateEnter
```

Trenutna schema ne objašnjava dovoljno poslovnu semantiku tog polja.

Prije UI implementacije treba potvrditi njegovo značenje i izvor.


## 37. `dateOfResidPermit`

Stavka ima opcionalno:

```text
dateOfResidPermit
```

Naziv upućuje na datum vezan uz dozvolu boravka.

Konačno poslovno značenje i obaveznost treba definirati kada se implementiraju eVisitor podaci.


## 38. Kategorija osobe

Svaka stavka mora imati:

```text
category
```

iz enum-a:

`stay_category`.


## 39. Kategorije

Trenutno su definirane:

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


## 40. Poslovno značenje kategorija

Ove kategorije očito su namijenjene klasifikaciji osoba tijekom boravka.

Mogu imati utjecaj na:

- turističku pristojbu
- eVisitor
- izvještavanje
- eventualna oslobođenja

Međutim, takva pravila još nisu implementirana i ne treba ih unaprijed pretpostavljati.


## 41. Kategorija je obavezna

Za svaki `stays_stavke` zapis:

```text
category
```

je NOT NULL.

Buduća forma zato mora korisniku ili automatskoj logici omogućiti određivanje kategorije prije spremanja.


## 42. Gosti i eVisitor

Za razliku od reservation modula, prijava koristi `guests` tabelu.

To je važno jer se tamo mogu nalaziti podaci potrebni za buduće:

```text
eVisitor
```

workflowe.

Detaljni eVisitor mapping još nije dokumentiran.


## 43. Glavna prijava i eVisitor

Ne treba pretpostaviti da će jedan `stay` odgovarati jednom eVisitor zapisu.

S obzirom na `stays_stavke`, izglednije je da pojedine osobe mogu imati vlastite podatke potrebne za prijavu gosta.

Konačna integracija tek treba biti definirana.


## 44. Ručni testni podaci

Trenutni zapisi u `stays` nisu rezultat dovršenog UI workflowa.

Nekoliko prijava ručno je uneseno u bazu kako bi se mogao testirati:

```text
Kalendar / Gantt
```

To treba imati na umu pri analizi trenutnog stanja aplikacije.


## 45. Ručni zapisi nisu specifikacija

Vrijednosti i kombinacije podataka u postojećim testnim zapisima ne treba automatski tretirati kao potvrđena poslovna pravila.

Njihova primarna svrha bila je testiranje prikaza kalendara.


## 46. Trenutna uloga u aplikaciji

Trenutno je najvažnija funkcionalna uloga `stays` tabele:

```text
stays
↓
Kalendar
↓
prikaz zauzetosti
+
blokiranje nove rezervacije
```

Ostatak modula još treba izgraditi.


## 47. Rezervacija realizirana kroz stay

U postojećoj tablici rezervacija status:

`Realizirana`

nije spremljen u `reservations`.

Izvodi se iz činjenice da postoji:

```text
stay.reservationId = reservation.id
```

To je važna arhitekturna odluka.


## 48. Ne dodavati `realizirana` boolean na rezervaciju bez potrebe

Postojanje povezane prijave već daje informaciju da je rezervacija realizirana.

Ne duplicirati to stanje u `reservations` bez jasnog razloga.


## 49. Walk-in prijava

Budući da je:

```text
reservationId
```

nullable, schema podržava prijavu gosta koji nije imao rezervaciju.

Za takvu prijavu bit će potrebno zasebno definirati:

- izbor apartmana
- gosta
- period
- cijenu
- partnera
- eventualni račun
- availability provjeru


## 50. Availability kod walk-in prijave

Buduća forma walk-in prijave mora prije spremanja provjeriti zauzetost apartmana.

Ne smije se oslanjati samo na Gantt prikaz.

Server-side provjera ostaje authority.


## 51. Prijava iz rezervacije

Budući workflow prijave iz rezervacije vjerojatno će moći preuzeti podatke kao što su:

- apartman
- period
- partner
- gost

ali to još nije implementirano.

Ne definirati detaljni mapping dok source za taj workflow ne postoji.


## 52. Potvrda rezervacije i prijava

U cjelokupnom poslovnom toku predviđen je redoslijed:

```text
uplata
↓
potvrda rezervacije
↓
voucher
↓
dolazak gosta
↓
prijava
```

Ali tehnička povezanost tih koraka još nije implementirana.


## 53. Status rezervacije nakon prijave

Trenutno se realiziranost rezervacije izvodi iz povezanog `stay`.

Nije potrebno automatski dodavati novi reservation status samo zbog check-ina.


## 54. Odjava

Schema podržava:

```text
status = odjavljena
```

ali workflow odjave još nije implementiran.

Prije implementacije treba definirati:

- kada se prijava smatra odjavljenom
- mijenja li se `dateTo`
- mogu li se osobe odjaviti različitim datumima
- kako to utječe na `stays_stavke`
- utječe li odjava na Gantt
- može li se odjava poništiti


## 55. Fakturiranje

`stays` već sadrži podatke povezane s budućim fakturiranjem:

```text
iznosSmjestaja
fakturirana
racunUimeIznajmljivaca
```

To pokazuje da će stay biti važan izvor za budući invoice workflow.

Detaljna logika pripada budućem modulu računa.


## 56. Brisanje prijava

Fizičko brisanje nije definirano kao standardni workflow.

Ne implementirati Delete samo zato što CRUD još nije kompletan.

Prijava može kasnije biti povezana s:

- gostima
- eVisitorom
- računom
- rezervacijom
- izvještajima
- drugim zakonskim evidencijama


## 57. `stays_stavke` i cascade ne definiraju deletion policy

Iako se stavke automatski brišu kada se parent `stay` fizički izbriše, to je samo FK ponašanje.

Ne znači da aplikacija treba dopuštati fizičko brisanje prijave.


## 58. Cross-module odluka o brisanju

Konačna odluka mora se donijeti zajedno s ostalim poslovnim modulima:

- rezervacije
- ponude
- payments
- stays
- računi

Moguće opcije su:

- status
- storno
- soft delete
- ograničeno fizičko brisanje
- audit zapis

ovisno o poslovnim i zakonskim zahtjevima.


## 59. Multi-tenant zaštita

Budući queryji moraju provjeravati da pripadaju istom tenant kontekstu:

```text
stay
├── agency
├── accommodation
├── reservation
├── guest
└── partner
```

Nije dovoljno samo primiti njihove UUID vrijednosti s clienta.


## 60. Cross-tenant reservation zaštita

Ako `reservationId` postoji, server mora provjeriti da rezervacija:

- pripada istoj agenciji
- odnosi se na odgovarajući apartman
- može poslovno prijeći u prijavu


## 61. Cross-tenant guest zaštita

`guestId` također mora pripadati dostupnom tenant kontekstu ili odgovarajućem budućem modelu vlasništva podataka.

To pravilo treba precizirati kad se razvije guests modul.


## 62. Cross-tenant partner zaštita

Ako postoji `partnerId`, server mora provjeriti da partner pripada istoj agenciji.


## 63. Database odgovornosti

Database schema trenutno dobro definira:

- osnovne entitete
- FK veze
- obaveznost podataka
- enum statuse
- enum kategorije
- cascade samo za child stavke

Business validacija mora ostati u aplikacijskom sloju.


## 64. Što još ne postoji

Trenutno nije potvrđena implementacija:

- `getStays()`
- `createStay()`
- `updateStay()`
- `actionCreateStay()`
- `actionCheckoutStay()`
- stay validation schema
- UI liste prijava
- forme prijave
- upravljanja `stays_stavke`
- eVisitor eksport/integracija
- automatsko kreiranje gosta
- invoice workflow


## 65. Ne dokumentirati budući UI unaprijed

Dok se modul ne počne stvarno razvijati, ne definirati unaprijed:

- toolbar
- tabove
- modale
- layout
- broj koraka forme
- obavezna UI polja
- boje statusa

To treba definirati kad postoji stvaran use case i source.


## 66. Poznate otvorene poslovne odluke

Prije implementacije modula treba razriješiti najmanje:

1. kako nastaje prijava iz rezervacije
2. kako nastaje walk-in prijava
3. mora li glavni gost biti i u `stays_stavke`
4. kako se dodaju dodatni gosti
5. kako se definiraju kategorije osoba
6. kako se određuje period pojedinog gosta
7. što točno znači `dateEnter`
8. što točno znači `dateOfResidPermit`
9. kada se status mijenja u `odjavljena`
10. kako prijava komunicira s eVisitorom
11. kako se određuje `iznosSmjestaja`
12. kada se postavlja `fakturirana`
13. kako funkcionira račun u ime iznajmljivača
14. kako se tretira storno/pogrešna prijava
15. kakva je konačna numeracija prijava


## 67. Veze s ostalim modulima

Prijave su izravno povezane s:

```text
docs/modules/calendar.md
docs/modules/reservations.md
```

te budućim modulima:

```text
guests
eVisitor
guest invoices
fiscalization
reports
```


## 68. Granice modula

Ovaj dokument trenutno ne definira:

- kreiranje rezervacije
- payment workflow
- izradu ponude
- voucher
- detalje podataka gosta
- eVisitor tehničku integraciju
- izdavanje računa
- fiskalizaciju
- proviziju agencije

Ta pravila pripadaju odgovarajućim modulima.


## 69. Pravilo za budući razvoj

Kada stvarni razvoj modula Prijave započne:

1. ponovno pregledati `stays.ts`
2. provjeriti je li schema i dalje aktualna
3. definirati stvarni poslovni workflow prije izrade UI-a
4. posebno definirati prijavu iz rezervacije i walk-in prijavu
5. definirati odnos `stays.guestId` i `stays_stavke`
6. definirati eVisitor podatke
7. uvesti server-side availability provjeru
8. tenant-scopeati sve queryje
9. ne uvoditi fizičko brisanje bez zajedničke odluke
10. tek tada proširiti ovaj dokument detaljima implementacije


## 70. Pravilo za ažuriranje dokumenta

Ovaj `stays.md` trenutno opisuje prvenstveno:

```text
postojeću shemu
+
poznatu ulogu stay zapisa u kalendaru
+
potvrđeni projektni workflow
```

Kada se implementiraju queryji, actions, validations i UI, dokument treba ažurirati prema stvarnom sourceu, jednako kao što je učinjeno za:

- kalendar
- rezervacije
- ponude
- payments