# ui-design-system.md — UI design system

## 1. Svrha dokumenta

Ovaj dokument definira zajednička vizualna i UX pravila aplikacije.

Cilj je da svi moduli aplikacije djeluju kao dio jednog sustava, bez obzira na to kada su razvijeni.

Dokument definira:

- osnovni vizualni stil
- UI component system
- theme strategiju
- semantičke design tokene
- tipografiju
- spacing i gustoću
- obrasce za forme
- tablice
- dialoge
- navigaciju
- statuse i feedback
- responzivnost
- accessibility smjernice

Detaljna pravila pojedinih poslovnih modula pripadaju u:

`docs/modules/*.md`

## 2. Design principles

Aplikacija je poslovna operativna aplikacija.

Primarni cilj dizajna nije dekorativnost, nego:

- jasnoća
- brzina rada
- konzistentnost
- preglednost
- dobra čitljivost većih količina podataka
- minimalan broj nepotrebnih koraka
- predvidivo ponašanje UI-a

Vizualni smjer:

- moderan
- minimalistički
- profesionalan
- relativno kompaktan
- prilagođen svakodnevnom radu s podacima

Izbjegavati:

- velike dekorativne kartice bez funkcionalne potrebe
- pretjerane gradijente
- velike prazne površine
- marketing-style layout
- nepotrebne animacije
- vizualne efekte koji smanjuju čitljivost poslovnih podataka

## 3. UI technology

Glavni UI component system:

`shadcn/ui`

shadcn/ui je jedini glavni component library projekta.

Koristiti:

- postojeće shadcn/ui komponente
- projektne reusable komponente izgrađene nad shadcn/ui
- Lucide ikone

Ne uvoditi drugi paralelni UI component library bez prethodne arhitekturne odluke.

Ako shadcn/ui nema potrebnu komponentu:

1. provjeriti može li se izgraditi kombinacijom postojećih shadcn komponenti
2. provjeriti postoji li već projektna reusable komponenta
3. tek zatim izraditi novu projektnu komponentu

## 4. Theme strategy

Vizualna tema aplikacije temelji se na shadcn theme sustavu.

Za kreiranje i prilagodbu teme koristi se:

`tweakcn`

Početna baza teme:

`Modern Minimal`

tweakcn se koristi kao alat za definiranje i prilagodbu design tokena.

tweakcn nije zaseban runtime UI framework projekta.

Tema se nakon odabira ili prilagodbe sprema u projekt kroz centralizirane CSS/theme tokene.

### Centralizacija teme

Globalne theme vrijednosti moraju biti definirane centralno.

Pojedini moduli ne smiju samostalno redefinirati:

- primary boju
- background
- foreground
- border
- radius
- osnovne surface boje
- osnovne shadow vrijednosti
- globalnu tipografiju

Promjena osnovne teme mora biti moguća bez uređivanja svakog modula pojedinačno.

## 5. Theme tokens

Komponente trebaju koristiti semantičke theme tokene umjesto hardkodiranih boja.

Primjeri osnovnih tokena:

- `background`
- `foreground`
- `card`
- `card-foreground`
- `popover`
- `popover-foreground`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `muted`
- `muted-foreground`
- `accent`
- `accent-foreground`
- `destructive`
- `border`
- `input`
- `ring`

Ako postojeći shadcn token rješava zahtjev, koristiti njega umjesto stvaranja novog tokena.

## 6. Domain-specific semantic colors

Poslovni statusi mogu zahtijevati boje koje nisu dio osnovne theme palete.

Primjeri:

- potvrđena rezervacija
- nepotvrđena rezervacija
- prijava / stay
- storno
- konflikt
- plaćeno
- neplaćeno
- dospjelo
- fiskalizirano
- greška u obradi

Takve boje definiraju se kao semantički tokeni prema poslovnom značenju.

Primjer koncepta:

```css
--calendar-reservation-confirmed
--calendar-reservation-unconfirmed
--calendar-stay
--calendar-conflict
```

Komponente koriste semantički naziv, a ne direktnu HEX/RGB vrijednost.

## 7. Gantt i kalendar — radne boje

Trenutne boje korištene u Gantt/kalendar prikazu nisu konačne design-system vrijednosti.

One predstavljaju **radne boje** korištene tijekom razvoja funkcionalnosti.

