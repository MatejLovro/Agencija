# calendar.md — Kalendar / Gantt

## 1. Svrha modula

Kalendar je glavni operativni pregled zauzetosti smještajnih jedinica kroz vremenski period.

Modul omogućuje korisniku da na jednom mjestu vidi:

- iznajmljivače
- apartmane
- slobodne dane
- potvrđene rezervacije
- nepotvrđene rezervacije
- prijave / stays
- dane u kojima postoji preklapanje događaja

Kalendar nije samo pregled podataka.

On je također jedna od ulaznih točaka za pokretanje poslovnih procesa, prvenstveno:

- izradu rezervacije
- buduću izradu prijave / stay

## 2. Status

**Status: Djelomično implementirano**

Osnovni Gantt prikaz i kreiranje rezervacije iz kalendara postoje.

Dio interakcija, filtera i workflowa prijave još nije dovršen.

## 3. Glavne datoteke

Trenutna implementacija koristi najmanje:

```text
src/app/(dashboard)/kalendar/
├── page.tsx
└── KalendarClient.tsx

src/components/kalendar/
├── KalendarFiltriForm.tsx
├── KalendarGantt.tsx
└── RezervacijaModal.tsx

src/lib/actions/
└── kalendar.ts

src/lib/db/queries/
└── kalendar.ts
```

Kod također koristi postojeće shared tipove i calendar validation utilities iz drugih dijelova projekta.

Njihova implementacija nije dio ovog dokumenta.

## 4. Osnovni prikaz

Kalendar prikazuje podatke hijerarhijski:

```text
Iznajmljivač
    └── Apartman
            ├── dan
            ├── dan
            ├── dan
            └── ...
```

Horizontalna os predstavlja datume.

Vertikalna os predstavlja apartmane grupirane po iznajmljivaču.

Svaka kombinacija:

`apartman + datum`

predstavlja jednu ćeliju Gantt prikaza.

## 5. Izvori podataka

Kalendar trenutno koristi podatke iz najmanje sljedećih poslovnih entiteta:

- `accommodations`
- `landlords`
- `reservations`
- `stays`

Prikazuju se samo aktivni apartmani trenutne agencije.

Tenant scope trenutno se određuje preko:

`process.env.AGENCY_ID`

To je privremeni single-agency mehanizam.

Dugoročno tenant resolution mora slijediti pravila iz:

`docs/development-rules.md`

## 6. Dohvat događaja

Kalendar dohvaća rezervacije i stays koji se preklapaju s odabranim vremenskim rasponom.

Osnovno pravilo preklapanja je:

```text
event.dateFrom <= filter.datumDo
AND
event.dateTo >= filter.datumOd
```

To znači da se događaj prikazuje ako zahvaća barem jedan datum trenutnog raspona kalendara.

## 7. Vrste događaja u kalendaru

Kalendar trenutno razlikuje:

### Potvrđena rezervacija

Interni tip prikaza:

`rezervacija_potvrdjena`

### Nepotvrđena rezervacija

Interni tip prikaza:

`rezervacija_nepotvrdjena`

### Prijava / stay

Interni tip prikaza:

`prijava`

### Preklapanje

Interni tip prikaza:

`preklapanje`

Preklapanje nije zaseban poslovni zapis u bazi.

To je izvedeno stanje kalendara.

## 8. Pravilo preklapanja

Za svaki apartman rezervacije i stays privremeno se svode na zajednički koncept događaja.

Za svaki prikazani datum provjerava se koliko je različitih događaja aktivno tog dana.

Ako su aktivna najmanje dva događaja:

```text
broj aktivnih događaja >= 2
```

taj dan prikazuje se kao:

`preklapanje`

Ovo pravilo trenutno obuhvaća:

- dvije ili više rezervacija koje se preklapaju
- rezervaciju i stay
- druge kombinacije više događaja
- rubni slučaj kada se završetak jednog događaja poklapa s početkom drugog

## 9. Check-out / check-in na isti datum

Datumi događaja trenutno se u calendar prikazu tretiraju inkluzivno:

```text
dateFrom <= datum <= dateTo
```

Zbog toga završni datum događaja pripada prikazanom periodu događaja.

Istovremeno je poslovno dopušteno da:

- jedan gost odlazi
- drugi gost dolazi

