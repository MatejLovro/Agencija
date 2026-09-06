# reservations.md — Rezervacije

## 1. Svrha modula

Modul Rezervacije upravlja rezervacijama smještaja od trenutka kada gost odabere apartman i termin do kasnijih poslovnih koraka kao što su:

- izrada ponude
- evidentiranje uplate
- potvrda rezervacije
- izrada vouchera
- izrada prijave / stay-a
- storno rezervacije

Rezervacija je jedna od središnjih poslovnih entiteta aplikacije i povezuje:

- agenciju
- apartman
- iznajmljivača
- gosta
- partnera
- ponude
- buduće uplate
- stay / prijavu

## 2. Status

**Status: Djelomično implementirano**

Trenutno postoji:

- kreiranje rezervacije
- validacija unosa
- provjera raspoloživosti
- pregled rezervacija u tablici
- prikaz statusa rezervacije
- označavanje realizirane rezervacije na temelju stay-a
- pokretanje izrade ponude iz rezervacije
- dohvat rezervacija za povezivanje s bankovnim uplatama

Još nisu dovršeni svi poslovni workflowi i akcije modula.

## 3. Glavne datoteke

Trenutna implementacija koristi najmanje:

```text
src/app/(dashboard)/rezervacije/
├── page.tsx
└── RezervacijeClient.tsx

src/lib/actions/
└── reservations.ts

src/lib/db/queries/
└── reservations.ts

src/lib/validations/
└── reservation.ts
```

Rezervacije trenutno nemaju zaseban `src/types/` modul.

Potrebni TypeScript tipovi definirani su neposredno uz query ili validation kod.

## 4. Mjesto rezervacije u poslovnom procesu

Rezervacija je početni poslovni dokument nakon pronalaska odgovarajućeg smještaja.

Osnovni workflow:

```text
Upit gosta
↓
Pretraga raspoloživog smještaja
↓
Rezervacija
↓
Ponuda
↓
Uplata
↓
Potvrda rezervacije
↓
Voucher
↓
Prijava / stay
```

Kasniji proces nastavlja se kroz:

```text
eVisitor
↓
Odjava gosta
↓
Račun gostu
↓
Fiskalizacija / eRačun gdje je primjenjivo
↓
Obračun provizije
↓
Račun iznajmljivaču
```

## 5. Kreiranje rezervacije

Nova rezervacija trenutno se najčešće pokreće iz modula Kalendar.

Kalendar već zna:

- apartman
- datum početka
- datum završetka

Forma rezervacije zatim dohvaća dodatne podatke potrebne za unos.

Server Action:

`actionCreateReservation()`

odgovoran je za:

1. server-side Zod validaciju
2. pretvaranje hrvatskih datuma u ISO format
3. ponovnu provjeru raspoloživosti
4. spremanje rezervacije
5. revalidaciju kalendara

## 6. Podaci rezervacije

Trenutna forma koristi najmanje sljedeće podatke:

### Smještaj

- `accommodationId`
- `landlordId`

### Gost

- prezime
- ime
- email
- telefon

### Broj osoba

- odrasli
- osobe mlađe od 18 godina
- djeca

### Period

- datum od
- datum do

### Vrijedi do

Rezervacija ima poseban datum:

`rezervationValid`

koji predstavlja datum do kojeg rezervacija vrijedi.

### Ostalo

- napomena
- partner

## 7. Gost nije obavezno zaseban zapis u guests tabeli

Trenutna rezervacija izravno sprema podatke gosta:

- `guestName`
- `guestSurname`
- `email`
- `phone`

To znači da kreiranje rezervacije trenutno ne zahtijeva obaveznu vezu s postojećim zapisom iz `guests`.

Takvo ponašanje ne treba mijenjati bez zasebne poslovne odluke.

## 8. Iznajmljivač

Forma koristi `landlordId` radi prikaza i validacije konteksta apartmana.

Sam zapis rezervacije primarno je vezan uz apartman.

Iznajmljivač se kod prikaza rezervacije dohvaća relacijom:

```text
reservation
↓
accommodation
↓
landlord
```

