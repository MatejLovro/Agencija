# known-issues.md — Poznati problemi i tehnički dug

## 1. Svrha dokumenta

Ovaj dokument vodi:

- potvrđene bugove
- tehničke nedosljednosti
- privremene workarounde
- arhitekturni dug
- probleme koje treba dodatno istražiti

Ovaj dokument **nije roadmap**.

Planirane funkcionalnosti vode se u:

```text
docs/status-projekta.md
```

Poslovna pravila vode se u:

```text
docs/project-overview.md
docs/modules/*.md
```


# Statusi

## 2. `OPEN`

Problem je potvrđen i treba ga riješiti.


## 3. `WORKAROUND`

Problem je poznat, ali postoji trenutno stabilno zaobilazno rješenje koje ne treba uklanjati bez boljeg rješenja.


## 4. `INVESTIGATE`

Postoji potencijalni problem ili arhitekturno pitanje, ali prije promjene treba dodatno analizirati source, library ili infrastrukturu.


## 5. `RESOLVED`

Problem je riješen.

Riješene stavke ne treba dugoročno gomilati u ovom dokumentu.

Nakon što više nisu korisne kao upozorenje za razvoj, ukloniti ih i osloniti se na Git history.


# Iznajmljivači i smještajne jedinice

## 6. Grad i adresa ne prenose se nakon kreiranja novog iznajmljivača

**Status: OPEN**

### Simptom

U workflowu:

```text
novi iznajmljivač
↓
spremi
↓
odmah dodaj smještajnu jedinicu
```

grad i adresa novog iznajmljivača ne popunjavaju se automatski u `ApartmanModal`.


### Uzrok

`LandlordForm` definira callback približno kao:

```text
onSaved(
  landlordId,
  tipProvizije,
  cityId,
  address
)
```

ali nakon uspješnog kreiranja trenutno prosljeđuje samo:

```text
landlordId
tipProvizije
```

Parent komponenta očekuje i:

```text
cityId
address
```

pa ih ne može proslijediti novom `ApartmanModal`.


### Ispravak

Kod popravljanja ne dodavati drugi workaround u `ApartmanModal`.

Ispraviti podatke na izvoru — `LandlordForm` treba nakon uspješnog spremanja callbacku proslijediti sve ugovorene argumente.


### Povezano

```text
docs/modules/landlords.md
docs/modules/accommodations.md
```


## 7. Unicode znak u identifikatoru `kupаonaTus`

**Status: OPEN**

U Drizzle i Zod sourceu postoji identifikator:

```text
kupаonaTus
```

Jedan znak koji vizualno izgleda kao latinično `a` zapravo nije isti Unicode znak.

Database kolona je:

```text
kupaona_tus
```


### Rizik

Problem može uzrokovati:

- neuspješno tekstualno pretraživanje
- pogrešno ručno upisan identifier
- neočekivani refactor rezultat
- dvije vizualno gotovo identične varijable
- teže održavanje


### Ispravak

Napraviti zaseban kontrolirani refactor.

Prije izmjene pronaći **sve** reference identifikatora i promijeniti ih zajedno.

Ne popravljati samo jednu datoteku.


## 8. `accomodation.ts` naming inconsistency

**Status: OPEN — nizak prioritet**

Validation datoteka trenutno koristi naziv:

```text
accomodation.ts
```

dok se tehnički entitet inače naziva:

```text
accommodation
```


### Rizik

Nema poznatog funkcionalnog problema.

Radi se o naming debt-u koji može uzrokovati:

- pogrešne importe
- poteškoće pri pretraživanju
- buduće duplikate datoteka


### Ispravak

Preimenovati samo kao zaseban mali refactor uz provjeru svih importa.


# Multi-tenant

## 9. Landlord queryji nisu svugdje tenant-scoped

**Status: OPEN — prije SaaS produkcije obavezno**

Potvrđeni queryji poput:

```text
getLandlords()
getLandlordById()
updateLandlord()
```

trenutno ne koriste uvijek:

```text
agencyId
```

u WHERE uvjetu.

`getLandlordByOib()` već koristi tenant scope.


### Trenutni kontekst

Problem trenutno djelomično prikriva single-agency model:

```text
AGENCY_ID
```


### Zahtjev

Prije multi-tenant SaaS rada ID-based queryji trebaju koristiti tenant kontekst.


## 10. Accommodation queryji nisu tenant-scoped

**Status: OPEN — prije SaaS produkcije obavezno**

Potvrđeni queryji:

```text
getAccommodationsByLandlord()
getAccommodationById()
updateAccommodation()
deleteAccommodation()
```

trenutno se oslanjaju na:

```text
landlordId
```

ili:

```text
accommodation.id
```

bez dodatnog `agencyId` scopea.


### Dodatni problem

Kod kreiranja accommodationa treba provjeriti da:

```text
landlordId
```

pripada istoj agenciji.


## 11. Povezivanje staging uplate s rezervacijom nema potpunu tenant provjeru

**Status: OPEN — prije SaaS produkcije obavezno**

Kod povezivanja:

```text
izvod_tmp
→ reservation
```

staging zapis se ažurira prema vlastitom:

```text
id + agencyId
```

ali target reservation nije u pregledanom workflowu eksplicitno provjerena prema istoj agenciji.


### Zahtjev

Prije povezivanja provjeriti:

```text
reservation.agencyId = currentAgencyId
```


## 12. `(agencyId, oib)` nije database `UNIQUE`

**Status: INVESTIGATE**

Landlord schema trenutno ima obični indeks:

```text
(agencyId, oib)
```

ali ne i:

```text
UNIQUE (agencyId, oib)
```


### Trenutna zaštita

Aplikacijski create/update workflow provjerava postoji li OIB.


### Rizik

Kod paralelnih zahtjeva aplikacijska provjera sama ne garantira jedinstvenost.


### Odluka

Prije dodavanja database constrainta potvrditi da je:

```text
jedan OIB po agenciji
```

definitivno poslovno pravilo.

Ako jest, database `UNIQUE` je sigurniji konačni model.


## 12a. Pricelist queryji nemaju tenant ownership provjeru

**Status: OPEN — prije SaaS produkcije obavezno**

Potvrđeni queryji u:

```text
src/lib/db/queries/pricelist.ts
```

```text
getPricelistByAccommodation()
createPricelistEntry()
updatePricelistEntry()
deletePricelistEntry()
```

trenutno pristupaju podacima isključivo preko:

```text
accommodationId
```

ili:

```text
pricelist.id
```

bez provjere pripada li povezana smještajna jedinica trenutnoj agenciji.


### Posljedica

Uz poznati `accommodationId` ili `pricelist.id` (npr. UUID iz drugog konteksta), trenutna implementacija dopušta:

- dohvat cjenika smještajne jedinice druge agencije
- dodavanje stavke cjenika na smještajnu jedinicu druge agencije
- update/delete stavke cjenika druge agencije preko poznatog `pricelist.id`


### Trenutni kontekst

Problem trenutno prikriva single-agency model preko `AGENCY_ID` — u praksi ne postoji druga agencija čiji bi se podaci mogli slučajno dohvatiti ili izmijeniti.


### Zahtjev

Prije multi-tenant SaaS rada ovi queryji trebaju provjeriti da povezani `accommodation.agencyId` odgovara trenutnoj agenciji, u skladu s pravilom iz `docs/database.md` (cross-tenant FK zaštita).


# eVisitor sigurnost

## 13. `eVisitPass` sprema se kao običan string

**Status: OPEN — prije produkcije obavezno riješiti**

Landlord model trenutno ima:

```text
eVisitName
eVisitPass
```

a pregledani source ne pokazuje enkripciju lozinke.


### Rizik

Ako baza ili neovlašteni korisnik dobije pristup podatku, eVisitor credential može biti izložen.


### Nije dovoljno samo hashiranje

Ako aplikacija kasnije mora koristiti originalnu lozinku za automatsku eVisitor prijavu, jednosmjerni hash nije dovoljan.


### Potrebna arhitekturna odluka

Prije produkcije definirati:

- treba li aplikacija uopće čuvati lozinku
- gdje se credential čuva
- enkripciju at rest
- upravljanje ključevima
- prava pristupa
- maskiranje u UI-u
- audit pristupa


# Kalendar