na isti kalendarski datum.

Takav datum može se u Ganttu pojaviti kao dan preklapanja.

To ne mora automatski značiti poslovni konflikt.

Kalendar zato treba razlikovati:

- vizualno preklapanje događaja
- stvarnu poslovnu zabranu rezerviranja

Ta dva pojma nisu isto.

## 10. Oznaka odjave

Za rezervaciju ili stay kalendar evidentira je li prikazani datum završni datum događaja.

Interno:

`jeOdjava = true`

kada vrijedi:

```text
datum === dateTo
```

Trenutni UI završetak označava vertikalnom oznakom unutar ćelije.

Konkretni vizualni način prikaza nije trajno poslovno pravilo i može se kasnije promijeniti.

## 11. Kreiranje rezervacije iz kalendara

Korisnik može:

1. odabrati jedan ili više dana za isti apartman
2. otvoriti kontekstni izbornik
3. odabrati `Izrada rezervacije`
4. sustav provjerava smije li se za taj period napraviti rezervacija
5. ako je dopušteno, otvara se forma rezervacije s već zadanim apartmanom i periodom
6. nakon spremanja kalendar se ponovno učitava

## 12. Selekcija perioda

Korisnik može lijevim klikom i povlačenjem označiti vremenski period.

Selekcija mora ostati unutar jednog apartmana.

Ako korisnik započne selekciju u jednom apartmanu, povlačenje kroz red drugog apartmana ne smije proširiti selekciju na taj apartman.

Smjer selekcije nije bitan.

Dopušteno je označavati:

- od ranijeg prema kasnijem datumu
- od kasnijeg prema ranijem datumu

Prije pokretanja akcije datumi se normaliziraju u:

```text
od <= do
```

## 13. Kontekstni izbornik

Desni klik trenutno otvara kontekstni izbornik za:

- postojeću selekciju istog apartmana
- ili jedan dan ako odgovarajuća selekcija ne postoji

Trenutno postoje akcije:

- `Izrada rezervacije`
- `Izrada prijave`

Kontekstni izbornik je djelomično implementiran.

Buduće ponašanje treba ovisiti o kontekstu klika, primjerice:

- slobodan dan
- postojeća rezervacija
- postojeći stay
- preklapanje
- selektirani period

Ne smije se pretpostaviti da iste akcije trebaju biti dostupne za svaki tip ćelije.

## 14. Provjera prije kreiranja rezervacije

Prije otvaranja forme nove rezervacije trenutno se izvršava server-side provjera perioda.

Rezerviranje se blokira ako za apartman i odabrani period postoji:

1. evidentirani stay / prijava
2. potvrđena rezervacija

Ako postoji stay, korisnik dobiva poruku:

`Za izabrani period postoji evidentirana prijava`

Ako postoji potvrđena rezervacija:

`Za izabrani period postoji potvrđena rezervacija`

## 15. Nepotvrđene rezervacije

Postojeća nepotvrđena rezervacija sama po sebi ne blokira kreiranje druge rezervacije za isti ili preklapajući period.

To je namjerno poslovno pravilo.

Zbog toga za isti apartman i period može postojati više konkurentskih nepotvrđenih rezervacija.

Kalendar takvo stanje mora moći prikazati kao preklapanje.

## 16. Potvrđene rezervacije

Potvrđena rezervacija predstavlja blokadu za kreiranje konkurentske rezervacije za isti poslovno konfliktni period.

Provjera mora biti server-side.

Vizualni prikaz u Ganttu nije dovoljan za zaštitu poslovnog pravila.

## 17. Stays / prijave

Postojeći stay predstavlja stvarno korištenje smještaja i blokira kreiranje rezervacije za konfliktni period.

Stays se prikazuju u Ganttu kao zaseban tip događaja.

Kreiranje novog stay-a iz kalendara još nije implementirano.

Trenutno postoji samo pripremljena akcija:

`Izrada prijave`

bez dovršenog workflowa.

## 18. Forma rezervacije

Kalendar otvara postojeći `RezervacijaModal`.

Pri otvaranju forme već su poznati:

- `accommodationId`
- početni datum
- završni datum

Forma dodatno dohvaća kontekst potreban za rezervaciju.

Trenutna forma uključuje između ostalog:

