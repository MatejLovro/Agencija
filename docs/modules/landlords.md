## 74. Validation schema

Forma iznajmljivača koristi:

```text
src/lib/validations/landlord.ts
```

i Zod schemu:

```text
landlordSchema
```

Validacija je podijeljena na:

```text
zajednička polja
+
pravila prema vrsti iznajmljivača
+
pravila prema tipu provizije
```


## 75. OIB validacija

OIB mora:

- imati točno 11 znakova
- sadržavati samo znamenke
- proći poslovnu provjeru `validateOib()`

Validacija formata OIB-a zato nije samo provjera duljine.


## 76. Zajednička obavezna polja

Za sve vrste iznajmljivača obavezni su najmanje:

```text
oib
cityId
address
iban
vrstaIznajmljivaca
tipProvizije
```

Ostala obavezna polja ovise o vrsti iznajmljivača i tipu provizije.


## 77. Zajednička opcionalna polja

Opcionalni su:

```text
phone
email
rjesenje
brUgovora
eVisitName
eVisitPass
```

Prazni string dopušten je za ova tekstualna polja.

Ako je email unesen, mora biti ispravnog email formata.


## 78. Maksimalne duljine

Validation schema trenutno ograničava:

```text
address      max 100
phone        max 50
email        max 100
iban         max 50
rjesenje     max 30
brUgovora    max 30
eVisitName   max 30
eVisitPass   max 30
```

Nazivi i imena vezani uz vrstu iznajmljivača ograničeni su na 30 znakova.


## 79. Fizička osoba

Za:

```text
vrstaIznajmljivaca = fizicka_osoba
```

obavezni su:

```text
surname
name
datumRodjenja
```

Datum rođenja mora proći:

```text
validateDatumRodjenja()
```

Trenutna validation poruka navodi da datum mora biti ispravan i da iznajmljivač ne smije imati više od 85 godina.


## 80. Fizička osoba u PDV-u

Za:

```text
vrstaIznajmljivaca = fizicka_osoba_pdv
```

vrijede ista pravila kao za običnu fizičku osobu:

```text
surname
name
datumRodjenja
```

su obavezni.


## 81. Obrt

Za:

```text
vrstaIznajmljivaca = obrt
```

obavezni su:

```text
surname
→ naziv obrta

name
→ ime vlasnika
```

Datum rođenja je opcionalan.

Ako je unesen, mora proći `validateDatumRodjenja()`.


## 82. Tvrtka

Za:

```text
vrstaIznajmljivaca = tvrtka
```

obavezan je:

```text
surname
→ naziv tvrtke
```

`name` i `datumRodjenja` su opcionalni.


## 83. Validacija postotne provizije

Ako je:

```text
tipProvizije = P
```

`iznos` mora biti:

```text
> 0
< 100
```

Schema trenutno ograničava maksimalnu vrijednost na:

```text
99.99
```


## 84. Validacija individualne provizije

Ako je:

```text
tipProvizije = I
```

validation schema zahtijeva:

```text
iznos = 0
```

To potvrđuje da `I` u trenutnoj implementaciji ne predstavlja jedan fiksni iznos spremljen na iznajmljivaču, nego slučaj u kojem se iznos provizije određuje drugdje u poslovnom procesu.


## 85. TypeScript tip forme

Tip forme izvodi se direktno iz Zod sheme:

```text
LandlordFormValues =
  z.infer<typeof landlordSchema>
```

Zod schema je zato glavni source of truth za oblik podataka koje `LandlordForm` prihvaća.