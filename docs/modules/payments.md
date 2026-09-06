# payments.md — Uplate i uvoz bankovnih izvoda

## 1. Svrha modula

Modul Uplate služi za:

- uvoz bankovnog izvoda
- pregled transakcija iz izvoda
- ručno povezivanje bankovne transakcije s rezervacijom
- automatsko određivanje povezane ponude
- knjiženje odabranih transakcija u trajnu evidenciju uplata

Modul je dio poslovnog procesa:

```text
Rezervacija
↓
Ponuda
↓
Gost / partner izvršava uplatu
↓
Banka
↓
CAMT.053 XML izvod
↓
Uvoz izvoda
↓
izvod_tmp
↓
Povezivanje s rezervacijom
↓
Knjiženje
↓
payments
↓
buduća potvrda rezervacije
```

Modul ne predstavlja kompletnu računovodstvenu evidenciju bankovnog računa.

Primarna svrha trenutne implementacije je evidentiranje uplata povezanih s rezervacijama.


## 2. Status

**Status: Djelomično implementirano**

Trenutno postoji:

- upload XML bankovnog izvoda
- parser CAMT.053 izvoda
- staging tabela `izvod_tmp`
- prikaz stavki izvoda
- prikaz uplata i terećenja
- filter „Prikaži samo uplate“
- ručno povezivanje stavke s rezervacijom
- automatsko određivanje ponude povezane s rezervacijom
- trajna tabela `payments`
- knjiženje povezanih stavki
- zaštita od ponovnog knjiženja iste bankovne transakcije preko `bankRef`

Nisu dovršeni svi poslovni workflowi, posebno:

- automatsko povezivanje preko poziva na broj
- automatska potvrda rezervacije nakon dovoljne uplate
- obrada djelomičnih uplata
- obrada više uplata za istu rezervaciju
- obrada preplate
- obrada povrata
- konačna pravila za negativne transakcije
- payment status rezervacije
- povezivanje s voucher workflowom


## 3. Glavne datoteke

Trenutna implementacija koristi:

```text
src/app/(dashboard)/unos_izvoda/

src/components/unos_izvoda/

src/lib/actions/
└── izvod.ts

src/lib/db/queries/
└── izvod-tmp.ts

src/lib/db/schema/
├── izvod_tmp.ts
└── payments.ts

src/lib/utils/
└── parse-camt053.ts
```

Modul također koristi postojeći reservation query/action sloj za izbor rezervacije i povezivanje s ponudom.


## 4. Dva nivoa podataka

Modul namjerno koristi dvije različite tabele:

```text
izvod_tmp
↓
privremeni staging

payments
↓
trajna evidencija
```

Te dvije tabele nemaju istu svrhu.


## 5. `izvod_tmp`

`izvod_tmp` služi kao privremeni radni prostor za trenutno učitani bankovni izvod.

Sadrži podatke potrebne da korisnik:

- pregleda transakcije
- pronađe relevantne uplate
- poveže ih s rezervacijama
- odluči koje će transakcije knjižiti


## 6. `payments`

`payments` predstavlja trajnu evidenciju proknjiženih bankovnih transakcija.

Tek nakon akcije knjiženja relevantna stavka iz staginga postaje trajni payment zapis.

Zato:

```text
postoji u izvod_tmp
≠
uplata je proknjižena
```

dok:

```text
postoji u payments
=
transakcija je evidentirana u trajnoj poslovnoj evidenciji
```


## 7. Osnovni workflow

Trenutni workflow je:

```text
1. korisnik odabere XML izvod
2. XML se parsira
3. prethodni staging podaci agencije se brišu
4. novi izvod se sprema u izvod_tmp
5. stavke se prikažu korisniku
6. korisnik povezuje relevantne stavke s rezervacijama
7. aplikacija određuje povezanu ponudu
8. korisnik klikne Proknjiži
9. povezane stavke spremaju se u payments
```


## 8. Format bankovnog izvoda

Parser je napravljen za:

```text
camt.053.001.08
```

odnosno CAMT.053 bankovni izvod.

Parser koristi biblioteku:

`fast-xml-parser`


## 9. XML namespace

Parser koristi:

```text
removeNSPrefix: true
```

Zato XML element:

```text
<ns:Tag>
```

može biti obrađen kao:

```text
<Tag>
```

