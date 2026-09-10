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
- placeholder mora ostati jasno vizualno sekundaran u odnosu na stvarno unesenu vrijednost — koristiti standardni `placeholder:text-muted-foreground` (već dio zajedničke `Input` komponente), ne hardkodiranu boju; primjeri poput brojčanih vrijednosti (npr. poštanski broj) trebaju imati prefiks tipa "npr." da se izbjegne dojam da je vrijednost već unesena

### Početni fokus

Početni fokus pri otvaranju forme može ovisiti o create/edit kontekstu iste komponente — nije nužno identičan u oba slučaja.

Primjer: forma iznajmljivača (`LandlordForm`) pri dodavanju novog iznajmljivača fokusira prvi element skupine "Vrsta iznajmljivača" (radio buttoni), dok pri uređivanju postojećeg iznajmljivača fokusira prvo input polje s podacima (Prezime / Naziv obrta / Naziv tvrtke), jer je vrsta već poznata i korisnik obično nastavlja izmjenu konkretnih podataka.

Postavljanje početnog fokusa ne smije:

- mijenjati postojeće podatke forme,
- uzrokovati dirty-state (npr. `formState.isDirty` ne smije postati `true` samo zbog fokusiranja),
- ovisiti o proizvoljnom timeoutu — koristiti React/RHF mehanizam koji pouzdano radi nakon inicijalizacije vrijednosti forme (npr. `ref` na polje + `useEffect` pri mountu).

### Enter navigacija (`useFormKeyboardNav`)

Globalna Enter-navigacija kroz forme (`src/hooks/use-form-keyboard-nav.ts`) mora poštovati isti logički redoslijed elemenata kao native Tab navigacija.

Pravilo za pojedine tipove kontrola:

- **Input / Textarea** — Enter pomiče fokus na sljedeći element (uz standardne iznimke za Ctrl+Enter/Shift+Enter u textarei).
- **Checkbox** (Radix `<button role="checkbox">`, samostalan tab-stop) — mora biti uključen u Enter navigaciju kao i svako drugo polje. Enter ne smije preventirati native aktivaciju (toggle) checkboxa — kontrola se i dalje mijenja kao inače, a fokus se dodatno pomiče na sljedeći element, isto kao kad Enter u inputu potvrđuje vrijednost i nastavlja dalje.
- **Radio grupa** (Radix `<button role="radio">`) — ostaje isključena iz Enter navigacije. Tab/fokus ide na cijelu grupu (jedan tabbable item po grupi), ne na pojedinačne opcije, pa tu Enter ne smije umjetno stvarati zaseban tab-stop po opciji.
- **Select / Combobox / Command / DatePicker i slični widgeti s vlastitom Enter semantikom** — ostaju izuzeti (`data-kbnav-ignore` ili odgovarajući `role`/selector u `IGNORE_SELECTOR`); Enter unutar takvog widgeta bira vrijednost, ne pomiče fokus na formi.
- **Submit gumb** — Enter izvršava native submit, handler se ne miješa.

Ako se u formu doda nova vrsta kontrole koja je samostalan tab-stop (ne dio grupe s jednim tabbable itemom), Enter navigacija mora tu kontrolu tretirati kao i svako drugo polje — ne popravljati pojedinačne slučajeve hardkodirano, nego kroz opći filter u `getNavItems`.

### Legenda obaveznih polja

Legenda tipa `* Obavezno polje` prikazuje se uz formu, ispod glavnog form bloka, poravnata s lijevim rubom forme.

Legenda ne smije biti smještena u header stranice uz navigacijske ili akcijske kontrole (npr. "Povratak na popis", "Odustani", "Spremi") jer to vizualno stvara pogrešan dojam da je legenda povezana s tom kontrolom.

Footer akcije forme (npr. Odustani, Spremi) ostaju odvojene od legende, standardno poravnate desno.

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

### Ubrzani unos datuma (normalizacija)

Text-based datumska polja (`dd.mm.gggg.`) trebaju podržavati skraćeni, brzi unos koji se pri napuštanju polja normalizira u puni format. Standardna implementacija:

- `normalizeHrDateInput()` u `src/lib/utils/dates.ts` — čista funkcija, eksplicitno parsira dan/mjesec/godinu (ne koristi `new Date(string)` parsiranje) i ručno validira stvarnu kalendarsku ispravnost (uključujući prijestupne godine).
- `useDateFieldNormalize()` hook u `src/hooks/use-date-field-normalize.ts` — reusable veza s React Hook Form; vraća `{ onKeyDown, onBlur }` koje se dodaju na `Input` uz postojeći `field.onChange` (live-typing formatiranje interpunkcije ostaje nepromijenjeno).

Pravila normalizacije:

- `1` / `01` → dan, trenutni mjesec i godina (vodeća nula opcionalna samo za jednodnevni unos)
- `0108` / `01.08` → dan i mjesec, trenutna godina
- `01082025` / `01.08.2025` / `01.08.2025.` → potpun datum
- dvosmisleni unosi (npr. `108`) se ne interpretiraju — vraća se `null`, vrijednost u polju ostaje netaknuta i postojeća Zod/RHF validacija prijavljuje grešku standardnim putem

Normalizacija se izvršava na Enter, Tab i blur mišem — ne pri svakom tipkanju — i mora biti idempotentna (ponovna normalizacija već normaliziranog datuma ne smije promijeniti vrijednost niti lažno označiti formu dirty). Ne smije mijenjati ili duplicirati postojeću globalnu keyboard navigaciju (`useFormKeyboardNav`) — normalizacija se izvršava prije nego event nastavi svojim uobičajenim tokom, bez `preventDefault`/`stopPropagation`.

Nova datumska polja u aplikaciji trebaju koristiti ovaj hook umjesto lokalne/duplicirane logike.

## 17. Numeric fields

`<input type="number">` može privremeno prikazati vodeće nule koje ne odgovaraju stvarnoj vrijednosti (npr. korisnik upiše "0" pa "10" — DOM prikaz ostane "010" dok se vrijednost stvarno već ispravno spremila kao broj 10). Standardna implementacija:

- `normalizeLeadingZeros()` u `src/lib/utils/numbers.ts` — čista funkcija, uklanja suvišne vodeće nule iz cjelobrojnog dijela numeričkog stringa; decimalni dio (ako postoji) ostaje netaknut (`"010.5"` → `"10.5"`), a `"0"`/`"00"` ostaje `"0"`.
- `useIntegerFieldNormalize()` hook u `src/hooks/use-integer-field-normalize.ts` — reusable veza s React Hook Form; vraća `{ onKeyDown, onBlur }`. Ako normalizirana vrijednost predstavlja istu numeričku vrijednost koja je već u RHF stateu, samo se osvježi DOM prikaz (`input.value`) bez poziva `setValue` — ne uzrokuje lažni dirty-state.

Normalizacija se izvršava na Enter, Tab i blur mišem — ne pri svakom tipkanju. Ne mijenja spremljenu numeričku vrijednost niti postojeću min/max validaciju, samo ispravlja DOM prikaz. Ne diraj globalnu keyboard navigaciju (`useFormKeyboardNav`) — normalizacija se izvršava prije nego event nastavi svojim uobičajenim tokom, bez `preventDefault`/`stopPropagation`.

Referentna implementacija: "Br. soba" / "Br. kreveta" / "Pom. ležajevi" i ostala **cjelobrojna** numerička polja (`ApartmanModal`). Nova integer polja trebaju koristiti ovaj hook umjesto lokalne/duplicirane logike.

Ovo pravilo vrijedi za cjelobrojna polja. Za decimalne brojeve (novčani iznosi, postoci, količine s decimalama) vidi poglavlje 17a — ne koristiti `useIntegerFieldNormalize` na decimalnom polju.

### 17a. Decimal fields — hrvatski format

Aplikacija je namijenjena hrvatskim korisnicima, pa se decimalni brojevi prikazuju u hrvatskom formatu: `,` je decimalni separator, `.` je separator tisućica (npr. `1.234,56`). RHF/Zod/Drizzle/PostgreSQL i dalje rade isključivo s običnim JS `number` vrijednostima (npr. `1234.56`) — ovo je čisto UI formatting pravilo, ne mijenja se način spremanja u bazu.

Standardna implementacija:

- `src/lib/utils/decimal.ts` — `parseHrDecimal(string): number | null` (eksplicitan parser; ne koristiti `Number()`/`parseFloat()` direktno nad hrvatskim stringom kao `"1.234,56"` — to nije ispravan JS numerički format), `formatHrDecimal(number, decimals): string` (koristi `Intl.NumberFormat("hr-HR")`), `normalizeDecimalKey()` (live-typing `.` → `,` zamjena).
- `src/components/ui/decimal-input.tsx` — reusable `<DecimalInput>` komponenta. Koristi se kao `<DecimalInput {...field} decimals={2} />` unutar `FormField`.

**Zašto komponenta, ne samo hook**: `<input>` mora biti controlled preko **internog display-string state-a**, ne preko RHF `field.value` (broja) direktno — inače bi svaki `setValue()`/re-render prisilio prikaz plain JS broja (`"1234.56"`) i pregazio hrvatski format. `DecimalInput` prema RHF-u izlaže `value: number | null` / `onChange(value: number | null)`, a interno drži `displayValue` (hrvatski string, uključujući privremeno nedovršen unos tijekom tipkanja).

Ponašanje:

- Tijekom tipkanja: nema agresivnog formatiranja (bez separatora tisućica), korisnik slobodno tipka `1234,56`. Nevažeći/nedovršen unos (`"12,"`, `",5"` je iznimka i validan kao 0.5, `"abc"`) postavlja RHF vrijednost na `null` — ne zadržava se prethodna valjana vrijednost, forma ne izgleda lažno validna.
- Na Enter/Tab/blur: ako je unos valjan broj, formatira se u puni hrvatski prikaz (`formatHrDecimal`) i ta vrijednost se emitira u RHF. Ako je nevažeći, prikazani string ostaje netaknut (korisnik i dalje vidi svoj unos), RHF vrijednost ostaje `null`, i postojeća Zod validacija to standardno prijavljuje.
- Tipka `.` na numeričkoj tipkovnici: dok prikazani string još ne sadrži `,`, `.` se tretira kao pokušaj decimalnog separatora i zamjenjuje se s `,`. Već formatiran broj s `.` kao separatorom tisućica se ne dira (razlikovanje po tome sadrži li string već `,`, ne po cursor poziciji).
- Broj decimalnih mjesta je obavezan parametar (`decimals`) — ne pretpostavlja se 2 za sva polja; novčani iznosi za sada koriste 2.
- Sync iz RHF-a natrag u display (reset, initial mount) razlikuje echo vlastitog `onChange`-a od stvarne eksterne promjene preko redoslijeda poziva (interni `justEmittedRef`), ne preko usporedbe brojčanih vrijednosti — jer pozivatelj smije transformirati emitiranu vrijednost (npr. `onChange={(v) => field.onChange(v ?? 0)}`) prije nego stigne u RHF.

Referentna implementacija: "Iznos provizije" (`LandlordForm`), "Cijena za gosta" i "Cijena prema iznajmljivaču" (`CjenikModal`). Ostala decimalna polja u aplikaciji (stavke ponude, predujam) migriraju se kontrolirano, kao zasebni zadaci.

**Decimalne vrijednosti u korisničkom sučelju uvijek se prikazuju u hrvatskom formatu: decimalni separator `,`, separator tisućica `.`, uz broj decimalnih mjesta definiran semantikom polja.** Ovo vrijedi i za read-only prikaz (tablice, pregledi), ne samo za input polja — koristiti `formatHrDecimal(broj, decimals)` iz `src/lib/utils/decimal.ts`, ne `toFixed()`/`String()`/ručnu zamjenu znakova (npr. `.replace(".", ",")`). `toFixed()` sam po sebi vraća plain JS decimalnu točku i ne dodaje separator tisućica.

Referentna implementacija za tablični prikaz: stupci cijena u tablici Cjenik (`iznajmljivaci-client.tsx`, `UrediIznajmljivacClient.tsx`).

## 18. Combobox i selection fields

Za izbor vrijednosti iz većeg skupa koristiti odgovarajući combobox/select pattern.

Ako poslovni proces dopušta kreiranje nove vrijednosti tijekom unosa, koristiti postojeći reusable obrazac poput:

`ComboboxWithCreate`

Ne duplicirati logiku "odaberi ili kreiraj" u svakom modulu zasebno.

### Lokalni keyboard shortcuti

