# offers.md — Ponude

## 1. Svrha modula

Modul Ponude služi za izradu i evidenciju ponuda povezanih s rezervacijama.

Ponuda predstavlja financijski dokument kojim se gostu ili partneru iskazuju:

- usluge
- količine
- cijene
- popusti
- porezi
- ukupni iznos
- eventualni predujam
- rok valjanosti ponude
- dodatni tekst i uvjeti

Ponuda je dio poslovnog procesa:

```text
Rezervacija
↓
Ponuda
↓
Slanje ponude
↓
Uplata / bankovni izvod
↓
Potvrda rezervacije
```

Ponuda je također jedan od glavnih izvora podataka za buduće:

- povezivanje uplata
- potvrđivanje rezervacije
- financijske evidencije
- izvještaje

## 2. Status

**Status: Djelomično implementirano**

Trenutno postoji:

- izrada ponude iz rezervacije
- dohvat podataka rezervacije
- unos stavki ponude
- odabir usluga
- obračun stavki
- popust
- porez
- ukupni iznos
- predujam u postotku ili iznosu
- rok valjanosti ponude
- tekst na dnu ponude
- spremanje ponude i stavki
- pregled svih ponuda
- PDF komponenta ponude
- pripremljena evidencija je li ponuda poslana

Nisu dovršeni svi workflowi, posebno:

- automatski obračun smještaja iz cjenika
- dodavanje nove usluge iz forme ponude
- prikaz partnera na formi
- prikaz detalja postojeće ponude
- slanje ponude
- funkcionalni PDF endpoint / ispis
- konačna numeracija
- konačna pravila storna/brisanja

## 3. Glavne datoteke

Trenutna implementacija koristi najmanje:

```text
src/app/(dashboard)/ponude/
├── page.tsx
├── PonudeClient.tsx
└── nova/
    ├── page.tsx
    ├── NovaPonudaClient.tsx
    └── PonudaStavkeTable.tsx

src/components/
├── line-items/
│   └── ServiceCombobox.tsx
└── pdf/
    └── PonudaPDF.tsx

src/lib/actions/
└── offers.ts

src/lib/db/queries/
└── offers.ts

src/lib/db/schema/
├── offers.ts
├── offers_stavke.ts
├── services.ts
├── taxes.ts
├── reservations.ts
├── accommodations.ts
├── landlords.ts
├── partners.ts
├── cities.ts
└── pricelist.ts

src/lib/validations/
└── offer.ts
```

## 4. Glavne database tabele

Modul se primarno temelji na:

```text
offers
offers_stavke
```

Uz povezane tabele:

```text
reservations
accommodations
landlords
partners
services
taxes
cities
pricelist
```

## 5. `offers`

Ponuda trenutno sadrži:

- `id`
- `agencyId`
- `broj`
- `datum`
- `idRezervacija`
- `idPartner`
- `ponudaVrijedaDana`
- `doDatuma`
- `predujam`
- `predujamPostotak`
- `tekstNaDnu`
- `poslana`
- `createdAt`
- `updatedAt`

## 6. Ponuda pripada agenciji

Svaka ponuda ima:

`agencyId`

Trenutno se agency ID određuje preko:

```text
process.env.AGENCY_ID
```

To je privremeni single-agency mehanizam.

Budući SaaS mora tenant određivati iz runtime korisničkog konteksta.

## 7. Ponuda nastaje iz rezervacije

Trenutni workflow zahtijeva:

```text
/ponude/nova?rezervacijaId=<id>
```

Ako `rezervacijaId` nije dostavljen, stranica se ne prikazuje.

Ako rezervacija ne postoji ili nije dostupna trenutnoj agenciji, stranica se također ne prikazuje.

Ponuda se zato trenutno ne kreira kao samostalan dokument bez rezervacije.

## 8. Potvrđena rezervacija

Izrada nove ponude trenutno je blokirana ako rezervacija ima:

```text
status === "potvrdjena"
```

Provjera postoji prilikom otvaranja stranice nove ponude.

Korisnik se tada vraća prema modulu rezervacija.

Ovo odgovara trenutnom workflowu, ali prije nego se proglasi trajnim poslovnim pravilom treba potvrditi:

- smije li se za potvrđenu rezervaciju kasnije napraviti nova ili izmijenjena ponuda
- smije li postojati više verzija ponude
- treba li korekcija ponude biti novi dokument

## 9. Stornirana rezervacija

Dostavljeni source nove ponude eksplicitno provjerava status:

`potvrdjena`

ali ne vidi se posebna provjera:

`stornirana`

Prije produkcijske faze treba osigurati da se ponuda ne može kreirati za poslovno nedopuštenu rezervaciju samo zato što je njen osnovni status još `nepotvrdjena`.

Server-side poslovna validacija mora uzeti u obzir kompletno stanje rezervacije.

## 10. Podaci preuzeti iz rezervacije

Za formu ponude dohvaćaju se:

### Gost

- prezime
- ime
- telefon
- email

### Rezervacija

- ID rezervacije
- datum dolaska
- datum odlaska
- datum valjanosti rezervacije
- datum kreiranja rezervacije
- status

### Smještaj

- naziv apartmana

### Iznajmljivač

- ime
- prezime

### Partner

- `partnerId`

## 11. Podaci rezervacije su read-only

Na formi nove ponude podaci rezervacije prikazuju se kao kontekst.

Korisnik kroz formu ponude ne mijenja:

- gosta
- apartman
- iznajmljivača
- period boravka

Ako je rezervacija pogrešna, treba mijenjati odgovarajući izvorni poslovni podatak, a ne ponudu koristiti za korekciju rezervacije.

## 12. Partner

Ako rezervacija ima partnera, njegov ID prenosi se u ponudu:

```text
offers.idPartner
```

Trenutna forma prikazuje sam:

`partnerId`

umjesto naziva partnera.

To je nedovršeno UI ponašanje.

Konačni UI treba prikazivati poslovno razumljiv naziv partnera.

## 13. Partner ili gost kao primatelj ponude

PDF komponenta trenutno koristi sljedeće pravilo:

```text
ako postoji partner
→ primatelj je partner

inače
→ primatelj je gost
```

Za partnera PDF može prikazati:

- naziv
- adresu
- grad
- OIB
- email

Za gosta trenutno prikazuje:

- prezime
- ime
- email

## 14. Snapshot poslovnih podataka

Trenutna ponuda ne sprema kompletan snapshot:

- gosta
- partnera
- apartmana
- iznajmljivača

Ti podaci za prikaz i PDF trenutno se većinom dohvaćaju preko relacija.

Prije produkcijske faze poslovnih dokumenata treba definirati koje podatke ponuda mora trajno snapshotirati.

To je posebno važno ako se nakon izrade ponude kasnije promijeni:

- naziv partnera
- adresa
- OIB
- ime gosta
- naziv apartmana
- drugi podatak koji je bio dio originalnog dokumenta

Za financijske i poslovne dokumente vrijedi opće pravilo iz:

`docs/database.md`

## 15. Datum ponude

Nova ponuda trenutno kao početni datum koristi:

`reservations.createdAt`

Ako taj podatak ne postoji, koristi današnji datum.

To je **trenutna implementacija**, a ne potvrđeno trajno poslovno pravilo.

Treba naknadno odlučiti treba li datum nove ponude uvijek biti:

- datum stvarnog kreiranja ponude

ili

- neki datum izveden iz rezervacije.

Uobičajeno poslovno očekivanje bilo bi da nova ponuda dobije datum vlastitog nastanka, ali to treba potvrditi prije promjene.

## 16. Valjanost ponude

Ponuda podržava dva povezana podatka:

- broj dana valjanosti
- konkretan datum do kojeg ponuda vrijedi

Polja su:

```text
ponudaVrijedaDana
doDatuma
```

## 17. Početna vrijednost roka

Kod izrade ponude:

ako rezervacija ima:

`rezervationValid`

taj se datum koristi kao početni:

`doDatuma`

Ako ga nema, trenutna implementacija koristi:

```text
datum ponude + 2 dana
```

Broj dana valjanosti računa se iz ta dva datuma.

## 18. Međuovisnost roka valjanosti

Promjena:

`ponudaVrijedaDana`

automatski mijenja:

`doDatuma`

Vrijedi:

```text
doDatuma = datum + ponudaVrijedaDana
```