Parser time nije vezan uz konkretan XML namespace prefix.


## 10. Obavezna struktura izvoda

Parser očekuje:

```text
Document
└── BkToCstmrStmt
    └── Stmt
```

Ako `Stmt` ne postoji, parser prekida obradu s greškom:

```text
Neispravan format izvoda:
nedostaje Document/BkToCstmrStmt/Stmt
```

To je osnovna provjera da je učitana datoteka očekivanog tipa.


## 11. Broj izvoda

Broj izvoda čita se iz:

```text
Stmt.LglSeqNb
```

Ako `LglSeqNb` nedostaje ili se ne može pretvoriti u valjani broj, parser prekida obradu.

Broj izvoda zato nije generiran u aplikaciji nego dolazi iz bankovnog XML-a.


## 12. Stavke izvoda

Bankovne transakcije čitaju se iz:

```text
Stmt.Ntry
```

Parser podržava slučaj:

- jedne `Ntry` stavke
- više `Ntry` stavki

pomoću interne normalizacije objekta u array.


## 13. Normalizirani podatak transakcije

Parser svaku stavku pretvara u:

```typescript
type ParsedIzvodEntry = {
  year: string;
  brojIzvoda: number;
  bankRef: string;
  datum: string;
  platitelj: string;
  pozivNaBroj: string | null;
  opisPlacanja: string | null;
  uplaceno: number;
};
```


## 14. Godina

Godina se trenutno izvodi iz datuma transakcije:

```text
year = datum.slice(0, 4)
```

Dakle, ne čita se kao posebno XML polje.


## 15. Datum transakcije

Parser prvo pokušava koristiti:

```text
Ntry.ValDt.Dt
```

Ako taj podatak nije dostupan, koristi:

```text
Ntry.BookgDt.DtTm
```

i uzima prvih 10 znakova.

Rezultat je ISO datum:

```text
yyyy-mm-dd
```


## 16. Bankovna referenca

Jedinstvena bankovna referenca čita se iz:

```text
Ntry.AcctSvcrRef
```

i sprema kao:

`bankRef`

To je ključni tehnički identifikator bankovne transakcije.


## 17. `bankRef` je obavezan

Ako transakcija nema:

`AcctSvcrRef`

parser prekida obradu s greškom.

Razlog je što bez tog podatka aplikacija ne može pouzdano jedinstveno identificirati bankovnu transakciju.


## 18. Zaštita od dvostrukog knjiženja

`payments` koristi jedinstvenost:

```text
agencyId + bankRef
```

To znači da ista bankovna transakcija ne smije biti dva puta proknjižena za istu agenciju.

Ovo je važna database zaštita i ne smije se zamijeniti samo client-side provjerom.


## 19. Multi-tenant značenje `bankRef`

`bankRef` nije globalno unique za cijelu SaaS bazu.

Jedinstvenost mora biti scoped na agenciju:

```text
(agency_id, bank_ref)
```

jer različite agencije predstavljaju različite tenant kontekste.


## 20. Uplate i terećenja

Parser čita:

`CdtDbtInd`

i razlikuje:

```text
CRDT
DBIT
```


## 21. Predznak iznosa

Trenutno vrijedi:

```text
CRDT
→ pozitivan iznos

DBIT
→ negativan iznos
```

Formula:

```text
CRDT → amount
DBIT → -amount
```

Zato jedno polje:

`uplaceno`

može sadržavati i pozitivne i negativne vrijednosti.


## 22. Značenje negativnog iznosa

Negativan iznos trenutno predstavlja debitnu bankovnu transakciju.

To ne znači automatski:

- povrat gostu
- storno uplate
- trošak rezervacije

Točna poslovna interpretacija negativnih stavki još nije definirana.


## 23. Prikaz negativnih stavki

UI negativne transakcije vizualno razlikuje svijetlocrvenom pozadinom.

To je prezentacijska pomoć korisniku.

Boja nema poslovno značenje u bazi.


## 24. Filter „Prikaži samo uplate“

UI ima checkbox:

`Prikaži samo uplate`

koji je početno uključen.

Kada je uključen, korisnik prvenstveno vidi pozitivne transakcije relevantne za workflow uplata.

Negativne stavke nisu uklonjene iz izvoda; samo se filtriraju u prikazu.


## 25. Platitelj