Specifična akcija unutar comboboxa (npr. "dodaj novu vrijednost") može imati lokalni keyboard shortcut koji vrijedi samo dok je fokus unutar tog comboboxa/njegovog dropdowna — ne globalno za cijelu stranicu.

Uvjeti:

- shortcut mora biti jasno prikazan korisniku u UI-u (npr. u tekstu akcije: "Dodaj novi grad (Ins)..."), ne skriven;
- ne smije upisivati znak u polje za pretragu niti mijenjati fokus/filtriranje;
- mora pozivati isti postojeći handler kao klik mišem — ne duplicirati logiku otvaranja akcije;
- ne smije narušiti standardnu combobox navigaciju (Arrow Up/Down, Enter za odabir, Escape, Tab) niti globalnu Enter navigaciju forme (`useFormKeyboardNav`).

Referentna implementacija: `CityCombobox` — tipka `Insert` otvara "Dodaj novi grad" dijalog dok je fokus unutar comboboxa (search input ili lista rezultata), identično kao klik na akciju na dnu liste.

## 19. Tables

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

### Selectable rows

Za tablice u kojima korisnik selektira redak klikom (npr. Smještajne jedinice, Cjenik) koristiti globalno, konzistentno razlikovanje stanja:

- header: `bg-muted/60`
- obični red: bez pozadine
- row hover: `hover:bg-muted/40`
- selected row: `bg-primary/20 font-medium hover:bg-primary/20`, dodatno naglašeno s `border-l-2 border-l-primary` (obični redovi imaju `border-l-2 border-l-transparent` da se rezervira prostor i selekcija ne pomiče sadržaj retka)

Ne koristiti jaku primary pozadinu ni bijeli tekst za selected red — selekcija mora ostati čitljiva i ne smije djelovati kao primarna akcija/button.

Ova pravila su centralizirana u `selectableTableHeaderClass` i `selectableTableRowClass()` (`src/lib/utils.ts`). Nove tablice sa selekcijom retka trebaju koristiti te helpere umjesto lokalnog dupliciranja klasa.

## 20. Status badges

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

## 21. Dialogs, sheets i drawers

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

### Izolacija ugniježđenih modalnih formi

Kad se modal s vlastitom formom (npr. "Dodaj grad / mjesto") otvara iz kontrole koja je sama dio veće forme (npr. combobox unutar `FormField`-a), Dialog sadržaj je DOM-strukturno portaliziran (obično u `document.body`) — ali **ostaje dijete u React component tree-u** na mjestu gdje je renderiran u JSX-u. React sintetički eventi (uključujući `submit` i `keydown`) bubblaju kroz React stablo, ne kroz DOM stablo — pa `submit`/Enter iz portalizirane modalne forme može procuriti do vanjske roditeljske `<form>` i pokrenuti njezinu validaciju/submit, iako to vizualno i DOM-strukturno izgleda kao potpuno odvojena forma.

Pravilo: modal s vlastitom formom ugniježđen (u React smislu) unutar druge forme mora pozvati `e.stopPropagation()` u svom `onSubmit` i `onKeyDown` handleru na `<form>` elementu, kako bi bio zasebna interakcijska cjelina. Ovo nije proizvoljan `stopPropagation` workaround — rješava specifičnu, dokumentiranu osobitost React portala, primijenjenu točno na `submit`/`keydown` razini gdje event inače procuri.

Referentna implementacija: `AddCityDialog` (otvara se iz `CityCombobox`, korištenog unutar `LandlordForm` i `ApartmanModal`).

### Početna kartica kod multi-tab create formi

Kod otvaranja forme za unos novog zapisa početna kartica uvijek mora biti prva/logički početna kartica, ne kartica koja je bila aktivna u prethodnom radu.

Modal s više kartica (tabova) obično ostaje mountiran između otvaranja (samo `open` prop Dialoga se mijenja) — lokalni state za aktivnu karticu zato ne resetira se sam od sebe. Ako se taj state resetira samo pri zatvaranju preko standardnog "Odustani"/Escape puta (npr. `handleClose()`), a uspješan submit poziva `onClose()` izravno (mimo tog resetnog puta), aktivna kartica ostaje "zaglavljena" na onoj koju je korisnik zadnje koristio — sljedeće otvaranje za novi zapis krivo započinje na toj kartici umjesto na prvoj.

