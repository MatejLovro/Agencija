import "dotenv/config";
import { db } from "./index";
import { pricelist } from "./schema";

const APT1_ID = "77f7d33e-c6db-4b9d-98b2-06a7fc834c1c"; // Šošić - Apartman Sunce A1
const APT2_ID = "f36230bd-f884-428a-84e5-390ce1afb9e5"; // Bekavac - Apartman Brela B1

async function seedPricelist() {
  await db.insert(pricelist).values([
    // Apartman Sunce A1 — Šošić
    {
      accommodationId: APT1_ID,
      dateFrom: "2025-05-01",
      dateTo: "2025-06-30",
      pricePerNight: "70.00",
    },
    {
      accommodationId: APT1_ID,
      dateFrom: "2025-07-01",
      dateTo: "2025-08-31",
      pricePerNight: "110.00",
    },
    {
      accommodationId: APT1_ID,
      dateFrom: "2025-09-01",
      dateTo: "2025-09-30",
      pricePerNight: "80.00",
    },

    // Apartman Brela B1 — Bekavac
    {
      accommodationId: APT2_ID,
      dateFrom: "2025-05-01",
      dateTo: "2025-06-30",
      pricePerNight: "90.00",
    },
    {
      accommodationId: APT2_ID,
      dateFrom: "2025-07-01",
      dateTo: "2025-08-31",
      pricePerNight: "150.00",
    },
    {
      accommodationId: APT2_ID,
      dateFrom: "2025-09-01",
      dateTo: "2025-09-30",
      pricePerNight: "100.00",
    },
  ]);

  console.log("✅ Cjenici uspješno dodani!");
  process.exit(0);
}

seedPricelist().catch((err) => {
  console.error("❌ Greška:", err);
  process.exit(1);
});
