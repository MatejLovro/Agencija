# SKILL: Line Items Table — Tablice stavki za ponude i račune

## Problem koji rješavamo

Tablice stavki (ponude, računi) imaju input polja za količinu, cijenu i rabat
koja međusobno računaju iznos i ukupno. Naivna implementacija s React Hook Form
`useFieldArray` uzrokuje **gubitak fokusa** na input poljima svaki put kad se
bilo što promijeni u formi.

## Uzrok problema

`useWatch` ili `watch` u parent komponenti re-renderira **cijelo stablo**
svaki put kad se forma promijeni. Re-render unmountira i remountira child
komponente, što ruši fokus na aktivnom inputu.

Lančani efekt:
Korisnik tipka u Cijena input
→ onChange poziva setValue("iznos", ...)
→ useWatch u ParentFormi detektira promjenu
→ ParentForma se re-renderira
→ StavkaRow se re-renderira
→ Input izgubi fokus

## Rješenje — lokalni useState izvan RHF forme

Stavke tablice **nikad ne idu u React Hook Form**. Drže se u lokalnom
`useState` unutar komponente tablice. Parent dobiva podatke kroz `onChange`
callback ili `useRef`.

NovaPonudaClient (RHF forma — samo header polja)
├── DatumFields (izolirani useWatch za datume)
├── PonudaStavkeTable (lokalni useState — BEZ RHF)
│ └── StavkaRowComponent (lokalni useState za hover/opisOpen)
│ ├── ServiceCombobox (lokalni useState za dropdown)
│ └── NumericInput (lokalni useState — propagira na onBlur)
├── SveukupnoDisplay (izolirani useWatch za prikaz ukupnog)
└── PredujamFields (izolirani useWatch za predujam)

## Ključna pravila

### Pravilo 1 — Root forma komponenta nema nijedan watch

```typescript
// ❌ ZABRANJENO u root komponenti
const stavke = watch("stavke");
const sveukupno = stavke.reduce(...);

// ✅ ISPRAVNO — izvuci u izoliranu komponentu
function SveukupnoDisplay({ control }) {
  const stavke = useWatch({ control, name: "stavke" });
  const sveukupno = stavke.reduce(...);
  return <span>{sveukupno}</span>;
}
```

### Pravilo 2 — Stavke su lokalni useState

```typescript
// ❌ ZABRANJENO
const { fields, append } = useFieldArray({ control, name: "stavke" });

// ✅ ISPRAVNO
const [stavke, setStavke] = useState<StavkaRow[]>([]);
```

### Pravilo 3 — NumericInput propagira vrijednost na onBlur

```typescript
// ❌ ZABRANJENO — svaki keystroke triggerira vanjski setState
<input onChange={(e) => onExternalChange(parseFloat(e.target.value))} />

// ✅ ISPRAVNO — lokalni state, propagacija tek na blur
function NumericInput({ value, onChange }) {
  const [localValue, setLocalValue] = useState(String(value));
  return (
    <input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={() => {
        const parsed = parseFloat(localValue);
        const final = isNaN(parsed) ? 0 : parsed;
        setLocalValue(String(final));
        onChange(final);
      }}
    />
  );
}
```

### Pravilo 4 — Parent dobiva stavke kroz useRef

```typescript
// U root komponenti — ne uzrokuje re-render
const stavkeRef = useRef<StavkaRow[]>([]);

<PonudaStavkeTable
  onChange={(stavke) => { stavkeRef.current = stavke; }}
/>

// Submit čita iz ref-a
async function onSubmit(values) {
  const stavke = stavkeRef.current;
}
```

### Pravilo 5 — Sveukupno kroz useState u root komponenti

```typescript
// Sveukupno treba biti vidljivo u UI — jedini useState koji je dopušten
const [sveukupno, setSveukupno] = useState(0);

<PonudaStavkeTable
  onChange={(stavke) => {
    stavkeRef.current = stavke;
    setSveukupno(stavke.reduce((sum, s) => sum + s.bruto, 0));
  }}
/>
```

## Tip StavkaRow