- iznajmljivača
- smještaj
- podatke gosta
- period
- broj osoba
- datum do kojeg rezervacija vrijedi
- napomenu
- partnera / agenciju koja šalje gosta

Detaljna poslovna pravila rezervacije ne pripadaju ovom dokumentu.

Njih treba voditi u:

`docs/modules/reservations.md`

## 19. Refresh nakon kreiranja rezervacije

Nakon uspješnog spremanja rezervacije:

1. modal se zatvara
2. kalendar ponovno dohvaća podatke za prikazani vremenski raspon

Trenutna implementacija refresha ne zadržava sve aktivne filtere.

Refresh ponovno postavlja dio filtera na njihove neutralne vrijednosti.

To treba uzeti u obzir kod budućeg poboljšanja filter statea.

## 20. Filteri

Kalendar trenutno podržava ili predviđa filtere prema:

### Periodu

- od datuma
- do datuma

### Lokaciji i iznajmljivaču

Data/query sloj podržava:

- grad
- iznajmljivača

Trenutni `KalendarFiltriForm` još ne prosljeđuje stvarni odabir za ta dva filtera, nego šalje:

```text
gradId: null
landlordId: null
```

Zato se ova dva filtera ne smatraju dovršenima.

### Kapacitetu

- broj soba
- broj kreveta
- broj pomoćnih ležajeva

### Opremljenosti

- klima
- parking
- WiFi
- kućni ljubimac
- pogled na more

### Prioritetu

- samo prioritetni apartmani

### Statusu rezervacije

Mogući prikaz:

- sve
- samo potvrđene
- samo nepotvrđene

Filter statusa odnosi se na rezervacije.

Stays nisu rezervacije i ne trebaju biti skriveni samo zato što je odabran određeni status rezervacije, osim ako se kasnije izričito definira drugačije poslovno ponašanje.

## 21. Početni vremenski raspon

Kod prvog otvaranja kalendara vremenski raspon određuje se relativno prema današnjem datumu.

Broj dana prije i poslije današnjeg datuma trenutno se može podesiti environment vrijednostima:

```text
NEXT_PUBLIC_CALENDAR_DAYS_BEFORE
NEXT_PUBLIC_CALENDAR_DAYS_AFTER
```

Trenutne fallback vrijednosti su:

```text
days before = 6
days after = 45
```

Ove konkretne vrijednosti predstavljaju trenutnu konfiguraciju, a ne trajno poslovno pravilo.

## 22. Datumi

Interni calendar/query sloj koristi ISO format:

`yyyy-mm-dd`

Korisnički unos i prikaz datuma trebaju slijediti projektno pravilo:

`dd.mm.gggg.`

Kalendar trenutno ima lokalne helper funkcije za određene konverzije datuma.

Dugoročno treba preferirati zajedničke date utilities gdje je to praktično, prema pravilima projekta.

## 23. Trenutni vizualni prikaz

Gantt trenutno vizualno razlikuje:

- slobodan dan
- slobodan vikend
- današnji datum
- potvrđenu rezervaciju
- nepotvrđenu rezervaciju
- prijavu
- preklapanje
- selektirani period
- završni datum događaja

Konkretne trenutno korištene boje su **radne boje**.

One nisu konačan dio design systema.

## 24. Semantičke boje

Poslovna logika ne smije ovisiti o konkretnoj Tailwind boji.

Umjesto hardkodiranog značenja poput:

```text
amber = potvrđena rezervacija
green = stay
orange = preklapanje
```

cilj je koristiti semantičke tokene, primjerice:

```text
calendar-reservation-confirmed
calendar-reservation-unconfirmed
calendar-stay
calendar-overlap
calendar-today
calendar-selection
```

Konkretne vizualne vrijednosti tih tokena moći će se promijeniti tijekom budućeg dizajna aplikacije.

Globalna pravila definirana su u:

`docs/ui-design-system.md`

## 25. Brojevi događaja

Kalendar trenutno prikazuje redni broj rezervacije u ćeliji.

Za stay se prikazuje oznaka:

```text
P<redniBroj>
```

Primjer:

`P15`

To je trenutno UI ponašanje i može se kasnije doraditi ako bude potreban jasniji prikaz poslovnih dokumenata.

## 26. Grupiranje i sortiranje

Podaci se dohvaćaju sortirani prema:

1. prezimenu iznajmljivača
2. imenu iznajmljivača
3. nazivu apartmana

Kalendar zatim grupira apartmane po iznajmljivaču.

Promjene sortiranja trebaju biti poslovno opravdane, jer raspored redaka utječe na svakodnevnu preglednost Gantta.

## 27. Tenant isolation

Kalendar prikazuje samo apartmane trenutne agencije.

Buduća SaaS implementacija mora osigurati da:

- apartman pripada aktivnom tenantu
- dohvaćene rezervacije pripadaju odgovarajućem tenant kontekstu
- dohvaćeni stays pripadaju odgovarajućem tenant kontekstu
- korisnik ne može preko calendar akcija pristupiti podacima druge agencije

Ne oslanjati se samo na UI filter za tenant isolation.

## 28. Razdvajanje odgovornosti

Trenutna arhitektura približno dijeli odgovornosti ovako:

### Query layer

Dohvaća:

- apartmane
- iznajmljivače
- rezervacije
- stays

i primjenjuje database filtere.

### Server Action layer

- dohvaća raw podatke iz query sloja
- transformira ih u Gantt strukturu
- računa dane preklapanja
- provodi provjeru prije kreiranja rezervacije

### Client layer

- upravlja filterima
- upravlja loading/error stanjem
- prikazuje Gantt
- upravlja selekcijom
- otvara context menu
- otvara modal rezervacije
- pokreće refresh

### Gantt component

- prikazuje vremensku mrežu
- upravlja drag selekcijom
- prikazuje poslovna stanja dana
- otvara context menu

## 29. Važno arhitekturno pravilo

Vizualni Gantt nije authority za provjeru raspoloživosti.

Činjenica da ćelija izgleda slobodno ne smije sama po sebi značiti da je poslovna operacija dopuštena.

Prije operacije koja mijenja podatke mora se izvršiti odgovarajuća server-side provjera.

To je posebno važno za budući multi-user SaaS, gdje se stanje baze može promijeniti nakon što je kalendar već učitan.

## 30. Poznato nedovršeno

Trenutno treba dovršiti ili dodatno definirati najmanje:

- filter Grad
- filter Iznajmljivač
- čuvanje aktivnih filtera nakon refresha
- kompletno context-menu ponašanje prema tipu ćelije/događaja
- workflow `Izrada prijave`
- detaljni prikaz događaja
- hover/tooltip kod preklapanja
- konačni vizualni design Gantta
- semantičke theme tokene za calendar statuse

## 31. Pitanja za budući razvoj

Prije većeg proširenja modula treba definirati:

- što se događa klikom/desnim klikom na postojeću rezervaciju
- što se događa klikom/desnim klikom na stay
- kako prikazati više konkurentskih rezervacija istog perioda
- treba li tooltip prikazivati sve događaje na dan preklapanja
- kako vizualno razlikovati dopušteni check-out/check-in overlap od stvarnog konflikta
- kako uređivati postojeću rezervaciju iz kalendara
- kako uređivati stay iz kalendara
- treba li omogućiti pomicanje događaja drag-and-dropom
- treba li dopustiti promjenu datuma događaja direktno u Ganttu

Te funkcionalnosti ne implementirati automatski samo zato što su uobičajene za Gantt aplikacije.

Moraju biti potvrđene kao dio željenog poslovnog workflowa.

## 32. Granice modula

Ovaj dokument opisuje kalendar kao poslovni i operativni modul.

Ne treba ovdje detaljno dokumentirati:

- kompletnu formu rezervacije
- database shemu rezervacije
- partner workflow
- stays_stavke
- voucher
- ponudu
- payment workflow
- globalni design system

Za to koristiti odgovarajuće projektne dokumente.

## 33. Pravilo za buduće izmjene

Prije značajne izmjene kalendara:

1. pregledati ovaj dokument
2. pregledati stvarni source
3. provjeriti utjecaj na rezervacije
4. provjeriti utjecaj na stays
5. provjeriti server-side pravila raspoloživosti
6. odvojiti poslovno pravilo od vizualne promjene
7. ne zaključavati nove boje ili vizualne vrijednosti kao trajna pravila
8. ažurirati ovaj dokument ako se promijeni poslovno ponašanje ili važna arhitekturna odluka
