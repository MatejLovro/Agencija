import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema/offers";
import { offersStavke } from "@/lib/db/schema/offers_stavke";
import { reservations } from "@/lib/db/schema/reservations";
import { accommodations } from "@/lib/db/schema/accommodations";
import { landlords } from "@/lib/db/schema/landlords";
import { services } from "@/lib/db/schema/services";
import { taxes } from "@/lib/db/schema/taxes";
import { eq, and } from "drizzle-orm";

// Tip koji vraćamo za prikaz rezervacije na formi ponude
export type ReservationForOffer = {
  id: string;
  guestSurname: string;
  guestName: string;
  phone: string | null;
  email: string | null;
  partnerId: string | null;
  dateFrom: string;
  dateTo: string;
  rezervationValid: string | null;
  createdAt: Date | null;
  status: "nepotvrdjena" | "potvrdjena";
  accommodationName: string;
  landlordName: string;
  landlordSurname: string;
};

export type ServiceForOffer = {
  id: string;
  naziv: string;
  cijena: string | null;
  taxId: string | null;
  taxStopa: string | null;
  taxNaziv: string | null;
};

export type OfferStavkaInsert = {
  offerId: string;
  serviceId: string;
  serviceText: string;
  kolicina: string;
  cijena: string;
  rabat: string;
  iznos: string;
  taxId: string | null;
  bruto: string;
};

export type OfferInsert = {
  agencyId: string;
  datum: string;
  idRezervacija: string;
  idPartner: string | null;
  ponudaVrijedaDana: number | null;
  doDatuma: string | null;
  predujam: string | null;
  predujamPostotak: string | null;
  tekstNaDnu: string | null;
};

// Dohvati rezervaciju s podacima potrebnim za formu ponude
export async function getReservationForOffer(
  rezervacijaId: string,
  agencyId: string,
): Promise<ReservationForOffer | null> {
  const rows = await db
    .select({
      id: reservations.id,
      guestSurname: reservations.guestSurname,
      guestName: reservations.guestName,
      phone: reservations.phone,
      email: reservations.email,
      partnerId: reservations.partnerId,
      dateFrom: reservations.dateFrom,
      dateTo: reservations.dateTo,
      rezervationValid: reservations.rezervationValid,
      createdAt: reservations.createdAt,
      status: reservations.status,
      accommodationName: accommodations.name,
      landlordName: landlords.name,
      landlordSurname: landlords.surname,
    })
    .from(reservations)
    .innerJoin(
      accommodations,
      eq(reservations.accommodationId, accommodations.id),
    )
    .innerJoin(landlords, eq(accommodations.landlordId, landlords.id))
    .where(
      and(
        eq(reservations.id, rezervacijaId),
        eq(reservations.agencyId, agencyId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

// Dohvati sve usluge za agenciju (za dropdown u tablici stavki)
export async function getServicesForOffer(
  agencyId: string,
): Promise<ServiceForOffer[]> {
  const rows = await db
    .select({
      id: services.id,
      naziv: services.naziv,
      cijena: services.cijena,
      taxId: services.taxId,
      taxStopa: taxes.stopa,
      taxNaziv: taxes.naziv,
    })
    .from(services)
    .leftJoin(taxes, eq(services.taxId, taxes.id))
    .where(eq(services.agencyId, agencyId));

  return rows;
}

// Spremi ponudu s stavkama (transakcija)
export async function createOffer(
  offer: OfferInsert,
  stavke: Omit<OfferStavkaInsert, "offerId">[],
): Promise<string> {
  return await db.transaction(async (tx) => {
    const [newOffer] = await tx
      .insert(offers)
      .values(offer)
      .returning({ id: offers.id });

    if (stavke.length > 0) {
      await tx.insert(offersStavke).values(
        stavke.map((s) => ({
          ...s,
          offerId: newOffer.id,
        })),
      );
    }

    return newOffer.id;
  });
}