I obrnuto, promjena:

`doDatuma`

računa:

`ponudaVrijedaDana`

## 19. Stavke ponude

Svaka ponuda može imati više stavki.

Stavke se spremaju u:

`offers_stavke`

Svaka stavka trenutno sadrži:

- `serviceId`
- `serviceText`
- `dodatniOpis`
- `kolicina`
- `cijena`
- `rabat`
- `iznos`
- `taxId`
- `bruto`

## 20. Veza stavke i usluge

Svaka stavka mora biti povezana s uslugom preko:

`serviceId`

Usluge se dohvaćaju samo za trenutnu agenciju.

Usluga može definirati:

- naziv
- jedinicu mjere
- cijenu
- porez
- način obračuna
- obračun po osobi

## 21. Snapshot naziva usluge

Uz `serviceId`, stavka sprema:

`serviceText`

To je namjerno.

Razlog je da stavka poslovnog dokumenta zadrži tekst usluge kakav je bio u trenutku kreiranja dokumenta.

Promjena naziva usluge u šifrarniku ne bi trebala automatski promijeniti tekst već postojećeg poslovnog dokumenta.

## 22. Dodatni opis stavke

Svaka stavka može imati:

`dodatniOpis`

UI omogućuje otvaranje dodatnog textarea polja za konkretnu stavku.

Dodatni opis koristi se za detaljniji opis usluge bez potrebe za kreiranjem posebne usluge za svaki tekstualni detalj.

## 23. Line-item arhitektura

Stavke ponude namjerno nisu dio glavnog React Hook Form statea.

Trenutni pattern:

```text
RHF
└── header ponude

local useState
└── stavke ponude

useRef u parentu
└── aktualne stavke za submit

useState u parentu
└── sveukupno
```

Ovo je namjerna arhitekturna odluka.

## 24. Razlog za line-item pattern

Ranija implementacija kompleksnih stavki preko:

- `useFieldArray`
- root-level `watch`
- root-level `useWatch`

uzrokovala je preširoke re-rendere i gubitak fokusa tijekom unosa.

Zato postojeću arhitekturu ne mijenjati samo radi korištenja standardnog RHF `useFieldArray` patterna.

Opća pravila nalaze se u:

`docs/development-rules.md`

## 25. Root forma

Root forma ne smije pratiti kompletnu kolekciju stavki.

Stavke parent komponenti šalju aktualno stanje kroz:

`onChange`

Parent zatim:

- sprema stavke u `useRef`
- računa `sveukupno`

## 26. Numeric input

Brojčana polja stavke koriste lokalnu vrijednost inputa.

Promjena se prema parent stateu propagira tek u kontroliranom trenutku, umjesto pri svakom znaku unosa.

To pomaže spriječiti nepotrebne re-rendere i probleme s fokusom.

## 27. Nova stavka

Nova stavka trenutno počinje približno s:

```text
kolicina = 1
cijena = 0
rabat = 0
iznos = 0
taxId = null
taxStopa = 0
bruto = 0
```

Usluga još nije odabrana.

## 28. Dodavanje novog retka

Korisnik može dodati novi redak.

Međutim, novi redak nije moguće dodati dok posljednji postojeći redak nema odabranu uslugu.

Time se sprječava stvaranje niza praznih stavki.

## 29. Brisanje stavke

Stavka koja još nije zaseban povijesni poslovni dokument može se ukloniti iz forme prije spremanja ponude.

To nije isto što i fizičko brisanje već spremljene poslovne ponude.

## 30. Odabir usluge

`ServiceCombobox` omogućuje:

- prikaz dostupnih usluga
- pretraživanje po nazivu
- odabir mišem
- odabir prve filtrirane stavke tipkom Enter
- zatvaranje tipkom Escape

Kod odabira usluge u stavku se preuzimaju:

- `serviceId`
- naziv usluge
- cijena
- porez
- porezna stopa
- naziv poreza

## 31. Dodavanje nove usluge iz comboboxa

`ServiceCombobox` tehnički podržava callback:

`onAddNew`

i tada prikazuje:

`Dodaj novu uslugu`

Međutim, trenutni `NovaPonudaClient` ne prosljeđuje implementaciju tog callbacka prema `PonudaStavkeTable`.