Pravilo: reset aktivne kartice na prvu mora biti eksplicitan dio **svakog** puta kojim se create-mode forma smatra "završenom" (uspješan submit, Odustani, Escape) — ne samo jednog od njih. Za edit mode ne mijenjati ponašanje osim ako je dio istog popravka.

Referentna implementacija: `ApartmanModal` (`activeTab` reset u `onSubmit` create grani, uz postojeći reset u `handleClose`).

### Wizard navigacija kod multi-tab formi (Natrag / Dalje / Spremi)

Kod multi-tab/wizard formi gdje kartice predstavljaju korake koji se logički nadovezuju (ne nezavisne cjeline koje se mogu popunjavati proizvoljnim redoslijedom), navigacija mora poštovati sljedeća pravila:

- **Naprijed zahtijeva uspješnu validaciju trenutnog koraka.** Klik na "Dalje" validira SAMO polja koja pripadaju trenutnoj kartici (RHF `form.trigger(poljaTeKartice)`), ne cijelu formu. Ako validacija prođe, prelazi se na sljedeću karticu; ako ne, korisnik ostaje na trenutnoj kartici, postojeće validation poruke (`FormMessage`) se prikazuju kao inače, a fokus se postavlja na prvo neispravno polje (`form.setFocus(polje)`).
- **Natrag je uvijek dopušten**, bez validacije — vraćanje na prethodni korak ne smije nikad biti blokirano.
- **Nije dopušteno preskakanje nevalidiranih koraka.** Klik izravno na naslov kartice (ne kroz "Dalje") ne smije otvoriti korak dalje od najviše kartice koju je korisnik već uspješno validirao — inače korisnik zaobilazi validaciju cijelih koraka. Ne treba disabled izgled na naslovima kartica ako to narušava vizualni dojam taba — dovoljno je da klik na nedostupnu karticu jednostavno ne promijeni aktivnu karticu.
- **Završni "Spremi" postoji samo na posljednjem koraku.** Ranije kartice imaju samo "Dalje" (plus "Natrag" osim na prvoj), zadnja kartica ima "Natrag" + "Odustani" + "Spremi". "Natrag"/"Dalje" moraju biti `type="button"` da ne triggeraju native submit — samo "Spremi" je `type="submit"` i koristi postojeći `form.handleSubmit(onSubmit)` flow.
- **Dodatna zaštita na submitu**: `form.handleSubmit(onSubmit, onInvalid)` — RHF-ov drugi (invalid) callback, ne paralelna validacija — hvata slučaj kad bi Spremi ipak bio pozvan dok neka ranija kartica ima grešku (npr. edit mode gdje su kartice unaprijed otključane). `onInvalid` otvara prvu karticu koja sadrži grešku i fokusira prvo neispravno polje na njoj.
- **Create vs. edit razlika u "koliko je unaprijed otključano"**: kod unosa NOVOG zapisa korisnik mora proći kroz "Dalje" redom (sve kartice osim prve kreću zaključane). Kod UREĐIVANJA postojećeg zapisa, budući da podaci već postoje i pretpostavljeno su prethodno validni, sve kartice mogu odmah biti otključane klikom na naslov — korisnik ne mora ponovno prolaziti kroz "Dalje" da bi došao do zadnje kartice. U oba slučaja validacija na "Dalje" i na "Spremi" ostaje aktivna.

Referentna implementacija: `ApartmanModal` (`TAB_FIELDS` mapping polje→kartica, `handleNext`/`handleBack`/`handleTabClick`, `maxUnlockedTab` state, `onInvalid` handler).

### Focus return nakon zatvaranja modala otvorenog iz druge kontrole

Kad se modal otvori iz kontrole koja sama nestaje/zatvara se u tom trenutku (npr. Popover/Combobox koji se zatvara prije nego se modal otvori), Radixov default `onCloseAutoFocus` ponašanje ("vrati fokus na element koji je bio fokusiran prije otvaranja") može biti nepouzdano jer ta referenca više ne postoji u DOM-u na isti način.

Pravilo: kontrola koja je otvorila modal (ne sam modal) treba ostati vlasnik svog trigger-ref-a i eksplicitno odlučiti kamo se fokus vraća, preko `onCloseAutoFocus` propa na `DialogContent` (`event.preventDefault()` + `triggerRef.current?.focus()`). Modal komponenta samo prosljeđuje taj Radix hook prema van (opcionalni prop) — ne zna i ne treba znati ništa o konkretnoj kontroli koja ga je otvorila, čime ostaje reusable.

