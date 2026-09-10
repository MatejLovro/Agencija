# Sidebar Design Specification

## 1. Svrha

Sidebar je primarna navigacija aplikacije.

Treba biti:

- kompaktan
- brz za skeniranje
- vizualno miran
- konzistentan s ostatkom aplikacije
- prilagođen desktop poslovnom radu

Gornji horizontalni izbornik se ne koristi. Sve glavne navigacijske opcije nalaze se u sidebaru.

---

## 2. Naziv aplikacije

U gornjem lijevom dijelu sidebara prikazuje se:

`AGENCIJA`

U expanded stanju prikazuje se puni naziv.

Ako se kasnije koristi collapsed sidebar, dopušteno je koristiti skraćeni prikaz poput:

`AG`

ili odgovarajući logo/ikonu.

---

## 3. Vizualni stil

Sidebar koristi tamnu navy paletu prema odabranoj referenci.

Točne boje:

- Sidebar background: `#21263C`
- Sidebar header background: `#181C2E`
- Normal text / icon color: `#EBEAF2`
- Active item background: `#408DFB`
- Hover item background: `#333850`

Ove vrijednosti treba centralizirati kroz postojeće sidebar/theme tokene gdje god je moguće.
Ne hardkodirati iste vrijednosti po pojedinačnim komponentama.

### Sidebar header

Gornji dio sidebara s nazivom:

`AGENCIJA`

koristi pozadinu:

`#181C2E`

Ostatak sidebara koristi:

`#21263C`

Header treba biti jasno, ali nenametljivo odvojen od navigacijskog dijela.

### Normal state

Dostupne glavne opcije i podopcije koriste:

`#EBEAF2`

Ne prigušivati podopcije samo zato što nisu aktivne.

Ikone mogu koristiti istu boju kao tekst.

### Hover state

Hover pozadina:

`#333850`

Hover se prikazuje kao zaobljena površina unutar sidebara, s horizontalnim razmakom od rubova.

Hover ne smije mijenjati layout ili širinu stavke.

### Active state

Aktivna navigacijska opcija koristi:

- background: `#408DFB`
- foreground: vrlo svijetli tekst, odnosno postojeći sidebar-primary-foreground token ako vizualno odgovara referenci

Aktivna stavka mora biti glavni vizualni indikator trenutne lokacije.

Ne mijenjati font weight podopcije samo zato što je aktivna.
Selektor/background dovoljno jasno označava aktivno stanje.

---

## 4. Font i tipografija

Koristi postojeći font definiran u aplikaciji.

Ne uvoditi novi font samo za sidebar.

Glavne stavke trebaju imati normalnu ili medium težinu.

Podstavke mogu biti vizualno nešto diskretnije.

---

## 5. Širina

Expanded sidebar:

- približno 230–250 px

Collapsed sidebar:

- približno 64–72 px

Točne vrijednosti mogu se prilagoditi postojećem shadcn Sidebar layoutu i ukupnom dashboard layoutu.

Prioritet je da nazivi poput:

`Računi za iznajmljivača`

budu čitljivi bez nepotrebnog lomljenja teksta.

---

## 5.1. Navigacijski spacing i tipografija

Glavne navigacijske opcije trebaju imati više vertikalnog prostora nego u prvoj implementaciji.

Cilj je približiti proporcije referentnom sidebaru:

- glavni menu item: približno 38–42 px visine
- podopcija: približno 34–38 px visine
- horizontalni padding itema: približno 12 px
- razmak između glavnih navigacijskih stavki/grupa: približno 6–10 px
- razmak unutar otvorene grupe između podopcija ostaje kompaktniji

Font glavnih opcija treba biti malo veći nego u prvoj implementaciji.

Preporučeni cilj:

- glavne opcije/grupe: približno 14–15 px
- podopcije: približno 14 px

Točne vrijednosti prilagoditi postojećoj tipografskoj skali projekta.

Podopcije koje su dostupne koriste istu osnovnu boju teksta `#EBEAF2` kao aktivne i glavne opcije.

