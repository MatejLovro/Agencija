# development-rules.md — Arhitektura i razvojna pravila

## 1. Svrha dokumenta

Ovaj dokument definira trajna tehnička i arhitekturna pravila projekta.

Pravila vrijede za postojeće i nove module, osim ako dokumentacija pojedinog modula izričito definira opravdanu iznimku.

Specifična poslovna pravila pojedinih modula ne pripadaju u ovaj dokument. Ona se dokumentiraju u `docs/modules/`.

## 2. Tech stack

Glavni tehnološki stack:

- Next.js 15+ — App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Drizzle ORM
- PostgreSQL
- Neon PostgreSQL
- Zod v4
- React Hook Form
- `@hookform/resolvers`

Dodatne trenutno korištene biblioteke:

- `@react-pdf/renderer` — generiranje PDF dokumenata
- `fast-xml-parser` — parsiranje XML dokumenata

Planirana autentikacija:

- Better Auth

Nove biblioteke ne uvoditi bez stvarne potrebe.

Prije instalacije nove biblioteke provjeriti može li se zahtjev kvalitetno riješiti postojećim stackom.

## 3. Osnovna arhitektura

Next.js aplikacija ima dvostruku ulogu:

- korisničko web sučelje
- serverski/backend sloj aplikacije

Poslovna i database logika mora biti odvojena od transportnog i prezentacijskog sloja.

## 4. Database pristup

Drizzle ORM je standardni način pristupa PostgreSQL bazi.

Direktni Drizzle queryji ne smiju se pisati u:

- React komponentama
- Server Actions
- API route handlerima

Database queryji pripadaju u:

`src/lib/db/queries/`

Server Actions i API route handleri koriste funkcije iz query sloja.

Cilj je da:

- query sloj bude centralno mjesto za pristup podacima
- UI ne poznaje detalje baze
- poslovna pravila ne budu nepotrebno duplicirana
- buduće promjene baze imaju što manji utjecaj na ostatak aplikacije

## 5. Server Actions

Server Actions pripadaju u:

`src/lib/actions/`

Server Action:

1. prima podatke iz UI-a
2. provodi potrebnu validaciju
3. poziva query/business funkcije
4. vraća rezultat UI-u

Server Action ne smije sadržavati direktne Drizzle queryje.

Za očekivane rezultate Server Actions koristiti imenovane TypeScript discriminated union tipove kada to poboljšava jasnoću i type safety.

Očekivane poslovne greške treba vratiti kontrolirano, a ne tretirati ih kao neočekivane sistemske exceptione.

## 6. Validacija

Zod je standardna biblioteka za validaciju podataka.

Validacijske sheme pripadaju u:

`src/lib/validations/`

Validaciju treba provoditi na odgovarajućem serverskom boundaryju čak i kada je ista ili slična validacija već provedena u browseru.

Client-side validacija služi prvenstveno korisničkom iskustvu i ne smatra se sigurnosnom granicom.

Poslovne validacije koje zahtijevaju pristup bazi provode se na serveru neposredno prije promjene podataka.

## 7. Organizacija source koda