Ne treba duplicirati `landlordId` u rezervaciji ako za to ne postoji poslovna potreba.

## 9. Tenant ownership

Svaka rezervacija pripada agenciji.

Kod trenutnog single-agency sustava agency ID dobiva se iz:

```text
process.env.AGENCY_ID
```

Kod kreiranja rezervacije sprema se:

`agencyId`

Budući SaaS sustav mora tenant određivati iz runtime korisničkog konteksta, a ne iz globalne environment varijable.

## 10. Početni status nove rezervacije

Kod kreiranja rezervacije status se trenutno ne šalje eksplicitno.

Database schema koristi default:

`nepotvrdjena`

Zato svaka nova rezervacija počinje kao:

**nepotvrđena rezervacija**

To odgovara poslovnom procesu:

```text
Rezervacija
↓
Ponuda
↓
Uplata / druga potvrda
↓
Potvrđena rezervacija
```

## 11. Status rezervacije

Trenutni osnovni database status razlikuje:

- `nepotvrdjena`
- `potvrdjena`

Uz to postoji zasebno polje:

`stornirana`

Zato storno nije treća vrijednost osnovnog status enum-a.

## 12. Poslovni prikaz statusa

UI trenutno prikazuje sljedeća stanja:

### Aktivna

Rezervacija je:

- nepotvrđena
- nije stornirana
- nema stay

### Potvrđena

`status === "potvrdjena"`

i rezervacija nije stornirana niti realizirana.

### Realizirana

Rezervacija se smatra realiziranom kada postoji povezani `stay` zapis.

Trenutno se to izvodi kroz:

```text
stay.reservationId = reservation.id
```

### Stornirana

Ako:

`stornirana === true`

rezervacija se prikazuje kao stornirana.

## 13. Prioritet prikaza statusa

Trenutni UI status određuje ovim redoslijedom:

```text
stornirana
↓
realizirana
↓
potvrđena
↓
aktivna
```

Zato stornirana rezervacija ima vizualni prioritet nad ostalim stanjima.

Realizirana rezervacija ima prioritet nad običnim prikazom potvrđene rezervacije.

## 14. Realizirana rezervacija nije zaseban database status

Trenutno `realizirana` nije zasebno spremljeno polje rezervacije.

Izvodi se iz postojanja povezanog zapisa u tabeli `stays`.

To je važno arhitekturno pravilo.

Ne dodavati automatski:

```text
reservation.realizirana = true
```

ako se realiziranost već može pouzdano izvesti iz poslovnog događaja — stay-a.

Takva denormalizacija zahtijevala bi zasebno opravdanje.

## 15. Stornirana rezervacija

Schema već sadrži:

`stornirana`

ali workflow storna još nije implementiran u dostavljenom kodu.

Toolbar trenutno ima akciju:

`Storno`

bez pripadajuće implementacije.

Prije implementacije treba definirati:

- kada je storno dopušten
- smije li se stornirati potvrđena rezervacija
- smije li se stornirati realizirana rezervacija
- što se događa s ponudama
- što se događa s primljenim uplatama
- treba li čuvati razlog storna
- treba li čuvati datum i korisnika koji je izvršio storno
- kako storno utječe na dostupnost apartmana

## 16. Fizičko brisanje rezervacije

Toolbar trenutno sadrži akciju:

`Brisanje`

ali brisanje nije implementirano.

To je namjerno.

Ne implementirati fizičko brisanje rezervacija dok se na razini cijelog projekta ne definiraju pravila za:

- fizičko brisanje
- soft delete
- storno
- audit trail
- povezane dokumente
- zakonsko čuvanje podataka

Ovo nije bug.

To je svjesno odgođena arhitekturna odluka.

## 17. Validacija forme

Rezervacija koristi:

`reservationSchema`

iz:

`src/lib/validations/reservation.ts`

Validacija se izvršava i na serveru.

Client-side validacija služi za UX, ali nije authority za integritet podataka.

## 18. Obavezni podaci

Trenutno su obavezni:

- apartman
- iznajmljivač
- prezime gosta
- ime gosta
- email
- najmanje jedna odrasla osoba
- datum od
- datum do
- datum "Vrijedi do"

## 19. Email

Email je obavezan.

Provjerava se osnovni format:

```text
tekst@domena.tld
```

Trenutna validacija koristi projektni regex, a ne poslovno specifičnu email verifikaciju.

To znači da se provjerava sintaksa, ne stvarno postojanje adrese.

## 20. Telefon

Telefon je opcionalan.

Prazan string se prije spremanja pretvara u:

`null`

## 21. Broj osoba

Trenutna pravila su:

### Odrasli

```text
adults >= 1
```

Rezervacija mora imati najmanje jednu odraslu osobu.

### Mlađi od 18

```text
teens18 >= 0
```

### Djeca

```text
children >= 0
```

Sve vrijednosti moraju biti cijeli brojevi.

## 22. Format datuma

Korisnički unos koristi hrvatski format:

`dd.mm.gggg.`

Validacija prihvaća i završnu točku kao opcionalnu tijekom parsiranja.

Prije spremanja datum se pretvara u ISO:

`yyyy-mm-dd`

## 23. Datum početka rezervacije

Trenutna validacija zahtijeva:

```text
dateFrom > danas
```

Datum početka mora biti strogo veći od današnjeg datuma.

Prema trenutnom kodu nije moguće kreirati novu rezervaciju koja počinje danas.

## 24. Datum završetka

Vrijedi:

```text
dateTo > dateFrom
```

Datum završetka mora biti strogo nakon datuma početka.

Rezervacija ne može imati isti `dateFrom` i `dateTo`.

## 25. Datum "Vrijedi do"

Vrijedi:

```text
rezervationValid < dateFrom
```

Datum do kojeg rezervacija vrijedi mora biti prije početka boravka.

Trenutna validacija ne zahtijeva eksplicitno da `rezervationValid` bude današnji ili budući datum.

Ako to poslovno pravilo bude potrebno, mora se zasebno definirati.

## 26. Provjera raspoloživosti

Validan unos forme nije dovoljan za kreiranje rezervacije.

Neposredno prije spremanja izvršava se:

`actionProvjeriMoguceRezerviranje()`

Provjera se ponavlja server-side jer je od trenutka otvaranja forme stanje apartmana moglo biti promijenjeno.

## 27. Race condition

Primjer:

```text
Korisnik A otvara slobodan period
↓
Korisnik B u međuvremenu potvrdi rezervaciju
↓
Korisnik A završi unos forme
↓
server ponovno provjerava period
↓
rezervacija se ne sprema ako period više nije dopušten
```

Ovo pravilo je posebno važno za budući multi-user SaaS.

## 28. Što blokira novu rezervaciju

Prema postojećem calendar/business pravilu, novu rezervaciju blokira:

- postojeći stay
- potvrđena rezervacija

Nepotvrđena rezervacija sama po sebi ne blokira kreiranje druge rezervacije.

## 29. Više nepotvrđenih rezervacija

Za isti apartman i preklapajući period smije postojati više nepotvrđenih rezervacija.

To je namjerno poslovno ponašanje.

Razlog je što više potencijalnih gostiju može istovremeno biti u procesu ponude/odluke.

Konflikt nastaje tek kada poslovno jači događaj blokira smještaj, primjerice potvrđena rezervacija ili stay.

## 30. Potvrđivanje rezervacije

Toolbar predviđa akciju:

`Potvrda prijave`

ali u dostavljenom sourceu nema implementacije te akcije.

Terminološki naziv te akcije treba prije dovršetka provjeriti.

Ako je svrha potvrditi rezervaciju, UI naziv bi trebao jasno odgovarati poslovnoj radnji.

Prije implementacije treba definirati:

- što uzrokuje potvrdu
- je li uplata predujma uvjet
- može li korisnik potvrditi ručno
- što ako postoji druga nepotvrđena rezervacija za isti period
- mora li se prije promjene statusa ponovno provjeriti raspoloživost
- što se događa s konkurentskim rezervacijama

## 31. Kritična provjera kod potvrđivanja