Ime druge strane transakcije izvodi se ovisno o:

`CdtDbtInd`.

Za:

```text
CRDT
```

parser koristi dužnika:

```text
RltdPties.Dbtr
```

Za:

```text
DBIT
```

koristi vjerovnika:

```text
RltdPties.Cdtr
```


## 26. Nedostajući naziv platitelja

Parser pokušava pročitati:

```text
Pty.Nm
```

ili:

```text
Nm
```

Ako naziv nije dostupan, koristi:

```text
NEPOZNAT
```

Zato nedostatak naziva platitelja sam po sebi ne prekida uvoz izvoda.


## 27. Poziv na broj

Poziv na broj čita se iz:

```text
NtryDtls
└── TxDtls
    └── RmtInf
        └── Strd
            └── CdtrRefInf
                └── Ref
```

Ako podatak ne postoji:

```text
pozivNaBroj = null
```


## 28. Opis plaćanja

Opis plaćanja čita se iz:

```text
RmtInf.Strd.AddtlRmtInf
```

Ako ne postoji:

```text
opisPlacanja = null
```


## 29. `TxDtls` ograničenje

Jedan `Ntry` prema CAMT modelu može sadržavati više:

`TxDtls`

zapisa.

Trenutni parser namjerno uzima samo:

```text
prvi TxDtls
```

jer je napravljen prema izvodima kod kojih jedna `Ntry` stavka odgovara jednoj transakciji.

To je važno ograničenje trenutne implementacije.


## 30. Batched bankovne stavke

Ako buduća banka ili format izvoda počne dostavljati više transakcija unutar jedne `Ntry` stavke, trenutni parser ih neće sve zasebno obraditi.

Prije podrške takvom izvodu treba prilagoditi parser.

Ne pretpostavljati da trenutni parser potpuno podržava sve moguće CAMT.053 varijante.


## 31. Učitavanje XML datoteke

Korisnik na stranici:

```text
/unos_izvoda
```

odabire XML datoteku.

Sadržaj XML-a šalje se Server Actionu:

`actionUcitajIzvod()`


## 32. `actionUcitajIzvod`

Server Action:

1. prima XML sadržaj
2. poziva `parseCamt053()`
3. dodaje trenutni `agencyId`
4. priprema podatke za `izvod_tmp`
5. sprema novi staging sadržaj
6. vraća rezultat UI-u


## 33. Tenant ownership pri uvozu

Parser sam ne poznaje agenciju.

`agencyId` dodaje caller.

To je ispravno razdvajanje odgovornosti:

```text
parseCamt053
→ razumije bankovni XML

Server Action / business layer
→ razumije tenant kontekst
```


## 34. Zamjena staging sadržaja

Prije spremanja novog izvoda brišu se postojeći:

`izvod_tmp`

redovi trenutne agencije.

Nakon toga se sprema novi izvod.

Zato staging trenutno predstavlja:

```text
jedan aktualno učitani radni skup po agenciji
```

a ne arhivu svih ranije učitanih izvoda.


## 35. `izvod_tmp` nije arhiva

Ne koristiti `izvod_tmp` za:

- povijest bankovnih izvoda
- dokaz ranijeg uvoza
- trajnu financijsku evidenciju
- audit trail

Za trajno evidentirane transakcije služi:

`payments`


## 36. Posljedica učitavanja novog izvoda

Učitavanje novog izvoda uklanja prethodni staging sadržaj trenutne agencije.

Ako korisnik nije proknjižio ili na drugi način obradio relevantne stavke prethodnog staginga, te stavke više neće biti dostupne u `izvod_tmp`.

To je trenutno očekivano ponašanje sourcea.


## 37. Atomicity zamjene staginga

Workflow:

```text
DELETE stari izvod_tmp
↓
INSERT novi izvod_tmp
```

treba promatrati kao jednu poslovnu operaciju.

Ako između te dvije operacije nastane greška, postoji mogućnost da stari staging bude uklonjen, a novi ne bude potpuno spremljen.

Prije produkcijskog korištenja treba provjeriti kako osigurati pouzdanu zamjenu staging sadržaja.


## 38. UI tablica izvoda

Nakon učitavanja izvod se prikazuje u tablici.

Tablica omogućuje korisniku pregled najmanje:

- broja izvoda
- datuma
- platitelja
- poziva na broj
- opisa plaćanja
- iznosa
- povezane rezervacije
- povezane ponude


## 39. Povezivanje s rezervacijom

Korisnik ručno odabire rezervaciju za relevantnu bankovnu transakciju.

To je namjerno ručni korak trenutnog workflowa.

Bankovna transakcija sama po sebi trenutno ne potvrđuje automatski kojoj rezervaciji pripada.


## 40. Rezervacije dostupne za povezivanje

Combobox rezervacija koristi reservation podatke pripremljene za payment workflow.

Trenutni reservation query za ovaj workflow vraća samo rezervacije koje imaju barem jednu ponudu.

Razlog je poslovna pretpostavka:

```text
rezervacija bez ponude
→ nije dobila payment instructions
→ nije očekivana u ovom payment workflowu
```


## 41. Podaci u reservation comboboxu

Za rezervaciju su dostupni podaci poput:

- ID rezervacije
- rednog broja
- gosta
- perioda
- predujma


## 42. Povezivanje s ponudom

Korisnik bira:

`rezervaciju`

a ne izravno:

`ponudu`.

Povezana ponuda određuje se na osnovi rezervacije.


## 43. Više ponuda za istu rezervaciju

Reservation query koristi najnoviju ponudu povezanu s rezervacijom za podatke relevantne payment workflowu.

To znači da trenutni model implicitno favorizira:

```text
najnoviju ponudu rezervacije
```

Ako je za jednu rezervaciju moguće imati više važećih ili poslanih ponuda, prije produkcije treba definirati koja ponuda paymentu stvarno pripada.


## 44. Kolona „Ponuda“

UI kolona:

`Ponuda`

je read-only.

Korisnik ne bira ponudu neovisno.

Ona se automatski popunjava na osnovi odabrane rezervacije.


## 45. Zašto se rezervacija bira ručno

Bankovni podaci mogu biti nepotpuni ili netočni:

- gost može pogrešno upisati poziv na broj
- platitelj može biti druga osoba
- partner može izvršiti uplatu
- opis može biti nejasan

Zato trenutni workflow ne oslanja knjiženje isključivo na tekst iz bankovnog izvoda.


## 46. Buduće automatsko povezivanje

`pozivNaBroj` već se čuva u stagingu.

To omogućuje buduću funkcionalnost:

```text
poziv na broj
↓
pokušaj pronalaska ponude
↓
ponuda
↓
rezervacija
```

Međutim, automatsko povezivanje trenutno nije potvrđeno kao implementirano.

Ne treba ga dokumentirati kao postojeću funkcionalnost.


## 47. Automatsko povezivanje mora biti sigurno

Ako se kasnije uvede automatsko povezivanje, rezultat ne treba prihvatiti samo zato što postoji tekstualna sličnost.

Potrebno je provjeriti najmanje:

- tenant
- format reference
- postojanje ponude
- rezervaciju
- očekivani iznos
- status ponude/rezervacije

Za nejasne slučajeve korisnik mora zadržati mogućnost ručne potvrde.


## 48. Knjiženje

Nakon povezivanja korisnik pokreće akciju:

`Proknjiži`

Tada se relevantne staging stavke prenose u:

`payments`


## 49. Što se knjiži

Trenutni workflow knjiži samo stavke koje imaju povezanu rezervaciju.

Nepovezana stavka bankovnog izvoda ostaje izvan `payments` evidencije ovog modula.


## 50. Poslovno značenje nepovezane stavke

Nepovezana bankovna stavka ne znači da transakcija ne postoji.

Znači samo:

```text
nije povezana s rezervacijom
i
nije evidentirana kao payment ovog poslovnog workflowa
```

To je važna razlika.


## 51. Podaci trajnog payment zapisa

`payments` čuva podatke bankovne transakcije potrebne za trajnu evidenciju, uključujući vezu s:

- agencijom
- rezervacijom
- bankovnom referencom
- datumom
- platiteljem
- pozivom na broj
- opisom
- iznosom

To omogućuje da payment ostane evidentiran i nakon što se `izvod_tmp` očisti.


## 52. Payment i ponuda

Trenutni payment workflow poslovno koristi ponudu za:

- očekivani predujam
- identifikaciju očekivane uplate
- prikaz povezane ponude

Međutim, trajni payment primarno je povezan s rezervacijom.