Zato je mogućnost dodavanja nove usluge iz forme **pripremljena, ali trenutno nije funkcionalno povezana**.

Prije implementacije treba odlučiti:

- modal ili dialog
- potrebna polja usluge
- porez
- cijena
- način obračuna
- tenant ownership
- automatski odabir upravo kreirane usluge

## 32. Izračun neto iznosa stavke

Trenutna formula:

```text
iznos =
kolicina × cijena × (1 - rabat / 100)
```

`iznos` predstavlja vrijednost nakon popusta, prije poreza.

## 33. Izračun bruto iznosa stavke

Trenutna formula:

```text
bruto =
iznos × (1 + taxStopa / 100)
```

`bruto` predstavlja konačnu vrijednost stavke s porezom.

## 34. Porez

Porez se trenutno određuje preko odabrane usluge.

Usluga ima:

`taxId`

a porez definira:

- šifru
- naziv
- stopu

Porez nije slobodno upisivo tekstualno polje stavke.

## 35. Promjena cijene

Nakon odabira usluge početna cijena dolazi iz šifrarnika usluga.

Korisnik je trenutno može ručno promijeniti na stavci.

Zato cijena usluge predstavlja početnu/default vrijednost, a ne nužno nepromjenjivu cijenu svake ponude.

## 36. Popust

Svaka stavka ima:

`rabat`

Trenutni validation model predviđa raspon:

```text
0 – 100 %
```

Popust se primjenjuje prije poreza.

## 37. Sveukupno

Ukupni iznos ponude trenutno se dobiva kao:

```text
sveukupno =
zbroj bruto svih stavki
```

Sveukupno se ne sprema kao zasebno polje u `offers`.

Izvodi se iz stavki.

## 38. Predujam

Ponuda podržava:

- `predujamPostotak`
- `predujam`

Polja su međusobno povezana.

## 39. Promjena postotka predujma

Ako korisnik promijeni postotak:

```text
predujam =
sveukupno × predujamPostotak / 100
```

## 40. Promjena iznosa predujma

Ako korisnik promijeni iznos:

```text
predujamPostotak =
predujam / sveukupno × 100
```

Izračun se radi samo kada je `sveukupno > 0`.

## 41. Predujam i payment workflow

Predujam u ponudi predstavlja očekivani iznos uplate.

Sam unos predujma ne znači da je uplata izvršena.

Stvarna uplata pripada payment workflowu.

Odnos je:

```text
Ponuda
└── očekivani predujam

Payment
└── stvarno evidentirana uplata
```

Detaljna pravila pripadaju:

`docs/modules/payments.md`

## 42. Tekst na dnu ponude

Ponuda ima:

`tekstNaDnu`

Početna vrijednost može se dobiti iz:

```text
OFFER_FOOTER_TEXT
```

Tekst se može urediti za pojedinu ponudu prije spremanja.

To omogućuje kombinaciju:

- standardnog teksta agencije
- individualne prilagodbe dokumenta

## 43. Validacija headera

Header ponude koristi:

- React Hook Form
- Zod

Schema validira najmanje:

### Datum

obavezan

### Vrijedi dana

- cijeli broj
- najmanje 1
- može biti `null`

### Datum valjanosti

može biti `null`

### Predujam %

```text
0 – 100
```

ili `null`

### Predujam

ne može biti negativan

### Tekst na dnu

može biti `null`

## 44. Validacija stavki

Postoji:

`offerStavkaSchema`

koji definira validaciju stavke.

Međutim, u dostavljenom submit workflowu taj schema se ne koristi za ponovno validiranje cijele kolekcije stavki prije database inserta.

Trenutni submit eksplicitno provjerava samo:

```text
stavke.length > 0
```

Ovo treba doraditi.

Prije spremanja sve stavke trebaju biti server-side ili barem na pouzdanoj granici validirane prema pravilima poslovnog dokumenta.

## 45. Server-side validacija

`actionCreateOffer()` trenutno prima već pripremljene podatke ponude i stavki te ih prosljeđuje query sloju.

Dostavljeni action ne izvršava Zod validaciju prije database operacije.

To znači da je trenutna validacija previše oslonjena na client formu.

