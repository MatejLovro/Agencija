import { db } from "./index";
import { agencies, cities, landlords } from "./schema";

async function seed() {
  // 1. Umetni agenciju
  const [agency] = await db
    .insert(agencies)
    .values({
      name: "Fiskalna agencija d.o.o.",
      oib: "12345678901",
      address: "Obala kralja Tomislava 15",
      phone: "021 123 456",
      email: "info@fiskalna-agencija.com",
    })
    .returning();

  // 2. Umetni gradove
  const insertedCities = await db
    .insert(cities)
    .values([
      { name: "Brela", zip: "21322" },
      { name: "Baška Voda", zip: "21320" },
      { name: "Makarska", zip: "21300" },
      { name: "Tučepi", zip: "21325" },
      { name: "Podgora", zip: "21327" },
    ])
    .returning();

  const cityId = (name: string) =>
    insertedCities.find((c) => c.name === name)!.id;

  // 3. Umetni iznajmljivače
  await db.insert(landlords).values([
    {
      agencyId: agency.id,
      surname: "Šošić",
      name: "Renata",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "88454806149",
      cityId: cityId("Brela"),
      address: "Šćit 40",
      phone: "091 234 5678",
      iban: "HR1210010051863000160",
      tipProvizije: "P",
      iznos: "12.00",
    },
    {
      agencyId: agency.id,
      surname: "Bekavac",
      name: "Ante",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "42299630551",
      cityId: cityId("Brela"),
      address: "Frankopanska 62",
      phone: "098 345 6789",
      iban: "HR1210010051863000161",
      tipProvizije: "P",
      iznos: "12.00",
    },
    {
      agencyId: agency.id,
      surname: "Batinić",
      name: "Ivan",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "99825824836",
      cityId: cityId("Baška Voda"),
      address: "Naputica 21",
      phone: "091 781 6578",
      iban: "HR1210010051863000162",
      tipProvizije: "P",
      iznos: "12.00",
    },
    {
      agencyId: agency.id,
      surname: "Mavindra d.o.o.",
      name: "",
      vrstaIznajmljivaca: "tvrtka",
      oib: "22400552273",
      cityId: cityId("Baška Voda"),
      address: "Prilaz Gradini 2",
      phone: "021 611 222",
      iban: "HR1210010051863000163",
      tipProvizije: "P",
      iznos: "16.00",
    },
    {
      agencyId: agency.id,
      surname: "Višak",
      name: "Zrinka",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "65962643101",
      cityId: cityId("Baška Voda"),
      address: "Makarska 85",
      phone: "095 456 7890",
      iban: "HR1210010051863000164",
      tipProvizije: "P",
      iznos: "14.00",
    },
    {
      agencyId: agency.id,
      surname: "Carević",
      name: "Stanka",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "62004468739",
      cityId: cityId("Brela"),
      address: "Frankopanska 28",
      phone: "059 900 0065",
      iban: "HR1210010051863000165",
      tipProvizije: "P",
      iznos: "12.00",
    },
    {
      agencyId: agency.id,
      surname: "Čagalj",
      name: "Dalibor",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "49452834778",
      cityId: cityId("Makarska"),
      address: "Don M. Pavlinovića 13",
      phone: "095 831 4237",
      iban: "HR1210010051863000166",
      tipProvizije: "P",
      iznos: "0.00",
    },
    {
      agencyId: agency.id,
      surname: "Radeljić",
      name: "Suzana",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "22630405413",
      cityId: cityId("Brela"),
      address: "Ivana Gundulića 22",
      phone: "095 822 5008",
      iban: "HR1210010051863000167",
      tipProvizije: "P",
      iznos: "8.00",
    },
    {
      agencyId: agency.id,
      surname: "Krželj",
      name: "Mijo",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "05830314844",
      cityId: cityId("Brela"),
      address: "Frankopanska 54",
      phone: "+1 516 476 9309",
      iban: "HR1210010051863000168",
      tipProvizije: "P",
      iznos: "15.00",
    },
    {
      agencyId: agency.id,
      surname: "Žamić",
      name: "Anamarija",
      vrstaIznajmljivaca: "fizicka_osoba",
      oib: "62330380531",
      cityId: cityId("Brela"),
      address: "Frankopanska 8A",
      phone: "092 567 8901",
      iban: "HR1210010051863000169",
      tipProvizije: "P",
      iznos: "12.00",
    },
  ]);

  console.log("✅ Seed uspješan!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Greška:", err);
  process.exit(1);
});