Prije budućih proširenja treba odlučiti treba li `payments` imati i izravni FK na konkretnu ponudu ako jedna rezervacija može imati više ponuda.


## 53. Očekivani i stvarni iznos

Ponuda sadrži očekivani:

`predujam`

Bankovni izvod sadrži stvarni:

`uplaceno`

To su dva različita podatka.

Nikada ih ne poistovjećivati.


## 54. Primjer

Ponuda:

```text
Ukupno: 1.000 EUR
Predujam: 300 EUR
```

Bankovni izvod:

```text
Uplaćeno: 300 EUR
```

znači da je očekivani predujam vjerojatno podmiren.

Ali ako izvod sadrži:

```text
Uplaćeno: 200 EUR
```

payment i dalje postoji.

Samo poslovno stanje rezervacije više nije isto.


## 55. Djelomične uplate

Trenutni source omogućuje trajno evidentiranje paymenta, ali nema kompletno definiranu logiku:

```text
koliko je ukupno uplaćeno
vs.
koliko se očekuje
```

To treba implementirati kao agregat nad payment zapisima, a ne kao jednostavan boolean.


## 56. Više uplata za rezervaciju

Model mora podržavati scenarij:

```text
uplata 1 = 100 EUR
uplata 2 = 200 EUR
```

za istu rezervaciju.

Tada:

```text
ukupno uplaćeno = 300 EUR
```

Svaka bankovna transakcija mora ostati zaseban `payments` zapis.


## 57. Ne spajati bankovne transakcije

Više uplata iste rezervacije ne treba fizički spajati u jedan payment zapis.

Bankovna transakcija je zaseban događaj i treba sačuvati vlastiti:

- `bankRef`
- datum
- iznos
- platitelja
- opis


## 58. Potvrda rezervacije

Trenutni poslovni plan predviđa:

```text
uplata
↓
potvrda rezervacije
```

ali automatska potvrda rezervacije nakon knjiženja paymenta još nije kompletno implementirana.


## 59. Buduće pravilo potvrde

Prije implementacije treba definirati što je dovoljno za potvrdu:

```text
ukupno pozitivnih uplata
-
eventualni povrati
>=
potrebni predujam
```

ili neko drugo poslovno pravilo.

Ne koristiti samo:

```text
postoji payment
```

kao dokaz da je rezervacija u cijelosti spremna za potvrdu.


## 60. Race condition kod potvrde

Kada se jednom implementira automatska potvrda rezervacije, neposredno prije promjene statusa ponovno treba provjeriti:

- postoji li konkurentska potvrđena rezervacija
- postoji li stay
- je li termin još raspoloživ

Payment ne smije zaobići availability pravila modula rezervacija.


## 61. Konkurentske rezervacije

Projekt dopušta više nepotvrđenih rezervacija za isti apartman i termin.

Zato je moguće:

```text
Rezervacija A
→ ponuda A

Rezervacija B
→ ponuda B

isti apartman / isti termin
```

Ako gost A uplati, potvrda rezervacije A može utjecati na rezervaciju B.

To mora biti riješeno u reservation confirmation workflowu, ne u XML parseru.


## 62. Preplata

Ako:

```text
uplaćeno > očekivani predujam
```

payment se ne smije odbaciti ili automatski smanjiti.

Bankovni iznos mora ostati vjeran stvarnoj transakciji.

Poslovna interpretacija razlike mora se rješavati zasebno.


## 63. Povrati

Negativna bankovna transakcija može potencijalno predstavljati povrat, ali trenutni source ne definira takvo pravilo.

Prije implementacije povrata treba odlučiti:

- veže li se povrat na originalni payment
- veže li se na rezervaciju
- kako utječe na ukupno uplaćeno
- kako utječe na status rezervacije
- treba li čuvati razlog povrata


## 64. Storno paymenta

Ne uvoditi fizičko brisanje paymenta kao uobičajeni način ispravka.

Payment predstavlja stvarnu bankovnu transakciju.

Ako je pogrešno povezan s rezervacijom, treba definirati audit-safe način korekcije.


## 65. Brisanje paymenta

Konačna politika brisanja još nije definirana.

To je dio zajedničke cross-module odluke o:

- fizičkom brisanju
- soft deleteu
- stornu
- audit trailu
- zakonskom čuvanju podataka