## 14. Filter Grad trenutno nije funkcionalno povezan

**Status: OPEN**

`KalendarFiltriForm` ima UI za Grad, ali trenutni workflow ne prosljeđuje stvarni:

```text
gradId
```

nego vrijednost završava kao:

```text
null
```


## 15. Filter Iznajmljivač trenutno nije funkcionalno povezan

**Status: OPEN**

Isti problem postoji za:

```text
landlordId
```

UI postoji, ali filter nije dovršen kroz puni state/query workflow.


## 16. Refresh nakon kreiranja rezervacije može izgubiti aktivne filtere

**Status: OPEN**

Nakon uspješnog kreiranja rezervacije Kalendar ponovno učitava podatke, ali trenutni refresh workflow ne mora sačuvati sve aktivne filtre.

Raspon datuma se čuva, ali ostali filteri trebaju biti dio istog konzistentnog filter statea.


# React Hook Form / line items

## 17. Gubitak fokusa kod line-item formi

**Status: WORKAROUND**

Kod složenih tabličnih formi raniji obrazac:

```text
React Hook Form
+
useFieldArray
+
watch / useWatch na parent razini
```

uzrokovao je česte parent rerendere i gubitak fokusa tijekom unosa u stavke.


### Trenutno stabilno rješenje

Za ponude se koristi:

```text
RHF
→ header forme

local React state
→ stavke tablice
```

Parent ne prati cijelu kolekciju stavki kroz široki `watch`.

Kod submitanja stavke se čitaju iz stabilnog state/ref obrasca.


### Pravilo

Ne vraćati `useFieldArray` u složene stavke samo radi arhitekturne uniformnosti.

Prvo dokazati da novi pristup neće ponovno uzrokovati focus/rerender problem.


### Povezano

```text
docs/development-rules.md
docs/modules/offers.md
```


## 18. Široki `watch()` / `useWatch()` može uzrokovati nepotrebne rerendere

**Status: WORKAROUND**

Kod većih formi izbjegavati parent-level promatranje cijelog složenog objekta ako samo manji dio UI-a ovisi o vrijednosti.

Preferirati:

- lokalni state gdje je primjeren
- uski field-level watch
- memoizirane child komponente
- ref za podatke potrebne samo kod submita


## 19. `zodResolver(... ) as any`

**Status: WORKAROUND / INVESTIGATE**

U pojedinim formama koristi se obrazac:

```text
zodResolver(schema) as any
```

zbog TypeScript kompatibilnosti između trenutnih verzija:

```text
Zod v4
React Hook Form
@hookform/resolvers
```


### Pravilo

Ne uklanjati `as any` samo radi čišćenja koda bez provjere:

- trenutnih package verzija
- inferred input/output tipova
- `z.coerce`
- default vrijednosti
- resolver genericsa

Ako se kompatibilnost kasnije riješi nadogradnjom ili preciznijim genericsima, workaround ukloniti.


# Ponude

## 20. PDF print workflow nije potvrđeno dovršen

**Status: INVESTIGATE**

```text
src/app/api/ponude/[id]/pdf/route.ts
```

postoji i `PonudeClient.tsx` je poziva preko `window.open`.

Ruta dohvaća ponudu preko `getOfferForPdf()` i renderira `PonudaPdf` komponentu u PDF.


### Posljedica

Sama ruta postoji i UI je koristi, ali to se ne smije automatski tumačiti kao da je cijeli print workflow dovršen i ispravan.