Za produkcijski sustav server mora biti authority.

Prije spremanja potrebno je server-side provjeriti najmanje:

- strukturu headera
- postojanje rezervacije
- tenant ownership rezervacije
- dopuštenost izrade ponude za trenutno stanje rezervacije
- postojanje usluga
- tenant ownership usluga
- ispravnost stavki
- nenegativne iznose
- porezne veze

## 46. Spremanje ponude

Trenutni workflow:

```text
header ponude
+
stavke iz useRef
↓
actionCreateOffer()
↓
createOffer()
↓
INSERT offers
↓
INSERT offers_stavke
↓
revalidate /rezervacije
↓
revalidate /ponude
↓
redirect /ponude
```

## 47. Atomicity spremanja

U sourceu postoji komentar:

`Spremi ponudu s stavkama (transakcija)`

ali stvarna implementacija izvršava:

1. insert u `offers`
2. zatim zaseban insert u `offers_stavke`

U dostavljenom kodu nema vidljive database transakcije koja obuhvaća oba koraka.

To znači da komentar trenutno ne odgovara stvarnoj implementaciji.

Ovo treba tretirati kao tehničko ograničenje koje treba provjeriti i riješiti prije produkcijskog korištenja.

Ne smije se pretpostaviti da je spremanje ponude i stavki atomarno.

## 48. Posljedica neatomarnog spremanja

Mogući scenarij:

```text
INSERT offers
✓ uspije

INSERT offers_stavke
✗ ne uspije
```

Tada može ostati ponuda bez očekivanih stavki.

Za poslovne dokumente takvo stanje nije poželjno.

Konačno rješenje mora koristiti odgovarajući transactional ili drugi pouzdani database pattern.

## 49. Automatski obračun smještaja

Forma sadrži dugme:

`Izračunaj smještaj`

ali ono trenutno nema implementiranu akciju.

To je planirana funkcionalnost.

## 50. Cjenik smještaja

Apartman ima periodični cjenik:

`pricelist`

s podacima:

- `dateFrom`
- `dateTo`
- `pricePerNight`
- `landlordPrice`

Budući `Izračunaj smještaj` treba koristiti:

- apartman rezervacije
- period rezervacije
- odgovarajuće cjenovne periode

i izračunati cijenu smještaja.

## 51. Obračun preko više cjenovnih perioda

Rezervacija može prelaziti preko više perioda cjenika.

Primjer:

```text
01.06. – 14.06. = jedna cijena
15.06. – 30.06. = druga cijena
```

Rezervacija:

```text
10.06. – 20.06.
```

ne smije se izračunati samo jednom jediničnom cijenom ako poslovna pravila cjenika zahtijevaju podjelu po periodima.

Konačan algoritam treba definirati prije implementacije `Izračunaj smještaj`.

## 52. Usluge imaju pravila obračuna

Schema usluge već sadrži:

`obracunavaSe`

s vrijednostima:

- `dnevno`
- `jednokratno`
- `ne_obracunava_se`

te:

`poOsobi`

To ukazuje da budući automatski obračun može ovisiti o:

- broju dana
- broju osoba
- jednokratnom obračunu

Ta pravila još nisu implementirana u trenutnom calculator workflowu.

Ne treba ih pretpostavljati bez zasebnog poslovnog definiranja.

## 53. Pregled ponuda

Ruta:

`/ponude`

prikazuje tablični pregled svih ponuda trenutne agencije.

Ponude se trenutno sortiraju:

```text
broj DESC
```

odnosno najveći broj ponude prvi.

## 54. Kolone pregleda

Trenutni pregled prikazuje najmanje:

- broj ponude
- datum ponude
- vrijedi do
- broj rezervacije
- prezime gosta
- ime gosta
- partnera
- iznajmljivača
- apartman
- period rezervacije
- cijenu
- predujam
- još jednu trenutačno praznu financijsku kolonu
- oznaku je li ponuda poslana

## 55. Cijena u pregledu

Cijena ponude u listi nije spremljeno header polje.

Query dohvaća sve stavke ponuda i za svaku ponudu računa:

```text
cijena =
zbroj offers_stavke.bruto
```

To odgovara principu da se sveukupna vrijednost izvodi iz stavki.

