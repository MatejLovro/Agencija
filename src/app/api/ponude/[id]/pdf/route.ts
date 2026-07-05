import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getOfferForPdf } from "@/lib/db/queries/offers";
import { PonudaPdf } from "@/components/pdf/PonudaPDF";

const AGENCY_ID = process.env.AGENCY_ID!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const offer = await getOfferForPdf(id, AGENCY_ID);
  if (!offer) {
    return new NextResponse("Ponuda nije pronađena", { status: 404 });
  }

  const buffer = await renderToBuffer(PonudaPdf({ offer }));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ponuda-${offer.broj}.pdf"`,
    },
  });
}