Trenutna osnovna struktura projekta:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── <module>/
│
├── lib/
│   ├── actions/
│   ├── db/
│   │   ├── schema/
│   │   ├── queries/
│   │   └── index.ts
│   ├── validations/
│   └── utils/
│
└── types/
```

Ne reorganizirati postojeću strukturu bez konkretnog razloga.

Novi kod treba slijediti postojeći obrazac osim ako se prije implementacije donese odluka o promjeni arhitekture.

## 8. Naming konvencije

### Jezik

- korisničko sučelje: hrvatski
- kod: engleski gdje je praktično i dosljedno postojećem kodu
- komentari u kodu: engleski
- poslovni termini koji već postoje u domeni mogu zadržati hrvatske nazive ako bi prijevod smanjio jasnoću ili narušio postojeću konzistentnost

Ne koristiti hrvatske dijakritičke znakove u nazivima varijabli, funkcija, datoteka i database objekata.

### Datoteke i komponente

- React komponente: `PascalCase`
- utility/query/action datoteke: `kebab-case` gdje je primjenjivo
- Next.js rute: `kebab-case`

Prije imenovanja novog elementa provjeriti postojeće konvencije u istom dijelu projekta i zadržati konzistentnost.

### Funkcije

Server Actions koriste prefiks:

`action...`

Query funkcije koriste odgovarajuće glagole, primjerice:

- `get...`
- `create...`
- `update...`
- `delete...`

### Terminologija

U projektnoj dokumentaciji:

- `tabela` = database table
- `tablica` = UI table/grid

## 9. Multi-tenant readiness

Aplikacija trenutno radi s jednom aktivnom agencijom.

Trenutni tenant određuje se preko konfiguracije:

`AGENCY_ID`

Ciljana arhitektura projekta je multi-tenant SaaS aplikacija.

`AGENCY_ID` nije trajno rješenje za određivanje tenanta i novi kod ne smije biti projektiran pod pretpostavkom da će taj mehanizam ostati konačno rješenje.

### Tenant ownership

Svaki novi poslovni podatak mora imati jasno definirano vlasništvo.

Ako podatak pripada pojedinoj agenciji, mora biti moguće jednoznačno utvrditi kojoj agenciji pripada.

`agency_id` može biti:

- direktno na tabeli
- izveden kroz pouzdanu relaciju s drugim tenant-owned entitetom

Ne dodavati `agency_id` automatski na svaku tabelu ako je tenant ownership već nedvosmisleno definiran preko roditeljskog entiteta.

### Tenant isolation

Tenant-owned podatke treba dohvaćati i mijenjati u kontekstu aktivne agencije.

Novi queryji ne smiju pretpostavljati globalni pristup tenant-owned podacima.

Kod budućeg uvođenja runtime tenant resolutiona postojeći query sloj mora se moći prilagoditi bez redizajna cijele aplikacije.

### Relacije

Ne smije biti moguće slučajno povezati tenant-owned zapise koji pripadaju različitim agencijama.

Kod novih relacija potrebno je provjeriti postoji li mogućnost cross-tenant povezivanja i, ako postoji, predvidjeti odgovarajuću zaštitu.

### Unique constraints

Globalni `UNIQUE` constraint ne koristiti za tenant-owned podatke ako poslovno pravilo zahtijeva jedinstvenost samo unutar agencije.

U takvim slučajevima koristiti koncept:

`UNIQUE (agency_id, value)`

ili odgovarajući ekvivalent kroz tenant ownership.

### Buduća autentikacija i autorizacija

Planirana SaaS arhitektura uključivat će:

- autentikaciju korisnika
- korisničke račune
- članstvo korisnika u agencijama
- role i autorizaciju
- određivanje aktivnog tenanta za svaki zahtjev
- tenant isolation

Detaljna arhitektura tih funkcionalnosti definirat će se prije implementacije autentikacijskog/SaaS sloja.

## 10. Poslovna logika

Poslovna pravila ne smiju biti nepotrebno implementirana u UI komponentama.

Ako pravilo utječe na valjanost ili integritet podataka, mora postojati odgovarajuća serverska provjera.

Posebno važna pravila koja ovise o trenutnom stanju baze potrebno je ponovno provjeriti neposredno prije spremanja podataka.

UI provjera prije otvaranja forme ili akcije može poboljšati UX, ali ne zamjenjuje serversku provjeru prije promjene podataka.

## 11. Datumi

Korisničko sučelje koristi hrvatski prikaz datuma:

`dd.mm.gggg.`

Interni format i komunikacija sa serverskim slojem trebaju koristiti jednoznačan format prikladan za programsku obradu.

Konverzije datuma centralizirati u postojećim date utility funkcijama umjesto ponavljanja parsiranja i formatiranja kroz komponente.

Ne uvoditi drugi način obrade datuma unutar pojedinog modula bez opravdanog razloga.

## 12. UI razvoj

Za zajednička UI pravila koristiti:

`docs/ui-design-system.md`

Nove UI komponente prvo graditi korištenjem postojećih shadcn/ui komponenti i postojećih projektnih komponenti.

Ne uvoditi paralelni UI component library bez prethodne arhitekturne odluke.

Prije izrade nove reusable komponente provjeriti postoji li već komponenta koja rješava isti ili vrlo sličan problem.

## 13. Forme

React Hook Form i Zod predstavljaju standardni obrazac za klasične forme.

Kod jednostavnih formi koristiti postojeće RHF/Zod obrasce projekta.

Kod složenih formi potrebno je voditi računa o granicama komponenti i izbjegavati nepotrebne re-rendere cijele forme.

### `watch` i `useWatch`

Ne koristiti root-level `watch` ili `useWatch` za velike ili složene forme ako promjena pojedinog polja uzrokuje nepotreban re-render cijelog stabla komponenti.

Vrijednosti koje treba pratiti izolirati u najmanju komponentu kojoj su potrebne.

Prije dodavanja novog `watch`/`useWatch` poziva u parent form komponentu provjeriti može li se praćenje izolirati u child komponentu.

## 14. Complex line-item forms

Poslovni dokumenti kao što su:

- ponude
- računi gostima
- računi iznajmljivačima
- drugi dokumenti s editabilnim stavkama

koriste ili mogu koristiti složene tablice stavki.

Projekt već ima uspostavljen line-items pattern koji rješava problem gubitka fokusa i nepotrebnih re-rendera kod editabilnih tablica.

### Zašto pattern postoji

U ranijoj implementaciji kombinacija:

- React Hook Form
- `useFieldArray`
- parent-level `watch` / `useWatch`
- međusobno ovisnih kalkuliranih polja

uzrokovala je re-render velikog dijela forme tijekom unosa.

Posljedica je bio gubitak fokusa na aktivnim input poljima.

Zbog toga se postojeći line-items pattern smatra namjernom arhitekturnom odlukom, a ne privremenim workaroundom.

### Osnovna pravila

Kod postojećih i novih line-item tablica:

1. Ne uvoditi `useFieldArray` za stavke dokumenta bez prethodne analize postojećeg line-items patterna.
2. Root forma ne smije watchati cijelu kolekciju stavki ako to uzrokuje form-wide re-render.
3. Editabilne stavke u postojećem patternu drže se u lokalnom stateu tablice, odvojeno od RHF header forme.
4. Parent forma može koristiti `useRef` za pristup trenutnim stavkama kod submita bez re-rendera parent komponente.
5. Vrijednosti koje moraju biti prikazane u parent UI-u mogu se propagirati ciljano kroz callback.
6. Numeric inputi trebaju izbjegavati propagiranje svake tipke prema višim komponentama kada to uzrokuje nepotrebne re-rendere.
7. `watch`/`useWatch` koristiti samo u najmanjoj komponenti kojoj je promatrana vrijednost stvarno potrebna.
8. Ne mijenjati postojeći pattern samo zato što React Hook Form nudi `useFieldArray`.

Prije izmjene ili izrade line-item forme obavezno pregledati:

`src/components/line-items/`

i postojeću implementaciju ponuda.

Ako postoji Claude Code skill za line-item tablice, pročitati ga prije implementacije.

### Validacija stavki

Ako stavke nisu dio React Hook Form statea, one nisu automatski validirane RHF/Zod validacijom header forme.

U tom slučaju potrebno je osigurati eksplicitnu validaciju stavki prije serverske operacije.

Bez obzira na client-side strukturu forme, serverski sloj mora validirati podatke koji utječu na integritet poslovnog dokumenta.

### Reusable line-item komponente

Generičke line-item komponente ne duplicirati po poslovnim dokumentima ako postojeća komponenta može biti ponovno korištena ili razumno proširena.

Istodobno, ne generalizirati komponentu unaprijed samo zato što bi je budući modul možda mogao koristiti.

Reusable apstrakciju uvoditi kada postoji stvarna zajednička potreba najmanje dvaju konkretnih use caseova.

## 15. Razvojni pristup

Kod izmjena postojećeg modula prvo treba razumjeti postojeću implementaciju prije pisanja novog koda.

Za netrivijalne izmjene:

1. pročitati relevantnu projektnu dokumentaciju
2. pregledati relevantni postojeći source code
3. utvrditi postojeći data flow i ovisnosti
4. predložiti pristup
5. identificirati datoteke koje će biti promijenjene
6. identificirati moguće posljedice na druge module
7. tek zatim implementirati promjenu

Ne raditi velike refaktore koji nisu potrebni za zadani problem.

Ne mijenjati postojeću arhitekturu samo zato što postoji alternativni ili moderniji obrazac.

Kod ispravljanja buga prvo utvrditi uzrok problema, a zatim napraviti najmanju promjenu koja ga ispravno rješava.

## 16. Dokumentacija

Prije rada na funkcionalnosti koristiti samo relevantnu dokumentaciju.

Osnovni dokumenti:

- `docs/project-overview.md` — poslovni kontekst i ciljevi
- `docs/database.md` — database design i važna pravila podataka
- `docs/development-rules.md` — arhitektura i razvojna pravila
- `docs/ui-design-system.md` — zajednička UI pravila
- `docs/status-projekta.md` — trenutno stanje projekta
- `docs/modules/*.md` — detalji pojedinih modula
- `docs/known-issues.md` — poznati tehnički problemi i privremeni workaroundi

Kod rada na konkretnom modulu prvo pročitati odgovarajući `docs/modules/*.md` ako postoji.

Dokumentacija ne zamjenjuje pregled stvarnog source koda.

Za konkretne implementacijske detalje postojeći source code ima prednost pred zastarjelim opisom u dokumentaciji.

Ako se utvrdi neslaganje između dokumentacije i stvarne implementacije, ne pretpostavljati automatski da jedno treba prilagoditi drugome.

Prvo utvrditi je li ispravna implementacija ili dokumentirano pravilo.

## 17. Ažuriranje dokumentacije

Nakon značajne implementacije ili promjene projektne odluke ažurirati samo dokumente na koje promjena stvarno utječe.

`docs/status-projekta.md` ažurirati kada:

- završi značajna funkcionalnost
- promijeni se status modula
- otkrije se važan problem
- promijeni se plan projekta

Odgovarajući `docs/modules/*.md` ažurirati kada se promijene:

- poslovna pravila modula
- važan user flow
- data model modula
- bitne tehničke odluke modula

`development-rules.md` ne koristiti kao dnevnik razvoja.

Privremene bugove i workarounde zapisivati u `docs/known-issues.md`, a ukloniti ih kada više nisu aktualni.

## 18. Granice ovog dokumenta

Ovaj dokument treba sadržavati pravila koja vrijede kroz veći dio projekta.

Ne koristiti ga za:

- detaljnu dokumentaciju pojedinog modula
- popis trenutnih taskova
- dnevnik razvoja
- kopije source koda
- detaljne Drizzle sheme
- privremene workarounde za konkretne verzije biblioteka
- detaljne UI specifikacije pojedinih ekrana

Takve informacije pripadaju u odgovarajuće:

- `docs/modules/*.md`
- `docs/database.md`
- `docs/ui-design-system.md`
- `docs/status-projekta.md`
- `docs/known-issues.md`
- Claude Code skills