## 56. Status `poslana`

Ponuda ima boolean:

`poslana`

Default je:

```text
false
```

Pregled može prikazati oznaku je li ponuda poslana.

Međutim, u dostavljenom sourceu ne postoji dovršen workflow koji bi:

- poslao ponudu
- uspješno evidentirao slanje
- promijenio `poslana = true`

## 57. Dugme "Pošalji"

Pregled ponuda sadrži dugme:

`Pošalji`

ali ono trenutno nema funkcionalnu implementaciju.

Prije implementacije treba definirati:

- kome se šalje
- partneru ili gostu
- primarnu email adresu
- predmet poruke
- tekst poruke
- PDF attachment
- evidenciju uspješnog slanja
- evidenciju greške
- ponovno slanje
- treba li spremati datum slanja, a ne samo boolean

## 58. Dugme "Prikaži"

Pregled ponuda sadrži:

`Prikaži`

ali trenutni source nema implementiran handler.

Treba naknadno odlučiti otvara li:

- detaljni pregled ponude
- edit formu
- read-only document preview
- PDF preview

## 59. Dugme "Ispiši"

Trenutni `PonudeClient` pokušava otvoriti:

```text
/api/ponude/<offerId>/pdf
```

u novom browser tabu.

## 60. Trenutna PDF neusklađenost

Dostavljena komponenta:

```text
src/components/pdf/PonudaPDF.tsx
```

postoji.

Postoji i:

`getOfferForPdf()`

te Server Action:

`actionGetOfferForPdf()`.

Međutim, prema trenutnom stvarnom projektu:

```text
src/app/api/ponude/[id]/pdf/route.ts
```

**ne postoji**.

Zato trenutačni `Ispiši` workflow nije kompletan.

Ne dokumentirati tu API rutu kao postojeću dok stvarno ne bude implementirana.

## 61. PDF tehnologija

PDF komponenta koristi:

`@react-pdf/renderer`

Dokument se generira kao A4 PDF.

## 62. Podaci za PDF

PDF query dohvaća:

### Ponudu

- broj
- datum
- datum valjanosti
- predujam
- tekst na dnu

### Rezervaciju

- broj rezervacije
- gosta
- email gosta
- period

### Partnera

- naziv
- adresu
- grad
- OIB
- email

### Smještaj

- iznajmljivača
- apartman

### Stavke

- opis usluge
- dodatni opis
- jedinicu mjere
- količinu
- cijenu
- rabat
- iznos
- bruto

## 63. Podaci agencije u PDF-u

Trenutni `PonudaPDF.tsx` sadrži hardkodirane podatke agencije unutar source koda.

To uključuje:

- naziv
- adresu
- telefone
- email/web
- OIB/PDV broj
- IBAN

To je privremena implementacija i nije prihvatljiva kao konačni SaaS model.

Podaci agencije moraju se buduće dohvaćati iz tenant/agencies podataka ili odgovarajućih postavki.

## 64. Logo u PDF-u

Logo se trenutno dohvaća preko:

```text
NEXT_PUBLIC_APP_URL
```

i:

```text
/logo.png
```

Budući SaaS treba omogućiti tenant-specifičan branding ako je branding dio poslovnog zahtjeva.

## 65. Broj ponude u PDF-u

Trenutni PDF formatira broj kao:

```text
<broj>-<godina>
```

Primjer:

```text
15-2026
```

Godina se izvodi iz datuma ponude.

## 66. Konačna numeracija ponuda

Database trenutno koristi:

`bigserial`

za `offers.broj`.

To nije konačni plan numeracije.

Prije produkcije treba definirati numeraciju najmanje prema:

- agenciji
- vrsti dokumenta
- godini

Konačni prikaz treba biti usklađen s poslovnim i zakonskim zahtjevima.

## 67. Numeracija mora biti concurrency-safe

Budući SaaS bit će multi-user sustav.

Zato nije dovoljno nekontrolirano koristiti:

```text
MAX(broj) + 1
```

bez database zaštite.

Treba definirati mehanizam koji sprječava dva korisnika da istovremeno dobiju isti broj dokumenta.

## 68. Ponovni broj nakon storna