Povezana otvorena pitanja (brojevi #22 i #23 niže) i dalje vrijede.


## 21. Kreiranje ponude i stavki nije obuhvaćeno jednom potvrđenom transakcijom

**Status: OPEN**

Current create workflow:

```text
INSERT offer
↓
INSERT offer items
```

u sourceu ima komentar koji implicira transaction workflow, ali pregledani implementation ne pokazuje stvarnu zajedničku DB transakciju.


### Rizik

Ako:

```text
offer INSERT
```

uspije, a:

```text
items INSERT
```

ne uspije, može ostati nepotpun dokument.


### Zahtjev

Prije produkcije poslovnih dokumenata potrebno je osigurati atomic create workflow.


## 22. Server-side validacija ponude nije potpuna

**Status: OPEN**

Form koristi Zod na klijentskoj strani, ali pregledani Server Action ne provodi kompletan:

```text
safeParse
```

nad svim pristiglim podacima neposredno prije database operacija.


### Zahtjev

Server je trust boundary.

Prije INSERT-a treba validirati:

- header
- stavke
- tenant pripadnost FK-ova
- dopuštenost rezervacije
- povezane usluge/poreze gdje je potrebno


## 23. PDF koristi dio live matičnih podataka umjesto potpunog snapshota

**Status: INVESTIGATE**

Offer item sprema:

```text
serviceText
```

kao snapshot.

PDF trenutno za dio prikaza, primjerice jedinicu mjere, dohvaća podatak iz aktualne matične usluge.


### Rizik

Ako se matična usluga kasnije promijeni, stari PDF može prikazati kombinaciju:

```text
povijesnog snapshot podatka
+
trenutnog master podatka
```


### Odluka

Kod finalizacije poslovnih dokumenata definirati koji podaci moraju biti snapshot.


# Bankovni izvodi i uplate

## 24. `delete staging → insert staging` nije transakcijski

**Status: OPEN**

Import trenutno radi približno:

```text
DELETE postojeći izvod_tmp
↓
parse/map
↓
INSERT novi izvod_tmp
```

DELETE i INSERT nisu potvrđeno obuhvaćeni jednom transakcijom.


### Rizik

Ako DELETE uspije, a INSERT nakon toga ne uspije, stari staging je izgubljen.


### Zahtjev

Import treba postati atomic ili koristiti sigurniji batch/import model.


## 25. Više ponuda za rezervaciju može duplicirati staging redak u query rezultatu

**Status: OPEN**

`getIzvodTmp()` povezuje:

```text
izvod_tmp
→ reservations
→ offers
```

bez uvjeta koji bira samo jednu ponudu.

Ako rezervacija ima više ponuda, jedan staging zapis može u rezultatu biti vraćen više puta.


### Potrebna odluka

Definirati što payment UI zapravo treba prikazivati:

- zadnju ponudu
- aktivnu ponudu
- odabranu ponudu
- agregat
- samo rezervaciju bez offer joina


## 26. UI filter "samo uplate" uključuje i nulu

**Status: OPEN — nizak prioritet**

Trenutni filter koristi približno:

```text
uplaceno >= 0
```

Zato prikazuje:

```text
pozitivne iznose
+
0
```

Ako naziv znači samo stvarne priljeve, očekivani uvjet bi vjerojatno trebao biti:

```text
> 0
```

Prije izmjene potvrditi željeno ponašanje.


## 27. Negativna povezana stavka može se proknjižiti

**Status: OPEN**

Server posting trenutno uzima sve staging retke koji imaju:

```text
reservationId != null
```

bez dodatnog uvjeta:

```text
uplaceno > 0
```

Zato povezana DBIT/negativna transakcija može završiti u `payments`.


### Važno

Ovo ne treba automatski "popraviti" odbacivanjem svih negativnih transakcija.

Potrebno je odlučiti hoće li budući model podržavati:

- povrat novca
- storno
- chargeback
- korekcije
- druga bankovna terećenja


## 28. Nakon knjiženja staging se ne označava kao proknjižen

**Status: OPEN**

Nakon uspješnog:

```text
actionProknjizi()
```

staging retci ostaju u:

```text
izvod_tmp
```

bez:

- `posted` statusa
- čišćenja
- batch zaključavanja


### Posljedica

Korisniku nije iz samog staging stanja jasno što je već proknjiženo.

Unique `(agencyId, bankRef)` sprečava dupli INSERT u `payments`, ali ne rješava UX/state problem.


## 29. `linkedCount` i `insertedCount` mogu biti različiti bez jasnog objašnjenja

**Status: OPEN — UX**

`payments` koristi:

```text
onConflictDoNothing
```

za:

```text
(agencyId, bankRef)
```

Zato već proknjižena stavka može biti povezana u stagingu, ali ponovno neće biti umetnuta.


### Posljedica

Rezultat može biti:

```text
linkedCount > insertedCount
```

To je tehnički ispravno, ali korisniku treba jasno objasniti da su neke transakcije već postojale.


## 30. Upload provjerava `.xml`, ne stvarnu CAMT verziju

**Status: INVESTIGATE**

Upload trenutno provjerava prvenstveno ekstenziju:

```text
.xml
```

Parser zatim očekuje određenu CAMT strukturu.

Ne postoji potvrđena stroga provjera da je dokument baš:

```text
camt.053.001.08
```


### Odluka

Provjeriti hoće li aplikacija:

- podržavati samo jednu CAMT verziju
- podržavati više verzija
- validirati namespace/schema
- koristiti samo strukturalnu provjeru potrebnih elemenata


## 31. Parser koristi samo prvi `TxDtls`

**Status: INVESTIGATE**

Parser trenutno uzima samo prvi:

```text
TxDtls
```

iz entryja.

To odgovara trenutno korištenim izvodima, ali nije opći CAMT invariant.


### Rizik

Ako banka pošalje entry s više transaction details, dio podataka može biti ignoriran.


# Numeriranje dokumenata

## 32. Konačni concurrency-safe numbering još nije riješen

**Status: INVESTIGATE**

Poslovni dokumenti trebaju godišnje numeriranje.

Konačna implementacija još nije zaključena.


### Pravilo

Ne uvoditi nezaštićeni:

```text
MAX(broj) + 1
```

u multi-user produkciji.

Potrebno je odabrati concurrency-safe model prije finalnog invoicing/offer numbering workflowa.


# Drizzle / Neon infrastruktura

## 33. Transakcijski model Neon drivera treba potvrditi prije oslanjanja na njega

**Status: INVESTIGATE**

Projekt koristi Neon PostgreSQL.

Prije uvođenja transakcijski kritičnih workflowa treba provjeriti mogućnosti i ograničenja **konkretnog drivera i konfiguracije koju projekt tada koristi**.

Posebno za:

- offer + items
- import staging replacement
- numbering
- invoice + items
- commission posting

Ne zapisivati općenito da "Neon ne podržava transakcije"; to ovisi o driveru i načinu povezivanja.


## 34. Drizzle migrations i ručne Neon izmjene moraju ostati sinkronizirane

**Status: INVESTIGATE**

Ako je dio schema promjena tijekom razvoja izvođen ručno u Neon SQL editoru, postoji rizik razilaženja između:

```text
stvarna baza
Drizzle schema
drizzle migration history
```


### Pravilo

Prije produkcije provjeriti da se schema može reproducirati iz kontroliranog migration workflowa.


## 34a. `schema/index.ts` ne eksportira sve tabele

**Status: INVESTIGATE — nizak prioritet**

```text
src/lib/db/schema/index.ts
```

ima komentar:

```text
Single entry point for all schema tables.
```

ali trenutno ne eksportira:

```text
offers
offers_stavke
services
taxes
izvod_tmp
payments
```


### Trenutno stanje

Barrel file koristi se samo na manjem broju mjesta u projektu.

Veći dio koda, uključujući cijeli `offers` query sloj, direktno importira iz pojedinačnih schema datoteka, primjerice:

```text
@/lib/db/schema/offers
@/lib/db/schema/offers_stavke
```


### Rizik

Nema poznatog funkcionalnog problema.

Komentar u datoteci trenutno ne odgovara stvarnoj praksi importa u projektu.


### Odluka

Prije bilo kakvog čišćenja potrebno je odlučiti hoće li barrel file postati stvarni standard za importe kroz projekt, ili ga treba ukloniti/preformulirati komentar da odražava stvarno stanje.

Ne standardizirati importe niti mijenjati barrel dok odluka nije donesena.


# UI infrastruktura

## 35. `ComboboxWithCreate` focus/event ponašanje je osjetljivo

**Status: INVESTIGATE**

Shared combobox komponente koje kombiniraju:

```text
Popover
Command
Dialog
create-new action
```

mogu imati osjetljivo ponašanje vezano uz:

- focus restore
- event propagation
- otvaranje modala iz popovera
- pointer events

Kod promjena prvo pregledati postojeći stabilni pattern.

Ne raditi generički refactor samo radi pojednostavljenja.


## 35a. Custom `max-w-*` na `DialogContent` mora uključivati `sm:` variantu

**Status: WORKAROUND**

```text
src/components/ui/dialog.tsx
```

`DialogContent` ima default:

```text
max-w-[calc(100%-2rem)] sm:max-w-sm
```

Kada komponenta koja koristi `DialogContent` proslijedi vlastiti `className` s custom širinom bez `sm:` prefiksa, primjerice:

```text
max-w-[1180px]
```

`cn()` (tailwind-merge) zamijeni base `max-w-[calc(100%-2rem)]`, ali **ne** zamijeni `sm:max-w-sm`, jer tailwind-merge tretira base i `sm:` variantu istog utilityja kao odvojene slotove.

Rezultat: na desktopu (≥640px) i dalje pobjeđuje `sm:max-w-sm` (384px), pa modal ostaje uzak unatoč postavljenom `max-w-[Npx]`.

Potvrđeno na `ApartmanModal.tsx` tijekom vizualnog redizajna (2026-09-07).


### Ispravak

Custom širinu na `DialogContent` uvijek proslijediti s odgovarajućom `sm:` variantom, primjerice:

```text
max-w-[900px] sm:max-w-[900px]
```

Ne mijenjati default u `dialog.tsx` radi pojedinačnog modala — ispravak provoditi lokalno u komponenti koja custom širinu treba.


### Povezano

```text
src/components/iznajmljivaci/ApartmanModal.tsx
```


## 36. Visina kompleksnih dashboard ekrana

**Status: INVESTIGATE**

Kalendar i drugi veliki business ekrani ovise o kombinaciji:

```text
dashboard layout
header
toolbar
content height
overflow
```

Promjene globalnih `h-full`, `min-h-*` ili overflow pravila mogu lako pokvariti Gantt/table layout.

Prije globalne izmjene provjeriti Kalendar i ostale data-dense ekrane.


# Što nije poznati problem

## 37. Nedovršeno brisanje nije bug

Ne postojanje delete dugmeta ili konačne deletion politike **nije poznati problem**.

To je namjerno odgođena arhitekturna odluka.

Ne dodavati stavke tipa:

```text
TODO: dodati delete landlord
TODO: dodati delete reservation
TODO: dodati delete stay
```

samo radi CRUD kompletnosti.

Odluka se donosi tek nakon povezivanja cijelog poslovnog workflowa.


## 38. Planirana funkcionalnost nije known issue

Primjeri koji ne pripadaju ovom dokumentu:

```text
voucher nije implementiran
eVisitor nije implementiran
računi nisu implementirani
Better Auth nije implementiran
izvještaji nisu implementirani
```

To su status/roadmap stavke i pripadaju:

```text
docs/status-projekta.md
```


# Pravila održavanja

## 39. Kada dodati novi issue

Dodati stavku kada postoji:

- reproducibilan bug
- potvrđena tehnička nedosljednost
- workaround koji budući developer mora znati
- sigurnosni rizik
- arhitekturni dug koji može uzrokovati pogrešnu implementaciju
- konkretno pitanje koje treba istražiti prije promjene


## 40. Kada ne dodavati issue

Ne dodavati:

- obični TODO
- željenu novu funkcionalnost
- ideju za budućnost
- sve što nedostaje modulu
- detalje koji već pripadaju module dokumentu


## 41. Nakon rješavanja

Nakon ispravka:

1. provjeriti ponašanje
2. ažurirati povezani module dokument ako se arhitektura promijenila
3. promijeniti issue u `RESOLVED` samo ako je korisno kratkotrajno zadržati zapis
4. kasnije ukloniti riješenu stavku
5. Git ostaje trajna povijest promjene


# Pravilo za Claude Code

## 42. Prije rada na području s poznatim problemom

Claude Code treba:

1. pročitati relevantnu stavku iz ovog dokumenta
2. otvoriti stvarni source
3. utvrditi postoji li problem još uvijek
4. ne pretpostavljati da je predloženi smjer automatski konačno rješenje
5. riješiti root cause gdje je moguće
6. ne uvoditi dodatni workaround ako postojeći problem može biti pravilno uklonjen
7. ažurirati ili ukloniti issue nakon provjerenog rješenja