Ne implementirati Delete samo radi kompletnog CRUD-a.


## 66. Brisanje staging podataka

`izvod_tmp` je drugačiji slučaj.

Budući da je staging privremen, njegovo fizičko brisanje je normalni dio trenutnog workflowa.

Dakle:

```text
DELETE izvod_tmp
```

nije isto poslovno pitanje kao:

```text
DELETE payments
```


## 67. Server-side authority

Client ne smije biti authority za knjiženje.

Server prije stvaranja payment zapisa treba provjeriti najmanje:

- tenant
- staging zapis
- rezervaciju
- tenant ownership rezervacije
- `bankRef`
- postoji li payment s istom referencom
- iznos
- ostale podatke koji utječu na poslovnu konzistentnost


## 68. Duplicate zaštita

Database unique constraint nad:

```text
(agency_id, bank_ref)
```

ostaje konačna zaštita od dvostrukog knjiženja.

Client može upozoriti korisnika, ali client provjera nije dovoljna zbog race conditiona.


## 69. Ponovni uvoz istog izvoda

Isti XML izvod može se ponovno učitati u staging.

To samo po sebi nije problem jer je `izvod_tmp` privremeni radni prostor.

Problem nastaje tek ako se ista bankovna transakcija pokuša ponovno proknjižiti.

Tada `payments` unique zaštita mora spriječiti duplikat.


## 70. Staging i već proknjižene stavke

Ako se isti izvod ponovno učita, staging može ponovno sadržavati transakciju koja već postoji u `payments`.

UI bi u budućnosti trebao jasno označiti takvu stavku kako korisnik ne bi nepotrebno pokušavao ponovno knjiženje.

Database zaštita i dalje ostaje obavezna.


## 71. Error handling parsera

Parser eksplicitno prekida uvoz ako:

- ne postoji očekivani `Stmt`
- nema valjanog `LglSeqNb`
- stavka nema `AcctSvcrRef`

To su trenutno definirane fatalne greške XML-a.


## 72. Tolerantna XML polja

Parser dopušta nedostatak nekih podataka:

```text
platitelj
→ "NEPOZNAT"

pozivNaBroj
→ null

opisPlacanja
→ null
```

Takva stavka i dalje može biti uvezena.


## 73. Datum i iznos — dodatna validacija

Dostavljeni parser izravno pretvara iznos pomoću:

```text
Number(...)
```

i datum uzima iz `ValDt` ili `BookgDt`.

Ne vidi se dodatna eksplicitna provjera:

- je li `amount` stvarno valjan broj
- postoji li datum ako nedostaju oba izvora
- je li `CdtDbtInd` samo CRDT ili DBIT

To treba razmotriti prije podrške nepoznatim bankama ili različitim CAMT varijantama.


## 74. Valuta

Trenutni `ParsedIzvodEntry` nema polje valute.

Parser čita brojčani iznos, ali ne prenosi currency atribut iz `Amt`.

To znači da trenutni payment workflow implicitno radi bez zasebnog currency podatka po transakciji.

Ako sustav treba podržati više valuta, ovo će trebati proširiti.


## 75. Jedan statement

Parser trenutno dohvaća:

```text
Document.BkToCstmrStmt.Stmt
```

kao jedan statement.

Nema posebne logike za više `Stmt` elemenata u jednoj XML datoteci.

Ako banka takav format bude koristila, parser treba proširiti.


## 76. Tenant isolation

Trenutno:

- `izvod_tmp` pripada agenciji
- `payments` pripada agenciji
- rezervacije pripadaju agenciji

Budući SaaS mora osigurati da korisnik nikada ne može povezati staging transakciju jednog tenanta s rezervacijom drugog tenanta.


## 77. `AGENCY_ID`

Trenutni single-agency projekt koristi:

```text
process.env.AGENCY_ID
```

Budući SaaS mora ga zamijeniti tenant kontekstom autentificiranog korisnika.


## 78. Query layer

Database operacije modula trebaju ostati u:

```text
src/lib/db/queries/
```

Query layer je odgovoran za:

- staging podatke
- povezivanje staging zapisa
- trajne payment zapise
- duplicate provjere gdje su potrebne


## 79. Server Action layer

Server Actions koordiniraju:

- parser
- tenant kontekst
- query funkcije
- rezultate prema UI-u