Njihova poslovna semantika treba ostati stabilna, ali se konkretne vizualne vrijednosti mogu kasnije promijeniti.

Primjeri stanja:

- potvrđena rezervacija
- nepotvrđena rezervacija
- stay
- konflikt / overlap
- drugi budući operativni statusi

Poslovna logika ne smije ovisiti o konkretnoj vrijednosti boje.

Ne koristiti logiku tipa:

```text
ako je boja zelena → potvrđena rezervacija
```

Umjesto toga komponenta mora dobiti poslovni status i na temelju njega koristiti odgovarajući semantic token.

Primjer:

```text
status = confirmed
→ calendar-reservation-confirmed
```

Konkretne boje tih tokena mogu se kasnije promijeniti tijekom vizualnog redizajna aplikacije.

Detaljna pravila Gantt modula pripadaju u:

`docs/modules/calendar.md`

## 8. Typography

Tipografija mora biti jednostavna, čitljiva i pogodna za poslovnu aplikaciju.

Koristiti ograničen broj veličina i težina fonta.

Prioritet:

1. čitljivost podataka
2. jasna hijerarhija
3. konzistentnost

### Naslovi

Naslovi stranica trebaju biti jasni i relativno kompaktni.

Ne koristiti velike marketing-style naslove unutar operativnog dijela aplikacije.

### Label i pomoćni tekst

Form label mora biti lako uočljiv.

Pomoćni tekst, hint i sekundarne informacije koristiti s muted stilom.

Važne informacije ne smiju biti prikazane samo kao vrlo blijedi pomoćni tekst.

### Brojčani podaci

U tablicama i poslovnim dokumentima financijski i brojčani podaci trebaju biti lako usporedivi.

Za iznose koristiti dosljedno poravnanje i formatiranje.

## 9. Spacing i density

Aplikacija koristi relativno kompaktan layout.

Cilj nije maksimalna gustoća podataka, nego dobar balans između:

- količine informacija
- čitljivosti
- brzine rada

Koristiti postojeću Tailwind/shadcn spacing skalu.

Ne uvoditi proizvoljne vrijednosti spacinga ako postojeća skala daje odgovarajuću vrijednost.

### Forme

Vertikalni razmak između povezanih polja treba biti konzistentan.

Povezana polja grupirati vizualno.

### Tablice

Tablice mogu biti gušće od običnih formi jer predstavljaju primarni poslovni radni prostor.

Visina retka treba omogućiti:

- dobru čitljivost
- dovoljan broj vidljivih redaka
- jednostavno korištenje mišem

## 10. Radius, borders i shadows

Radius, border i shadow vrijednosti proizlaze prvenstveno iz aktivne tweakcn/shadcn teme.

Ne definirati različit border-radius po pojedinim modulima bez razloga.

Aplikacija koristi dvije razine radiusa (vidi i **Form Controls** u poglavlju 14):

- Card i Dialog koriste globalni radius, približno **10 px**
- Form controls (Input, Select, Textarea, Combobox trigger i slične field-like kontrole) koriste manji radius, približno **6 px**

Ova razlika je namjerna i ne smatra se definiranjem različitog radiusa "po modulu" — riječ je o dosljednom razlikovanju surface elemenata (Card/Dialog) od form control elemenata kroz cijelu aplikaciju.

Shadows koristiti umjereno.

Preferirati jasnu strukturu kroz:

- spacing
- border
- background contrast

umjesto snažnih shadow efekata.

Form controls posebno ne smiju imati izražen shadow/glow efekt na focus stanju — vidi poglavlje 14, sekciju **Form Controls**.

## 11. Layout

Glavni application layout treba biti stabilan i predvidiv.

Primarne cjeline:

- navigacija
- header / toolbar
- glavni content prostor

Operativni ekrani trebaju maksimalno koristiti raspoloživi prostor kada je to korisno.

To posebno vrijedi za:

- Gantt
- tablice rezervacija
- tablice prijava
- financijske evidencije
- izvještaje

Ne stavljati velike radne tablice u uske kartice bez funkcionalnog razloga.

## 12. Navigation

Navigacija treba jasno odražavati poslovne module aplikacije.

Nazivi stavki navigacije koriste hrvatsku poslovnu terminologiju.

Primjeri:

- Kalendar
- Rezervacije
- Ponude
- Iznajmljivači
- Apartmani
- Gosti
- Uplate
- Računi
- Izvještaji