To mora vrijediti za sve puteve zatvaranja modala (Escape, Odustani, uspješan submit) jer svi prolaze kroz isti `onOpenChange`/`onCloseAutoFocus` mehanizam.

Referentna implementacija: `CityCombobox` (vlasnik `triggerRef`) + `AddCityDialog` (prosljeđuje `onCloseAutoFocus`).

### Save vs. izlazak iz radnog konteksta

Za veće radne ekrane (npr. uređivanje zapisa s više povezanih cjelina — osnovni podaci, podređeni zapisi, tablice) vrijedi:

- **Save sprema podatke, ali sam po sebi ne zatvara trenutni radni kontekst.** Nakon uspješnog spremanja korisnik ostaje na istom ekranu i može nastaviti raditi.
- **Izlazak iz radnog konteksta (povratak na popis, zatvaranje ekrana i sl.) je zasebna, eksplicitna akcija**, vizualno sekundarna u odnosu na Save.
- Ako u trenutku izlaska postoje nespremljene izmjene, korisnika treba prije izlaska upozoriti na njihov gubitak putem confirmation dialoga (standardni shadcn/Radix `AlertDialog`).
- U takvom confirmation dialogu **sigurnija opcija (odustani od izlaska / ostani na formi) mora biti default** — vizualno i po initial focusu — dok opcija koja odbacuje promjene ne smije biti isticana niti fokusirana pri otvaranju.
- Dirty-state za ovu svrhu prati konkretnu formu koja se sprema (npr. React Hook Form `formState.isDirty`) — ne uključuje podređene zapise koji imaju vlastito, zasebno spremanje (npr. stavke u pratećim tablicama spremane kroz vlastite modalne forme).
- **Save gumb na ovakvim formama je aktivan samo kada postoje nespremljene promjene** (npr. `disabled={!formState.isDirty}`, uz postojeću zaštitu od višestrukog submita dok je spremanje u tijeku). Nakon uspješnog spremanja forma se vraća u "clean" stanje (`reset()`), čime Save ponovno postaje disabled — bez potrebe za zasebnim paralelnim stateom za enabled/disabled.

Referentna implementacija: ekran uređivanja iznajmljivača (`/iznajmljivaci/[id]/uredi`).

### Očuvanje selekcije pri povratku na popis

Kada korisnik napusti detaljnu formu/radni kontekst zapisa (npr. iz `/iznajmljivaci/[id]/uredi`) i vrati se na odgovarajući popis, taj zapis mora ostati selektiran u tablici popisa — bez obzira je li do povratka došlo klikom na Spremi, Odustani, Povratak na popis, ili nakon odbacivanja nespremljenih promjena kroz confirmation dialog.

Preferirani mehanizam (kad projekt nema drugi postojeći globalni state za ovu svrhu): kratkotrajni query parametar u URL-u, npr. `?selected=<id>`, koji stranica popisa pročita jednom pri mountu radi inicijalne selekcije (i po potrebi `scrollIntoView({ block: "nearest" })` ako je red izvan vidljivog područja), a zatim ukloni iz URL-a (`router.replace` bez scrolla) da ne ostane trajno u linku. Obično otvaranje popisa bez tog parametra zadržava postojeće default ponašanje selekcije.

Referentna implementacija: `/iznajmljivaci` (query param `selected`).

## 22. Feedback

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

## 23. Icons

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

## 24. Responsive behavior

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

## 25. Accessibility

Koristiti semantičke HTML elemente i accessibility mogućnosti koje pruža shadcn/Radix.

UI ne smije ovisiti isključivo o boji.

Interaktivni elementi moraju:

- imati vidljiv focus state
- biti dostupni tipkovnicom gdje je primjenjivo
- imati razumljiv naziv
- imati dovoljan kontrast

Custom komponente ne smiju uklanjati accessibility ponašanje koje standardna shadcn/Radix komponenta već pruža.

## 26. Module-specific design

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

## 27. Pravila za Claude Code

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

## 28. Razvoj i dorada dizajna

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

## 29. Granice ovog dokumenta

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
