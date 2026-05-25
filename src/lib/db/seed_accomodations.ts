import "dotenv/config";
import { db } from "./index";
import { accommodations } from "./schema";

const AGENCY_ID = "3ab285b4-6f7c-4b26-a74a-732d121df90a";
const SOSIC_ID = "7c25a065-2c29-407f-abe2-3f132f972eff";
const BEKAVAC_ID = "50e856cd-e39e-41b4-88b9-cba5e4ffbd6e";

const BRELA_CITY_ID = 1;

async function seedAccommodations() {
  await db.insert(accommodations).values([
    // Šošić Renata
    {
      agencyId: AGENCY_ID,
      landlordId: SOSIC_ID,
      name: "Apartman Sunce A1",
      vrstaApartmana: "apartman",
      cityId: BRELA_CITY_ID,
      address: "Šćit 40",
      brojSoba: 2,
      brojKreveta: 4,
      maxOsoba: 5,
      brojZvjezdica: 3,
      aktivan: true,
      prioritetan: false,
    },
    {
      agencyId: AGENCY_ID,
      landlordId: SOSIC_ID,
      name: "Studio More S1",
      vrstaApartmana: "studio",
      cityId: BRELA_CITY_ID,
      address: "Šćit 40",
      brojSoba: 1,
      brojKreveta: 2,
      maxOsoba: 3,
      brojZvjezdica: 3,
      aktivan: true,
      prioritetan: false,
    },
    {
      agencyId: AGENCY_ID,
      landlordId: SOSIC_ID,
      name: "Soba S2",
      vrstaApartmana: "soba",
      cityId: BRELA_CITY_ID,
      address: "Šćit 40",
      brojSoba: 1,
      brojKreveta: 2,
      maxOsoba: 2,
      brojZvjezdica: 2,
      aktivan: true,
      prioritetan: false,
    },

    // Bekavac Ante
    {
      agencyId: AGENCY_ID,
      landlordId: BEKAVAC_ID,
      name: "Apartman Brela B1",
      vrstaApartmana: "apartman",
      cityId: BRELA_CITY_ID,
      address: "Frankopanska 62",
      brojSoba: 3,
      brojKreveta: 6,
      maxOsoba: 7,
      brojZvjezdica: 4,
      aktivan: true,
      prioritetan: true,
    },
    {
      agencyId: AGENCY_ID,
      landlordId: BEKAVAC_ID,
      name: "Apartman Brela B2",
      vrstaApartmana: "apartman",
      cityId: BRELA_CITY_ID,
      address: "Frankopanska 62",
      brojSoba: 2,
      brojKreveta: 4,
      maxOsoba: 5,
      brojZvjezdica: 4,
      aktivan: true,
      prioritetan: false,
    },
    {
      agencyId: AGENCY_ID,
      landlordId: BEKAVAC_ID,
      name: "Studio Bekavac S1",
      vrstaApartmana: "studio",
      cityId: BRELA_CITY_ID,
      address: "Frankopanska 62",
      brojSoba: 1,
      brojKreveta: 2,
      maxOsoba: 3,
      brojZvjezdica: 3,
      aktivan: true,
      prioritetan: false,
    },
  ]);

  console.log("✅ Apartmani uspješno dodani!");
  process.exit(0);
}

seedAccommodations().catch((err) => {
  console.error("❌ Greška:", err);
  process.exit(1);
});
