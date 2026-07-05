import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema/offers";
import { offersStavke } from "@/lib/db/schema/offers_stavke";
import { reservations } from "@/lib/db/schema/reservations";
import { accommodations } from "@/lib/db/schema/accommodations";
import { landlords } from "@/lib/db/schema/landlords";
import { services } from "@/lib/db/schema/services";
import { taxes } from "@/lib/db/schema/taxes";
import { partners } from "@/lib/db/schema/partners";
import { cities } from "@/lib/db/schema/cities";
import { eq, and, desc, inArray } from "drizzle-orm";

// Tip koji vraćamo za prikaz rezervacije na formi p  onude
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
  dodatniOpis: string | null;
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
  const [newOffer] = await db
    .insert(offers)
    .values(offer)
    .returning({ id: offers.id });

  if (stavke.length > 0) {
    await db.insert(offersStavke).values(
      stavke.map((s) => ({
        ...s,
        offerId: newOffer.id,
      })),
    );
  }

  return newOffer.id;
}

export type OfferTableRow = {
  id: string;
  broj: number;
  datum: string;
  doDatuma: string | null;
  ponudaVrijedaDana: number | null;
  predujam: string | null;
  poslana: boolean;
  rezervacijaBroj: number;
  guestSurname: string;
  guestName: string;
  partnerNaziv: string | null;
  landlordSurname: string;
  landlordName: string;
  accommodationName: string;
  dateFrom: string;
  dateTo: string;
  cijena: number;
};

export async function getOffers(agencyId: string): Promise<OfferTableRow[]> {
  const rows = await db
    .select({
      id: offers.id,
      broj: offers.broj,
      datum: offers.datum,
      doDatuma: offers.doDatuma,
      ponudaVrijedaDana: offers.ponudaVrijedaDana,
      predujam: offers.predujam,
      poslana: offers.poslana,
      rezervacijaBroj: reservations.redniBroj,
      guestSurname: reservations.guestSurname,
      guestName: reservations.guestName,
      partnerNaziv: partners.name,
      landlordSurname: landlords.surname,
      landlordName: landlords.name,
      accommodationName: accommodations.name,
      dateFrom: reservations.dateFrom,
      dateTo: reservations.dateTo,
    })
    .from(offers)
    .innerJoin(reservations, eq(offers.idRezervacija, reservations.id))
    .innerJoin(
      accommodations,
      eq(reservations.accommodationId, accommodations.id),
    )
    .innerJoin(landlords, eq(accommodations.landlordId, landlords.id))
    .leftJoin(partners, eq(reservations.partnerId, partners.id))
    .where(eq(offers.agencyId, agencyId))
    .orderBy(desc(offers.broj));

  // Dohvati cijene (zbroj bruto stavki) za svaku ponudu
  const offerIds = rows.map((r) => r.id);

  if (offerIds.length === 0) return [];

  const stavkeRows = await db
    .select({
      offerId: offersStavke.offerId,
      bruto: offersStavke.bruto,
    })
    .from(offersStavke)
    .where(inArray(offersStavke.offerId, offerIds));

  // Zbroji bruto po offerId
  const cijeneMap = new Map<string, number>();
  for (const s of stavkeRows) {
    const prev = cijeneMap.get(s.offerId) ?? 0;
    cijeneMap.set(s.offerId, prev + parseFloat(s.bruto ?? "0"));
  }

  return rows.map((r) => ({
    ...r,
    cijena: cijeneMap.get(r.id) ?? 0,
  }));
}

export type OfferStavkaPdf = {
  id: string;
  serviceText: string;
  dodatniOpis: string | null;
  jedMjere: string | null;
  kolicina: string;
  cijena: string;
  rabat: string;
  iznos: string;
  bruto: string;
};

export type OfferForPdf = {
  id: string;
  broj: number;
  datum: string;
  doDatuma: string | null;
  predujam: string | null;
  rezervacijaBroj: number;
  guestSurname: string;
  guestName: string;
  guestEmail: string | null;
  partnerNaziv: string | null;
  partnerAdresa: string | null;
  partnerGrad: string | null;
  partnerOib: string | null;
  partnerEmail: string | null;
  landlordSurname: string;
  landlordName: string;
  accommodationName: string;
  dateFrom: string;
  dateTo: string;
  tekstNaDnu: string | null;
  stavke: OfferStavkaPdf[];
};

export async function getOfferForPdf(
  offerId: string,
  agencyId: string,
): Promise<OfferForPdf | null> {
  const rows = await db
    .select({
      id: offers.id,
      broj: offers.broj,
      datum: offers.datum,
      doDatuma: offers.doDatuma,
      predujam: offers.predujam,
      tekstNaDnu: offers.tekstNaDnu,
      rezervacijaBroj: reservations.redniBroj,
      guestSurname: reservations.guestSurname,
      guestName: reservations.guestName,
      guestEmail: reservations.email,
      partnerNaziv: partners.name,
      partnerAdresa: partners.address,
      partnerGrad: cities.name,
      partnerOib: partners.oib,
      partnerEmail: partners.email,
      landlordSurname: landlords.surname,
      landlordName: landlords.name,
      accommodationName: accommodations.name,
      dateFrom: reservations.dateFrom,
      dateTo: reservations.dateTo,
    })
    .from(offers)
    .innerJoin(reservations, eq(offers.idRezervacija, reservations.id))
    .innerJoin(
      accommodations,
      eq(reservations.accommodationId, accommodations.id),
    )
    .innerJoin(landlords, eq(accommodations.landlordId, landlords.id))
    .leftJoin(partners, eq(reservations.partnerId, partners.id))
    .leftJoin(cities, eq(partners.cityId, cities.id))
    .where(and(eq(offers.id, offerId), eq(offers.agencyId, agencyId)))
    .limit(1);

  if (!rows[0]) return null;

  const stavkeRows = await db
    .select({
      id: offersStavke.id,
      serviceText: offersStavke.serviceText,
      dodatniOpis: offersStavke.dodatniOpis,
      jedMjere: services.jedMjere,
      kolicina: offersStavke.kolicina,
      cijena: offersStavke.cijena,
      rabat: offersStavke.rabat,
      iznos: offersStavke.iznos,
      bruto: offersStavke.bruto,
    })
    .from(offersStavke)
    .innerJoin(services, eq(offersStavke.serviceId, services.id))
    .where(eq(offersStavke.offerId, offerId));

  return {
    ...rows[0],
    stavke: stavkeRows,
  };
}