Buduća akcija potvrđivanja ne smije samo napraviti:

```text
status = potvrdjena
```

Prije potvrde mora se ponovno provjeriti postoje li:

- drugi potvrđeni konflikti
- stay
- druge poslovne prepreke

jer se stanje moglo promijeniti nakon kreiranja rezervacije.

## 32. Izrada ponude

Toolbar sadrži funkcionalnu akciju:

`Izrada ponude`

Za odabranu rezervaciju otvara se:

```text
/ponude/nova?rezervacijaId=<reservationId>
```

Ako je rezervacija već potvrđena, trenutni UI blokira akciju i prikazuje poruku:

`Izabrana rezervacija je već potvrđena.`

## 33. Ograničenje izrade ponude za potvrđenu rezervaciju

Trenutno je provjera:

```text
selectedRow.status === "potvrdjena"
```

implementirana samo u client toolbaru.

Ako ovo treba biti trajno poslovno pravilo, mora biti zaštićeno i server-side.

UI kontrola sama nije dovoljna za poslovni integritet.

## 34. Ponude i rezervacija

Jedna rezervacija može imati povezane ponude.

To potvrđuje i query koji rezervacije koristi u modulu bankovnih izvoda.

Za bankovne uplate dohvaćaju se samo rezervacije koje imaju najmanje jednu ponudu.

Poslovna logika:

```text
Rezervacija bez ponude
→ nema poslane upute za uplatu
→ nije relevantna za povezivanje bankovne uplate
```

## 35. Predujam

Za combobox bankovnih uplata koristi se predujam iz najnovije ponude povezane s rezervacijom.

Najnovija ponuda određuje se prema:

`offers.createdAt`

Ako rezervacija ima više ponuda, query uzima podatak `predujam` iz najnovije.

## 36. Povezivanje s bankovnim izvodom

Za `/unos_izvoda` postoji poseban query:

`getReservationsForCombobox()`

Vraća:

- reservation ID
- redni broj rezervacije
- ime gosta
- prezime gosta
- datum početka
- predujam iz najnovije ponude

Prikazuju se samo rezervacije koje imaju barem jednu ponudu.

## 37. Redni broj rezervacije

Rezervacija ima:

`redniBroj`

Trenutni query komentira da ga generira baza kao:

`bigserial`

Zato ga aplikacija pri kreiranju rezervacije ne određuje ručno.

Prije budućeg SaaS/produkcijskog rada treba provjeriti odgovara li globalni `bigserial` konačnom poslovnom zahtjevu za numeraciju rezervacija po agenciji i eventualno po godini.

Ne mijenjati numeraciju bez zasebne odluke.

## 38. Pregled rezervacija

Ruta:

`/rezervacije`

prikazuje tablični pregled rezervacija.

Rezervacije se trenutno sortiraju:

`createdAt DESC`

odnosno najnovije kreirane rezervacije prve.

## 39. Kolone tablice

Trenutni pregled prikazuje:

- broj rezervacije
- vrijedi do
- status
- prezime gosta
- ime gosta
- iznajmljivača
- apartman
- datum od
- datum do
- odrasli
- osobe mlađe od 18
- djeca
- iznos

## 40. Iznos rezervacije

Tablica već predviđa:

`price`

ali kod kreiranja nove rezervacije cijena se trenutno ne popunjava.

Query komentira da:

- `price`
- `avansPercent`
- `avansAmount`

ostaju `null` kod trenutnog kreiranja rezervacije.

Njihovu buduću ulogu treba definirati prije korištenja, posebno zbog odnosa između:

- rezervacije
- cjenika
- ponude
- predujma

## 41. Vizualni statusi

Trenutne radne boje tablice razlikuju:

- aktivne
- potvrđene
- realizirane
- stornirane

Konkretne Tailwind boje nisu konačno dizajnersko pravilo.

Treba zadržati semantičko značenje statusa, a boje kasnije upravljati kroz design system.

## 42. Status ne smije ovisiti samo o boji

Osim boje, UI trenutno prikazuje tekstualni status:

- Aktivna
- Potvrđena
- Realizirana
- Stornirana