```typescript
export type StavkaRow = {
  id: string; // crypto.randomUUID() — samo za React key prop
  serviceId: string;
  serviceText: string;
  dodatniOpis: string | null;
  kolicina: number;
  cijena: number;
  rabat: number;
  iznos: number; // kolicina * cijena * (1 - rabat/100)
  taxId: string | null;
  taxStopa: number;
  taxNaziv: string | null;
  bruto: number; // iznos * (1 + taxStopa/100)
};
```

## Struktura komponenti

### PonudaStavkeTable — glavna komponenta

```typescript
export default function PonudaStavkeTable({ services, onChange, onAddNewService }) {
  const [stavke, setStavke] = useState<StavkaRow[]>([]);

  function updateStavke(next: StavkaRow[]) {
    setStavke(next);
    onChange(next);
  }

  // Spriječi dodavanje novog reda dok zadnji nema serviceId
  const lastHasService =
    stavke.length === 0 || stavke[stavke.length - 1].serviceId !== "";

  return (
    <table>
      {stavke.map((stavka, index) => (
        <StavkaRowComponent
          key={stavka.id}
          stavka={stavka}
          onUpdate={(updated) => updateStavke(
            stavke.map((s, i) => i === index ? updated : s)
          )}
          onRemove={() => updateStavke(stavke.filter((_, i) => i !== index))}
        />
      ))}
      <Button disabled={!lastHasService} onClick={() => updateStavke([...stavke, newStavka()])}>
        Dodaj novi red
      </Button>
    </table>
  );
}
```

### StavkaRowComponent — jedan redak

```typescript
function StavkaRowComponent({ stavka, services, onUpdate, onRemove, onAddNewService }) {
  // Lokalni state za UI stanje — ne utječe na parent
  const [hovered, setHovered] = useState(false);
  const [opisOpen, setOpisOpen] = useState(false);

  function update(partial: Partial<StavkaRow>) {
    const next = { ...stavka, ...partial };
    // Uvijek rekalkuliraj iznos i bruto
    const iznos = next.kolicina * next.cijena * (1 - next.rabat / 100);
    const bruto = iznos * (1 + next.taxStopa / 100);
    onUpdate({ ...next, iznos, bruto });
  }

  function handleServiceChange(id: string) {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const cijena = parseFloat(service.cijena ?? "0");
    const taxStopa = parseFloat(service.taxStopa ?? "0");
    const iznos = stavka.kolicina * cijena * (1 - stavka.rabat / 100);
    const bruto = iznos * (1 + taxStopa / 100);
    onUpdate({
      ...stavka,
      serviceId: id,
      serviceText: service.naziv,
      cijena,
      taxId: service.taxId,
      taxStopa,
      taxNaziv: service.taxNaziv,
      iznos,
      bruto,
    });
  }

  return (
    <tr>
      <td>
        <ServiceCombobox
          value={stavka.serviceId}
          onChange={handleServiceChange}
          onAddNew={onAddNewService}
        />
        {opisOpen && (
          <textarea
            value={stavka.dodatniOpis ?? ""}
            onChange={(e) => onUpdate({ ...stavka, dodatniOpis: e.target.value })}
            autoFocus
          />
        )}
      </td>
      <td>
        <NumericInput value={stavka.kolicina} onChange={(val) => update({ kolicina: val })} />
      </td>
      <td>
        <NumericInput value={stavka.cijena} onChange={(val) => update({ cijena: val })} />
      </td>
      <td>
        <NumericInput value={stavka.rabat} onChange={(val) => update({ rabat: val })} />
      </td>
      <td>{stavka.iznos.toFixed(2)}</td>
      <td>{stavka.taxId ? `${stavka.taxStopa}%` : "—"}</td>
      <td>{stavka.bruto.toFixed(2)}</td>
    </tr>
  );
}
```

### ServiceCombobox — odabir usluge

```typescript
interface ServiceOption {
  id: string;
  naziv: string;
  cijena: string | null;
  taxId: string | null;
  taxStopa: string | null;
  taxNaziv: string | null;
}

interface Props {
  services: ServiceOption[];
  value: string;
  onChange: (id: string) => void;
  onAddNew?: () => void; // opcionalni callback za modal dodavanja usluge
}
```

Dropdown se zatvara s `onMouseDown + e.preventDefault()` na opcijama —
sprječava blur prije nego se klik registrira.

Na dnu liste opcija, ako je `onAddNew` proslijeđen, prikazuje se
"Dodaj novu uslugu" gumb koji poziva `onAddNew()`.