Prije konačne numeracije treba definirati:

- smije li stornirana ponuda zadržati broj
- smije li se broj ikada ponovno koristiti
- treba li postojati storno dokument
- treba li čuvati razlog storna
- audit trail

Broj poslovnog dokumenta ne treba reciklirati bez izričite poslovne i zakonske odluke.

## 69. PDF — model plaćanja

Trenutni PDF prikazuje:

```text
Model plaćanja: HR00 <broj ponude>
```

te:

```text
Način plaćanja: Transakcijski račun
```

To je trenutno implementirano ponašanje.

Prije produkcije treba provjeriti konačan model/reference format u kontekstu stvarnog payment workflowa i bankovne identifikacije uplate.

## 70. PDF — PDV kolona

PDF tablica trenutno ima kolonu:

`PDV`

ali dostavljeni PDF render u nju ne upisuje poreznu stopu.

Istovremeno stavke u bazi imaju `taxId`, a UI stavke porez prikazuje.

To je nedovršena PDF implementacija.

## 71. PDF — iznosi stavki

PDF računa:

```text
cijena s rabatom =
cijena × (1 - rabat / 100)

iznos stavke =
kolicina × cijena s rabatom
```

Sveukupno se, međutim, računa kao:

```text
zbroj bruto
```

Zbog toga kod poreznih stavki treba prije dovršetka PDF-a jasno definirati kolone i prikaz:

- neto
- porez
- bruto

kako pojedinačni redovi i ukupni iznos ne bi korisniku bili nejasni.

## 72. PDF — naziv kupca

Ako ponuda ima partnera, PDF ga tretira kao kupca.

Ako partnera nema, kupac je gost.

To treba potvrditi kao poslovno pravilo prije razvoja računa, jer:

`primatelj ponude`

i:

`kupac na budućem računu`

ne moraju nužno uvijek biti isti poslovni pojam.

## 73. Tenant isolation

Queryji ponuda trenutno koriste:

`offers.agencyId`

i rezervacija za novu ponudu dohvaća se s:

`reservations.agencyId = agencyId`.

Usluge se također dohvaćaju po:

`services.agencyId`.

To je dobar osnovni smjer.

## 74. Cross-tenant zaštita

Budući SaaS mora dodatno osigurati da povezani entiteti pripadaju istom tenant kontekstu:

```text
offer
├── reservation
├── partner
└── services
```

Server ne smije vjerovati samo ID vrijednostima poslanim s clienta.

## 75. Query layer

Query layer trenutno sadrži funkcije za:

- dohvat rezervacije za ponudu
- dohvat usluga
- spremanje ponude
- spremanje stavki
- dohvat liste ponuda
- dohvat podataka za PDF

Database logika treba ostati u:

`src/lib/db/queries/`

## 76. Server Action layer

Server Actions trenutno služe kao transport između UI-a i query sloja.

Action layer:

- dodaje trenutni `AGENCY_ID`
- poziva query funkcije
- radi revalidation nakon kreiranja ponude

Međutim, treba ga proširiti odgovarajućom server-side validation/business validation logikom.

## 77. Revalidation

Nakon kreiranja ponude revalidiraju se:

```text
/rezervacije
/ponude
```

Razlog je što nova ponuda može utjecati na poslovni prikaz rezervacije i mora se odmah pojaviti u evidenciji ponuda.

## 78. Poslana ponuda i izmjene

Prije implementacije uređivanja postojeće ponude treba definirati:

- smije li se mijenjati neposlana ponuda
- smije li se mijenjati već poslana ponuda
- treba li izmjena poslane ponude stvarati novu verziju
- treba li čuvati povijest verzija
- što ako je na osnovi ponude već evidentirana uplata

Ne implementirati obični CRUD edit bez tih odluka.

## 79. Fizičko brisanje ponude

Fizičko brisanje postojeće ponude nije dio trenutnog workflowa.

Ne uvoditi Delete samo radi kompletiranja CRUD-a.

Prije odluke treba uzeti u obzir:

```text
offer
├── reservation
├── offer items
├── payment
├── poslani PDF
└── buduće poslovne evidencije
```

Konačna odluka može koristiti:

- storno
- status
- soft delete
- ograničeno fizičko brisanje neposlanog nacrta