To treba zadržati i ubuduće zbog jasnoće i accessibility zahtjeva.

## 43. Odabir rezervacije

Klik na red tablice označava rezervaciju.

Ponovni klik na isti red uklanja selekciju.

Odabrana rezervacija koristi se kao kontekst za toolbar akcije.

## 44. Detaljni prikaz rezervacije

Ispod tablice postoji pripremljen prostor za detalje odabrane rezervacije.

Trenutno prikazuje samo placeholder:

```text
Detalji rezervacije #<broj> — canvas dolazi ovdje
```

Detaljni prikaz još nije implementiran.

## 45. Toolbar

Trenutni toolbar predviđa sljedeće akcije:

### Poslovni dokumenti

- Izrada ponude
- Potvrda prijave
- Voucher

### Boravak

- Izrada prijave

### Promjena stanja

- Storno
- Brisanje

### Rad s prikazom

- Traži
- Odustani

Od navedenih akcija u dostavljenom kodu funkcionalno je implementirana samo:

`Izrada ponude`

Ostale akcije trenutno su UI priprema za budući razvoj.

## 46. Izrada prijave / stay-a

Toolbar predviđa:

`Izrada prijave`

ali workflow još nije implementiran.

Kada se implementira, treba definirati najmanje:

- može li stay nastati samo iz potvrđene rezervacije
- može li nastati iz nepotvrđene rezervacije
- preuzimaju li se automatski datumi
- preuzima li se apartman
- preuzimaju li se podaci glavnog gosta
- kako se dodaju ostale osobe
- kada rezervacija postaje realizirana

## 47. Voucher

Toolbar predviđa:

`Voucher`

ali modul još nije implementiran.

Prije implementacije treba definirati:

- kada voucher smije nastati
- mora li rezervacija biti potvrđena
- je li potrebna uplata
- koje podatke sadrži
- treba li voucher biti zaseban persistent dokument ili izvedeni PDF
- numeraciju
- mogućnost ponovnog generiranja

## 48. Partner

Rezervacija može opcionalno biti povezana s partnerom preko:

`partnerId`

Ako partner nije odabran, vrijednost se sprema kao:

`null`

Partner predstavlja vanjskog poslovnog partnera/agenciju koja šalje gosta.

Detaljna pravila partnera pripadaju zasebnom modulu.

## 49. Dohvat apartmana i iznajmljivača

Za formu postoji query:

`getAccommodationWithLandlord()`

koji za odabrani apartman dohvaća:

- ID apartmana
- naziv apartmana
- ID iznajmljivača
- prezime
- ime
- telefon iznajmljivača

To omogućuje formi prikaz konteksta bez dupliciranja tih podataka u rezervaciji.

## 50. Server Action odgovornosti

`actionCreateReservation()` trenutno pravilno centralizira važan server-side workflow:

```text
ulazni podaci
↓
Zod validacija
↓
konverzija datuma
↓
provjera raspoloživosti
↓
database insert
↓
revalidate kalendara
```

## 51. Query layer odgovornosti

Query layer trenutno sadrži funkcije za:

- dohvat apartmana i iznajmljivača
- kreiranje rezervacije
- dohvat tabličnog pregleda rezervacija
- dohvat rezervacija za payment combobox

Database pristup treba ostati izvan React komponenti i Server Action transportnog sloja prema pravilima iz:

`docs/development-rules.md`

## 52. Greške pri spremanju

Ako database insert ne uspije, korisnik trenutno dobiva generičku poruku:

`Greška pri spremanju rezervacije. Pokušajte ponovno.`

Detaljna tehnička greška ne izlaže se korisniku.

To je ispravan smjer.

Produkcijska verzija kasnije treba imati odgovarajući server-side logging tehničke greške.

## 53. Revalidacija kalendara

Nakon uspješnog kreiranja rezervacije izvršava se:

```text
revalidatePath("/kalendar")
```

Razlog je što nova rezervacija odmah utječe na prikaz zauzetosti apartmana.

## 54. Multi-tenant sigurnost

Trenutno query za listu rezervacija filtrira:

```text
reservations.agencyId = agencyId
```

To je ispravan osnovni tenant scope.

Međutim, budući SaaS mora osigurati tenant ownership kroz cijeli workflow, uključujući:

- odabrani apartman
- iznajmljivača
- partnera
- povezanu ponudu
- stay
- payment

Nije dovoljno provjeriti samo `agencyId` novog reservation zapisa.

## 55. Posebna pažnja na `getAccommodationWithLandlord`

Trenutni query:

`getAccommodationWithLandlord(accommodationId)`

traži apartman samo prema njegovom ID-u.

U budućem multi-tenant sustavu treba osigurati da korisnik ne može preko poznatog ID-a dohvatiti apartman druge agencije.

Tenant scope mora biti dio server-side provjere, a ne samo UI navigacije.

## 56. Posebna pažnja na povezane entitete

Kod kreiranja rezervacije server trenutno dobiva:

- `accommodationId`
- `partnerId`
- `landlordId`

Zod potvrđuje format/prisutnost određenih vrijednosti, ali Zod sam ne može potvrditi da:

- apartman postoji
- apartman pripada agenciji
- iznajmljivač odgovara apartmanu
- partner pripada agenciji

Takve provjere su database-dependent business validation i trebaju biti server-side prije spremanja kada se uvede puni tenant/auth model.

## 57. Poznato nedovršeno

Trenutno treba dovršiti ili definirati najmanje:

- detaljni prikaz odabrane rezervacije
- potvrđivanje rezervacije
- voucher
- izrada stay-a iz rezervacije
- storno workflow
- traženje/filter rezervacija
- ponašanje akcije Odustani
- konačna poslovna pravila cijene rezervacije
- integracija uplata i potvrde
- eventualna validacija isteka `Vrijedi do`
- konačna numeracija
- multi-tenant authorization

## 58. Brisanje nije dio trenutnog dovršavanja modula

Nedostatak Delete funkcionalnosti ne znači da modul treba automatski dobiti fizičko brisanje.

Odluka će se donositi zajedno s ostalim poslovnim modulima nakon što budu jasne sve relacije:

```text
reservation
├── offer
├── payment
├── voucher
├── stay
└── budući poslovni dokumenti
```

Vrlo je vjerojatno da će poslovni status poput storna imati važniju ulogu od fizičkog brisanja povijesnih dokumenata.

## 59. Razdvajanje poslovnog i UI statusa

Ne treba miješati:

### Database stanje

primjer:

```text
status = nepotvrdjena
stornirana = false
```

### Izvedeno poslovno stanje

primjer:

```text
postoji stay
→ realizirana
```

### UI prezentaciju

primjer:

```text
tekst "Realizirana"
+ odgovarajući semantic status style
```

To su tri različite razine.

## 60. Granice modula

Ovaj dokument ne treba detaljno opisivati:

- Gantt prikaz
- line-item tablicu ponude
- obračun ponude
- bankovni XML/import
- stays_stavke
- eVisitor
- voucher PDF detalje
- fiskalizaciju
- proviziju
- opći design system

Za njih koristiti odgovarajuće dokumente.

## 61. Veze s drugim module docs

Rezervacije su direktno povezane s:

```text
docs/modules/calendar.md
docs/modules/offers.md
docs/modules/payments.md
docs/modules/stays.md
```

Kada se ti dokumenti izrade, detaljna pravila pojedinog workflowa treba držati u modulu koji je za njih authority.

## 62. Pravilo za buduće izmjene

Prije značajne izmjene reservation workflowa:

1. pregledati ovaj dokument
2. pregledati stvarni source
3. provjeriti utjecaj na kalendar
4. provjeriti utjecaj na ponude
5. provjeriti utjecaj na payment workflow
6. provjeriti utjecaj na stays
7. provesti server-side business validation
8. uzeti u obzir budući multi-user i multi-tenant rad
9. ne uvoditi fizičko brisanje bez zajedničke odluke projekta
10. ažurirati ovaj dokument ako se promijeni poslovno pravilo ili važna arhitekturna odluka