Parser ne smije sadržavati database logiku.


## 80. Parser layer

`parse-camt053.ts` ima samo jednu odgovornost:

```text
CAMT.053 XML
↓
normalizirani ParsedIzvodEntry[]
```

Ne treba u parser dodavati:

- queryje
- rezervacije
- ponude
- tenant logiku
- potvrdu rezervacije


## 81. Payment nije isto što i bankovni izvod

Važno terminološko pravilo:

**Izvod** je dokument banke.

**Stavka izvoda** je bankovna transakcija pronađena u tom dokumentu.

**Payment / uplata** je trajno evidentirana transakcija relevantna poslovnom procesu aplikacije.

Ta tri pojma ne koristiti kao sinonime.


## 82. Payment nije isto što i predujam

**Predujam na ponudi** predstavlja očekivani iznos.

**Payment** predstavlja stvarnu bankovnu transakciju.

Primjer:

```text
Ponuda.predujam = 300 EUR

Payment 1 = 100 EUR
Payment 2 = 200 EUR
```

Tek agregat paymenta daje stvarno stanje uplate.


## 83. Payment nije status rezervacije

Payment zapis ne treba sadržavati poslovnu interpretaciju tipa:

```text
rezervacija potvrđena
```

To pripada reservation workflowu.

Payment modul treba dati pouzdane financijske činjenice na osnovi kojih reservation business logic može donijeti odluku.


## 84. Poznato nedovršeno

Trenutno treba definirati ili dovršiti najmanje:

- automatsko povezivanje preko poziva na broj
- prikaz već proknjiženih transakcija kod ponovnog uvoza
- djelomične uplate
- više uplata
- preplate
- povrate
- negativne transakcije
- konačnu logiku ukupno uplaćenog
- pravilo dovoljne uplate
- potvrdu rezervacije nakon uplate
- availability recheck pri potvrdi
- odnos paymenta prema konkretnoj ponudi
- više ponuda za jednu rezervaciju
- eventualnu valutu transakcije
- više `TxDtls` unutar `Ntry`
- više `Stmt` u jednom XML-u
- dodatnu validaciju XML iznosa i datuma
- atomicity zamjene staginga
- audit-safe korekcije pogrešno povezanih uplata


## 85. Posebno provjeriti prije produkcije

### `TxDtls`

Parser trenutno koristi samo prvi `TxDtls`.


### Valuta

Ne prenosi se u normalizirani payment podatak.


### Staging replacement

Brisanje starog i spremanje novog staginga treba biti pouzdana cjelina.


### Duplicate payment

Unique `(agency_id, bank_ref)` mora ostati database constraint.


### Reservation confirmation

Knjiženje paymenta ne smije automatski potvrditi rezervaciju bez ponovne server-side provjere raspoloživosti.


### Više ponuda

Treba definirati kojoj konkretnoj ponudi pripada uplata kada rezervacija ima više ponuda.


## 86. Veze s ostalim modulima

Payment modul izravno je povezan s:

```text
docs/modules/reservations.md
docs/modules/offers.md
```

i budućim:

```text
voucher
stays
invoices
reports
```


## 87. Granice modula

Ovaj dokument ne treba detaljno definirati:

- pravila kreiranja rezervacije
- availability apartmana
- izračun ponude
- cjenik
- voucher
- check-in
- eVisitor
- račun gostu
- proviziju agencije
- račun iznajmljivaču
- fiskalizaciju

Payment modul treba ostati fokusiran na:

```text
bankovna transakcija
↓
identifikacija
↓
povezivanje
↓
trajna evidencija
```


## 88. Pravilo za buduće izmjene

Prije značajne izmjene payment modula:

1. pregledati ovaj dokument
2. pregledati stvarni source
3. provjeriti stvarni CAMT.053 format banke
4. sačuvati originalni `bankRef`
5. ne oslanjati duplicate zaštitu samo na client
6. tenant-scopeati sve queryje
7. ne poistovjećivati očekivani predujam sa stvarnom uplatom
8. ne potvrđivati rezervaciju bez server-side business provjere
9. ne fizički brisati trajne payment zapise bez zajedničke projektne odluke
10. staging tretirati kao privremene podatke
11. parser držati odvojenim od poslovne i database logike
12. ažurirati ovaj dokument kada se promijeni XML format ili payment workflow