Ikone koristiti kao dopunu nazivu, ne kao jedini način identifikacije funkcije.

## 13. Buttons i actions

Koristiti standardne shadcn Button varijante.

Primarna akcija ekrana mora biti lako prepoznatljiva.

Primjeri:

- Spremi
- Nova rezervacija
- Nova ponuda
- Potvrdi

Sekundarne akcije ne smiju vizualno konkurirati primarnoj akciji.

### Destructive actions

Akcije poput:

- Izbriši
- Storniraj
- Otkaži

moraju biti jasno razlikovane od normalnih akcija.

Za nepovratne ili poslovno značajne destruktivne akcije koristiti odgovarajući confirmation dialog.

### Toolbars

Toolbar može sadržavati:

- primarne akcije
- filtre
- search
- context-aware akcije

Ne pretrpavati toolbar velikim brojem istovremeno vidljivih akcija.

Rjeđe korištene akcije mogu se smjestiti u dropdown menu.

## 14. Forms

Za forme koristiti postojeće shadcn + React Hook Form obrasce projekta.

Opća pravila:

- label mora jasno opisivati podatak
- placeholder nije zamjena za label
- required polja moraju biti jasno razumljiva
- greška se prikazuje uz relevantno polje
- invalid state mora biti vizualno uočljiv
- disabled i read-only stanja moraju biti jasna

### Field width

Širina polja treba odgovarati očekivanom sadržaju.

Primjer:

- datum ne treba širinu cijelog ekrana
- OIB ne treba `w-full` na širokoj desktop formi
- naziv ili adresa mogu koristiti širi prostor

Ne koristiti `w-full` automatski za svako polje bez razmatranja layouta.

### Grupiranje polja

Povezana polja grupirati u logične cjeline.

Primjeri:

- osobni podaci
- kontakt
- adresa
- podaci smještaja
- financijski podaci
- podaci rezervacije

Kod dugih formi koristiti sekcije radi lakšeg skeniranja sadržaja.

### Form Controls

Ovo je **globalni standard** za sve postojeće i buduće forme u aplikaciji, neovisno o modulu.

#### Obuhvaćene kontrole

Standard obuhvaća sve kontrole koje korisniku predstavljaju polje za unos ili izbor podataka, uključujući:

- Input
- Select
- Textarea
- Combobox trigger
- DatePicker / date trigger
- Popover trigger koji predstavlja form field
- ostale field-like kontrole koje vizualno predstavljaju unos ili izbor podataka

#### Vizualni standard

- Radius: približno **6 px**
- Normal border: semantic token `--input`
- Hover border: semantic token `--input-hover`
- Focus border/ring: semantic token `--ring`
- Focus ring: **1 px**
- Bez izraženog glow/shadow efekta
- Visina, padding i tipografija ostaju konzistentni s odgovarajućim shared/shadcn komponentama

#### Hijerarhija radiusa

- Card, Dialog i druge veće površine koriste globalni radius, približno **10 px**
- Form controls koriste manji radius, približno **6 px**

Globalni Card/Dialog radius se ne smanjuje samo radi usklađivanja s form controls standardom.

#### Semantic tokens

Poslovne forme ne smiju pojedinačno hardkodirati boje border/focus stanja form controlsa.

Preferirani redoslijed pristupa:

1. semantic theme token
2. shared/shadcn komponenta
3. lokalni override samo kada tehnička implementacija konkretne kontrole to zahtijeva (npr. raw HTML element koji nije izgrađen kroz centralnu shadcn komponentu)

Trenutno korišteni semantic tokeni:

- `--input` — normal border
- `--input-hover` — hover border
- `--ring` — focus border/ring

#### Konzistentnost među tipovima kontrola

Kontrole koje tehnički nisu obični HTML/shadcn Input elementi, ali vizualno predstavljaju form field, moraju slijediti isti standard. To posebno vrijedi za:

- Combobox
- DatePicker
- Select trigger
- Popover trigger
- druge složene kontrole za izbor vrijednosti

Ne smije se dogoditi da na istoj formi Input, Combobox i DatePicker imaju različit radius, border ili focus stil.

#### Referentna implementacija

Standard je implementiran i provjeren u modulima:

- Iznajmljivači (landlords)
- Smještajne jedinice (accommodations)
- Cjenik (pricelist)

