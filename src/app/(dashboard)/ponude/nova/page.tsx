import { notFound, redirect } from "next/navigation";
import {
  actionGetReservationForOffer,
  actionGetServicesForOffer,
} from "@/lib/actions/offers";
import NovaPonudaClient from "./NovaPonudaClient";

interface Props {
  searchParams: Promise<{ rezervacijaId?: string }>;
}

export default async function NovaPonudaPage({ searchParams }: Props) {
  const { rezervacijaId } = await searchParams;

  if (!rezervacijaId) notFound();

  const [rezervacija, services] = await Promise.all([
    actionGetReservationForOffer(rezervacijaId),
    actionGetServicesForOffer(),
  ]);

  if (!rezervacija) notFound();

  if (rezervacija.status === "potvrdjena") {
    redirect(`/rezervacije?greska=vec-potvrdjena`);
  }

  return (
    <NovaPonudaClient
      rezervacija={rezervacija}
      services={services}
      defaultTekstNaDnu={process.env.OFFER_FOOTER_TEXT ?? ""}
    />
  );
}