## Validacija stavki

Stavke nisu u RHF formi pa ih Zod ne validira automatski.
Ručna provjera u `onSubmit`:

```typescript
async function onSubmit(values: OfferFormValues) {
  if (stavkeRef.current.length === 0) {
    alert("Dodaj barem jednu stavku.");
    return;
  }
  // ... nastavak submita
}
```

## Predujam — međuovisna polja

Predujam % i predujam iznos su međuovisna polja:

- Promjena % → izračunaj iznos = ukupno \* posto / 100
- Promjena iznosa → izračunaj % = iznos / ukupno \* 100

Oba su u RHF formi. Čitaju `sveukupno` kao prop (ne watchaju stavke).

```typescript
function PredujamFields({ control, setValue, sveukupno }) {
  const predujamPostotak = useWatch({ control, name: "predujamPostotak" });
  const predujam = useWatch({ control, name: "predujam" });
  // ... međuovisna logika
}
```

## Kolone tablice stavki (standard za ponude/račune)

| Kolona          | Izvor                            | Napomena                            |
| --------------- | -------------------------------- | ----------------------------------- |
| Naziv           | `serviceText` iz `offers_stavke` | Editabilan nakon odabira usluge     |
| Dodatni opis    | `dodatniOpis` iz `offers_stavke` | Expandable, on-hover ➕             |
| Količina        | `kolicina`                       | NumericInput                        |
| Cijena          | `cijena`                         | NumericInput                        |
| Popust %        | `rabat`                          | NumericInput                        |
| Iznos bez PDV-a | kalkulirano                      | kolicina × cijena × (1 - rabat/100) |
| Porez           | `taxStopa` iz `taxes`            | Read-only, povlači se iz services   |
| Ukupno (bruto)  | kalkulirano                      | Iznos × (1 + taxStopa/100)          |

## PDF generiranje stavki (@react-pdf/renderer)

Za PDF trebamo dodatne podatke koji nisu u lokalnom state —
dohvaćamo ih posebnim queryem koji joinuje `offers_stavke` i `services`:

```typescript
const stavkeRows = await db
  .select({
    id: offersStavke.id,
    serviceText: offersStavke.serviceText,
    dodatniOpis: offersStavke.dodatniOpis,
    jedMjere: services.jedMjere, // iz services — nije u offers_stavke
    kolicina: offersStavke.kolicina,
    cijena: offersStavke.cijena,
    rabat: offersStavke.rabat,
    iznos: offersStavke.iznos,
    bruto: offersStavke.bruto,
  })
  .from(offersStavke)
  .innerJoin(services, eq(offersStavke.serviceId, services.id))
  .where(eq(offersStavke.offerId, offerId));
```

## Datoteke u projektu

src/
├── components/
│ ├── line-items/
│ │ ├── ServiceCombobox.tsx
│ │ ├── NumberField.tsx (za RHF kontekst — useController)
│ │ ├── IznosField.tsx (za RHF kontekst — useController)
│ │ ├── PorezField.tsx (za RHF kontekst — useController)
│ │ └── DodatniOpisField.tsx (za RHF kontekst — useController)
│ └── pdf/
│ └── PonudaPdf.tsx
├── app/
│ ├── (dashboard)/
│ │ └── ponude/
│ │ ├── nova/
│ │ │ ├── page.tsx
│ │ │ ├── NovaPonudaClient.tsx
│ │ │ └── PonudaStavkeTable.tsx
│ │ ├── page.tsx
│ │ └── PonudeClient.tsx
│ └── api/
│ └── ponude/
│ └── [id]/
│ └── pdf/
│ └── route.ts

## Napomene za buduće projekte

- `NumberField`, `IznosField`, `PorezField`, `DodatniOpisField` su
  generički kroz TypeScript generike (`Control<T>`, `Path<T>`) —
  rade s bilo kojom RHF formom
- `ServiceCombobox` i `NumericInput` su neovisni o RHF —
  rade s bilo kojim lokalnim state pristupom
- `StavkaRow` tip prilagodi domenskim potrebama projekta
  (dodaj/ukloni polja), ali zadrži `id: string` za React key prop
- Neon HTTP driver ne podržava transakcije — insert offers pa
  insert offers_stavke sekvencijalno (ne atomarno)