To ne znači da standard vrijedi samo za te module. Oni predstavljaju referentnu implementaciju za ostale postojeće i buduće forme aplikacije.

Ostale postojeće forme u drugim modulima trenutno nisu sve usklađene s ovim standardom. Usklađivanje se provodi kontrolirano, modul po modul, kroz zasebne zadatke — ne kao masovni UI refactor.

## 15. Complex line-item forms

Za editabilne tablice stavki koristiti postojeća arhitekturna pravila iz:

`docs/development-rules.md`

Ne mijenjati line-items form pattern samo radi vizualnog redizajna.

Vizualni design tablice mora biti odvojen od odluke o upravljanju stateom i form arhitekturi.

Detaljna implementacija može biti dokumentirana u odgovarajućem Claude Code skillu i modulskim dokumentima.

## 16. Date fields

Datumi se korisniku prikazuju u hrvatskom formatu:

`dd.mm.gggg.`

Datum u UI-u mora biti vizualno konzistentan kroz module.

Ne uvoditi različite stilove date inputa po pojedinim ekranima.

Ako se koristi projektna custom date komponenta, preferirati je u odnosu na lokalne implementacije.

## 17. Combobox i selection fields

Za izbor vrijednosti iz većeg skupa koristiti odgovarajući combobox/select pattern.

Ako poslovni proces dopušta kreiranje nove vrijednosti tijekom unosa, koristiti postojeći reusable obrazac poput:

`ComboboxWithCreate`

Ne duplicirati logiku "odaberi ili kreiraj" u svakom modulu zasebno.

## 18. Tables

Tablice su jedan od najvažnijih UI elemenata aplikacije.

Tablica mora omogućiti brzo skeniranje podataka.

### Header

Header mora jasno razlikovati:

- naziv kolone
- sortiranje
- filter
- druge kontrolne elemente

### Alignment

Preporučeno:

- tekstualne vrijednosti — lijevo
- brojčane vrijednosti — desno
- iznosi — desno
- datumi — konzistentno prema dizajnu modula
- status — prema odabranom badge/status patternu

### Row actions

Akcije nad pojedinim retkom ne smiju nepotrebno zauzimati velik horizontalni prostor.

Za veći broj akcija preferirati context menu ili dropdown.

### Row states

Selektirani, hovered, disabled i drugi stateovi trebaju biti definirani kroz theme tokene.

Poslovni status retka ne smije biti prikazan samo bojom pozadine ako postoji rizik nejasnoće.

Po potrebi koristiti:

- badge
- ikonu
- tekstualni status
- boju kao dodatni signal

## 19. Status badges

Statusi koji se često pojavljuju u UI-u trebaju imati konzistentan badge pattern.

Primjeri:

- Nepotvrđena
- Potvrđena
- Realizirana
- Stornirana
- Plaćeno
- Neplaćeno
- Dospjelo

Badge boje trebaju koristiti semantičke statuse.

Ne definirati proizvoljan badge stil u svakom modulu.

## 20. Dialogs, sheets i drawers

Koristiti shadcn komponente prema namjeni.

### Dialog

Koristiti za:

- potvrde
- kraće forme
- manju količinu informacija
- fokusirane akcije

### Sheet / drawer

Koristiti za:

- detaljni prikaz zapisa
- kompleksniji sekundarni sadržaj
- uređivanje koje treba zadržati kontekst glavne stranice

### Nova stranica

Koristiti kada je forma ili workflow dovoljno kompleksan da zahtijeva vlastiti radni prostor.

Ne pokušavati svaki proces smjestiti u modal.

## 21. Feedback

Korisnik mora dobiti jasnu povratnu informaciju za važne akcije.

Primjeri:

- uspješno spremanje
- greška
- validacijski problem
- obrada u tijeku
- prazan rezultat
- nema dostupnog smještaja

### Loading

Za duže operacije koristiti odgovarajući loading state.

Ne dopuštati višestruki submit iste akcije dok je prethodni submit još u tijeku.

### Empty states

Prazna lista ne smije izgledati kao greška.

Prikazati jasno objašnjenje i, kada je korisno, moguću sljedeću akciju.

## 22. Icons

Koristiti:

`Lucide`

Ikone moraju imati funkcionalnu svrhu.

Ne koristiti ikone samo radi dekoracije.

Standardne akcije trebaju koristiti konzistentne ikone kroz aplikaciju.

