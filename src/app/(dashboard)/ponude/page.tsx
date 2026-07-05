import { actionGetOffers } from "@/lib/actions/offers";
import PonudeClient from "./PonudeClient";

export default async function PonudePage() {
  const ponude = await actionGetOffers();
  return <PonudeClient ponude={ponude} />;
}