Disabled podopcije ostaju prigušene jer predstavljaju nedostupnu funkciju.

---

## 6. Glavna struktura navigacije

### Početna

Samostalna navigacijska opcija.

Predložena Lucide ikona:

`House`

Vodi na početnu stranicu aplikacije.

---

### Kalendar rezervacija

Samostalna navigacijska opcija bez podizbornika.

Predložena Lucide ikona:

`CalendarRange`

Vodi na glavni Gantt / kalendar rezervacija.

---

### Pregledi

Collapsible grupa.

Predložena Lucide ikona:

`Table`

Podopcije:

- Pregled prijava
- Pregled rezervacija

---

### Računi i ponude

Collapsible grupa.

Predložena Lucide ikona:

`Receipt`

Podopcije:

- Ponude
- Računi za gosta
- Računi za iznajmljivača

---

### Matični podaci

Collapsible grupa.

Predložena Lucide ikona:

`Database`

Podopcije:

#### Subjekti

- Iznajmljivači
- Gosti
- Agencije / Partneri

Separator

#### Lokacijski podaci

- Gradovi
- Državljanstva

Separator

#### Poslovni šifrarnici

- Usluge
- Porezne stope
- Sredstva plaćanja
- Jedinice mjere

Separator

#### Organizacija i postavke

- Poslovnice
- Podešavanja

---

## 7. Collapsible ponašanje

Grupe:

- Pregledi
- Računi i ponude
- Matični podaci

mogu se otvarati i zatvarati.

Desno od naziva grupe koristi se chevron:

`>`

Vizualno koristiti odgovarajuću Lucide chevron ikonu, npr. `ChevronRight`.

Kada je grupa otvorena, chevron se rotira prema dolje.

Ne koristiti znak `+` za otvaranje grupa.

Klik na naslov grupe otvara ili zatvara grupu.

---

## 8. Podopcije

Podopcije trebaju biti uvučene u odnosu na glavne stavke.

Mogu koristiti:

- manju Lucide ikonu
- nešto diskretniji tekst
- manji horizontalni padding

U prvoj implementaciji koristiti ikone i na podopcijama.

Ikone podopcija trebaju biti:

- manje od ikona glavnih stavki
- vizualno diskretnije
- bez zasebne pozadine

Nakon vizualne provjere dopušteno je ukloniti ikone sa svih podopcija ako sidebar djeluje pretrpano.

Ne koristiti nekonzistentno rješenje gdje neke podopcije imaju ikonu, a druge ne, osim ako postoji jasan semantički razlog.

---

## 8.1. Ikone podopcija

U prvoj verziji podopcije imaju Lucide ikone.

Ikone podopcija:

- trebaju biti nešto manje od ikona glavnih opcija
- koriste istu osnovnu foreground boju kao tekst
- ne trebaju biti dodatno muted ako je opcija dostupna
- disabled opcije mogu imati smanjen opacity

Ako sidebar nakon implementacije izgleda pretrpano, dopušteno je kasnije ukloniti ikone sa svih podopcija bez promjene strukture navigacije.

---

## 9. Vizualna hijerarhija podopcija

Podopcije trebaju jasno pripadati svojoj grupi.

Preporučeno:

- horizontalno uvlačenje
- diskretna vertikalna linija uz submenu

Vertikalna linija treba biti vrlo suptilna.

Ne koristiti izražene dekorativne elemente.

---

## 10. Separatori

Separatori se koriste samo unutar grupe `Matični podaci`.

Njihova svrha je vizualno odvojiti logičke cjeline.

Separator treba biti:

- diskretan
- uvučen zajedno s podopcijama
- tanak
- slabijeg kontrasta od aktivnih i hover stanja

Ne koristiti punu jaku horizontalnu crtu preko cijelog sidebara.

---

## 11. Active state

Aktivna ruta mora biti jasno označena.

Ako je aktivna podopcija unutar collapsible grupe:

- podopcija dobiva active state
- roditeljska grupa ostaje otvorena

Primjer:

`Matični podaci > Iznajmljivači`

Sidebar mora ostati otvoren na grupi `Matični podaci`, a `Iznajmljivači` mora biti jasno označen kao aktivan.

---

## 12. Hover state

Svaka interaktivna stavka treba imati hover stanje.

Hover:

- koristi nešto svjetliju tamnoplavu pozadinu
- ne smije biti jači od active statea
- treba raditi na glavnim stavkama i podopcijama

Transition treba biti kratak i nenametljiv.

---

## 13. Sidebar header

Header sidebara treba sadržavati samo identitet aplikacije:

`AGENCIJA`

Ne dodavati:

- sekundarni opis
- naziv modula
- dodatne akcijske gumbe

osim ako se naknadno pokaže konkretna potreba.

---

## 14. Početna stranica

`Početna` je zasebna ruta i nije isto što i `Kalendar rezervacija`.

Za sada početna stranica treba biti gotovo prazna.

Ne koristiti klasični dashboard sa:

- statistikama
- grafovima
- KPI karticama
- quick action panelima
- velikim welcome porukama

Početna treba imati ugodnu, vrlo suptilnu pozadinu koja ne izgleda potpuno prazno, ali ne odvlači pažnju.

Pozadina može koristiti:

- vrlo blagi tonalni prijelaz
- diskretan neutralni pattern
- postojeće theme tokene

Ne koristiti dominantne ilustracije ili jake fotografije.

---

## 15. Buduća funkcija početne stranice

Početna stranica je predviđena kao buduća interna radna ploča agencije.

Mogući budući sadržaj:

- interni podsjetnici između smjena
- informacije tko je i zbog čega dao određenu informaciju
- apartman koji treba očistiti
- apartman koji treba pripremiti za gosta
- napomene o dolasku gosta
- operativni podsjetnici

Ti elementi trebaju kasnije biti implementirani kao moderne note kartice usklađene s design systemom.

Ne trebaju izgledati kao doslovna imitacija papirnatog Post-it papirića.

---

## 16. Horizontalni izbornik

Postojeći gornji horizontalni navigacijski izbornik treba biti potpuno uklonjen.

Opcije poput:

- Matični podaci
- Pregledi
- Izvješća
- Servisne funkcije

ne trebaju se duplicirati iznad sadržaja ako već postoje u sidebaru.

Sidebar je jedina primarna navigacija.

---

## 17. Shadcn/ui

Koristi postojeću shadcn Sidebar implementaciju kao osnovu.

Preferirati postojeće komponente:

- `Sidebar`
- `SidebarHeader`
- `SidebarContent`
- `SidebarGroup`
- `SidebarMenu`
- `SidebarMenuItem`
- `SidebarMenuButton`
- `SidebarMenuSub`
- `SidebarMenuSubItem`
- `SidebarMenuSubButton`

Za collapsible grupe koristiti postojeći shadcn/Radix `Collapsible` pattern gdje je prikladno.

Ne uvoditi novu UI biblioteku.

---

## 18. Lucide ikone

Koristi Lucide ikone.

Glavne stavke:

- Početna — `House`
- Kalendar rezervacija — `CalendarRange`
- Pregledi — `Table`
- Računi i ponude — `Receipt`
- Matični podaci — `Database`

Točne ikone podopcija mogu se odabrati tijekom implementacije, ali trebaju biti:

- semantički razumljive
- jednostavne
- vizualno konzistentne
- manje od glavnih ikona

Ne koristiti dekorativne ikone bez funkcionalnog razloga.

---

## 19. Opća pravila

Sidebar mora izgledati kao sastavni dio iste aplikacije kao forme, tablice i ostali shadcn elementi.

Prioriteti:

1. jasna navigacija
2. brzina korištenja
3. dosljednost
4. kompaktan layout
5. minimalna vizualna buka

Ne dodavati funkcionalnosti ili navigacijske elemente koji nisu definirani ovom specifikacijom.