Primjer:

- uređivanje
- brisanje
- pretraga
- filter
- dodavanje
- ispis / PDF
- slanje

## 23. Responsive behavior

Primarni cilj aplikacije je desktop poslovni rad.

Desktop layout ima prioritet kod kompleksnih radnih ekrana poput:

- Gantta
- velikih tablica
- financijskih evidencija
- izvještaja

Aplikacija ipak mora ostati funkcionalna na manjim ekranima gdje je to razumno.

Na manjim ekranima dopušteno je:

- horizontalno scrollanje kompleksnih tablica
- slaganje form fieldova vertikalno
- skrivanje sekundarnih informacija
- premještanje akcija u dropdown

Ne uništavati desktop produktivnost kako bi kompleksni operativni ekran izgledao idealno na mobitelu.

## 24. Accessibility

Koristiti semantičke HTML elemente i accessibility mogućnosti koje pruža shadcn/Radix.

UI ne smije ovisiti isključivo o boji.

Interaktivni elementi moraju:

- imati vidljiv focus state
- biti dostupni tipkovnicom gdje je primjenjivo
- imati razumljiv naziv
- imati dovoljan kontrast

Custom komponente ne smiju uklanjati accessibility ponašanje koje standardna shadcn/Radix komponenta već pruža.

## 25. Module-specific design

Poslovni moduli mogu zahtijevati vlastite UI obrasce.

Primjeri:

- Gantt timeline
- reservation detail sheet
- tablica stavki ponude
- uvoz bankovnog izvoda

Takva pravila ne treba detaljno dokumentirati ovdje.

Dokumentirati ih u:

`docs/modules/<module>.md`

Ovaj dokument treba sadržavati samo pravila koja trebaju ostati konzistentna između više modula.

## 26. Pravila za Claude Code

Prije izrade ili većeg redizajna UI-a:

1. pročitati relevantni dio `docs/ui-design-system.md`
2. pregledati postojeće shadcn i projektne komponente
3. pregledati postojeći UI sličnog modula
4. koristiti postojeće theme tokene
5. izbjegavati hardkodirane vizualne vrijednosti
6. identificirati postoji li reusable pattern prije izrade novog
7. ne mijenjati poslovnu logiku radi vizualnog redizajna

Kod izrade nove forme, dodavanja novog form fielda ili izmjene postojeće forme, Claude Code mora:

- primijeniti Form Controls standard iz poglavlja 14
- koristiti postojeće shared/shadcn komponente gdje god je to moguće, umjesto lokalnih raw implementacija

Ako postojeća kontrola u formi koja se dira odstupa od Form Controls standarda, Claude Code ne smije automatski provoditi širi refactor izvan scopea trenutnog zadatka. Odstupanje treba zabilježiti (npr. u odgovoru ili `docs/known-issues.md`), a usklađivanje raditi kao zaseban, kontroliran zadatak.

Claude Code ne smije proizvoljno uvoditi:

- novi UI library
- novu theme paletu
- novi font
- novi globalni radius
- nove globalne shadow vrijednosti
- lokalni design system specifičan samo jednom modulu

Ako postojeći design system nije dovoljan za novu potrebu, prvo treba predložiti proširenje zajedničkog sustava.

## 27. Razvoj i dorada dizajna

Design system nije završen jednom zauvijek.

Aplikacija je u aktivnom razvoju i vizualni sustav će se postupno dorađivati.

Posebno su podložni promjeni:

- konkretna theme paleta
- Gantt/status boje
- gustoća pojedinih radnih ekrana
- tipografija
- detalji tablica
- toolbar obrasci

Promjene trebaju biti provedene kroz zajedničke tokene i reusable komponente gdje god je moguće.

Cilj je omogućiti evoluciju dizajna bez velikih refaktora poslovnih modula.

## 28. Granice ovog dokumenta

Ovaj dokument ne treba sadržavati:

- hardkodirane boje pojedinog modula
- kompletan CSS
- kopije React komponenti
- detaljnu Gantt implementaciju
- detaljnu logiku rezervacija
- konkretne bug workarounde
- privremene implementacijske napomene
- status razvoja pojedine komponente

Za to koristiti:

- `docs/modules/*.md`
- `docs/development-rules.md`
- `docs/status-projekta.md`
- `docs/known-issues.md`
- stvarni source code
- odgovarajuće Claude Code skills