ovisno o poslovnim i zakonskim zahtjevima.

## 80. `offers_stavke` cascade

Veza:

```text
offers_stavke.offerId
→ offers.id
```

trenutno koristi:

`onDelete: cascade`

To je tehnički smisleno za child stavke koje nemaju neovisno poslovno značenje bez parent ponude.

To ipak ne znači da sama ponuda treba biti slobodno fizički brisiva.

## 81. Poznato nedovršeno

Trenutno treba dovršiti ili definirati najmanje:

- server-side validaciju ponude
- server-side validaciju stavki
- atomicity spremanja headera i stavki
- `Izračunaj smještaj`
- automatski obračun prema cjeniku
- pravila obračuna usluga
- dodavanje nove usluge iz forme
- prikaz naziva partnera na formi
- detaljni prikaz ponude
- slanje ponude
- evidenciju slanja
- funkcionalni PDF endpoint ili drugi PDF workflow
- PDV prikaz u PDF-u
- konačni prikaz neto/porez/bruto iznosa
- dinamičke podatke agencije u PDF-u
- konačnu numeraciju
- multi-user concurrency zaštitu
- ponašanje poslanih ponuda kod izmjene
- storno pravila
- odnos ponude i uplata

## 82. Trenutne tehničke neusklađenosti

Kod daljnjeg razvoja posebno uzeti u obzir:

### PDF endpoint

Client pokušava otvoriti API route koja trenutno ne postoji.

### "Transakcija"

Komentar u queryju govori o transakciji, ali stvarni insert headera i stavki nije obuhvaćen vidljivom database transakcijom.

### Stavke

`offerStavkaSchema` postoji, ali se trenutno ne koristi za pouzdanu validaciju kolekcije prije spremanja.

### Partner

Forma prikazuje ID umjesto naziva.

### Dodavanje usluge

Komponenta podržava `onAddNew`, ali parent trenutno ne spaja taj workflow.

### Izračun smještaja

Dugme postoji bez implementirane akcije.

### PDF PDV

Kolona postoji, ali vrijednost nije prikazana.

### Podaci agencije

PDF koristi hardkodirane podatke jedne agencije.

Ove stavke predstavljaju trenutno stanje sourcea, a ne trajnu arhitekturu.

## 83. Ne duplicirati line-item pravila

Detaljna generička implementacija line-item komponenti ne treba se dalje širiti kroz ovaj dokument.

Ovdje je dovoljno zabilježiti zašto postojeći pattern postoji.

Trajna arhitekturna pravila su u:

`docs/development-rules.md`

Kasnije se generički implementation pattern može izdvojiti u Claude Code skill.

## 84. Veze s ostalim modulima

Ponude su izravno povezane s:

```text
docs/modules/reservations.md
docs/modules/payments.md
```

te budućim modulima:

```text
voucher
invoices
commission
fiscalization
reports
```

Ponuda ne treba preuzimati poslovna pravila tih modula.

## 85. Granice modula

Ovaj dokument ne treba detaljno opisivati:

- pravila raspoloživosti apartmana
- kreiranje rezervacije
- uvoz bankovnog XML-a
- knjiženje uplate
- potvrđivanje rezervacije
- voucher
- stay
- račun gostu
- fiskalizaciju
- obračun provizije
- račun iznajmljivaču
- globalni design system

Za to koristiti odgovarajuću modulsku ili globalnu dokumentaciju.

## 86. Pravilo za buduće izmjene

Prije značajne izmjene modula Ponude:

1. pregledati ovaj dokument
2. pregledati stvarni source
3. provjeriti odnos s rezervacijom
4. provjeriti odnos s payment workflowom
5. provjeriti tenant ownership svih povezanih entiteta
6. server-side validirati poslovne podatke
7. sačuvati postojeći line-item architecture pattern
8. ne uvoditi `useFieldArray` bez analize problema koji je ranije riješen
9. osigurati atomicity poslovno povezanih database promjena
10. ne uvoditi fizičko brisanje bez zajedničke projektne odluke
11. ne hardkodirati tenant-specifične podatke u PDF
12. ažurirati ovaj dokument kada se promijene poslovna pravila ili važna arhitekturna odluka
