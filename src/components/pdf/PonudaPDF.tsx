import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { OfferForPdf } from "@/lib/db/queries/offers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoToHr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

function fmtBroj(broj: number, datum: string): string {
  const godina = datum.split("-")[0];
  return `${broj}-${godina}`;
}

function fmtNum(val: string | number | null): string {
  if (val === null || val === undefined) return "0,00";
  return parseFloat(String(val))
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ─── Podaci agencije ──────────────────────────────────────────────────────────

const AGENCIJA = {
  naziv: "MICRO WORLD d.o.o.",
  adresa: "Vrbje 5, 10000 Zagreb",
  tel: "Tel.: 01.3888.660, 095.222.6666",
  email: "E-mail: predrag@microworld.hr; Web: www.microworld.hr",
  oib: "OIB: 53630235418; PDV broj: HR53630235418; IBAN: HR1232600001101521369",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Stilovi ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 35,
    color: "#1a1a1a",
  },

  // Header agencije
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  agencijaBlok: {
    flexDirection: "column",
    gap: 2,
  },
  agencijaNaziv: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  agencijaRed: {
    fontSize: 8,
    color: "#333",
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  headerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    marginBottom: 14,
  },

  // Kupac + ponuda info
  kupacPonudaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  kupacBlok: {
    flexDirection: "column",
    gap: 3,
    width: "45%",
  },
  kupacNaziv: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  kupacRed: {
    fontSize: 9,
  },
  ponudaInfoBlok: {
    flexDirection: "column",
    gap: 3,
    width: "48%",
  },
  ponudaBroj: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  ponudaInfoRed: {
    flexDirection: "row",
    gap: 4,
  },
  ponudaInfoLabel: {
    fontSize: 9,
    width: 100,
    color: "#444",
  },
  ponudaInfoValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  rezervacijaBroj: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
  },

  // Tablica stavki
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2d6a8f",
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginTop: 10,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: "#f5f5f5",
  },

  // Širine kolona
  colRbr: { width: "5%" },
  colOpis: { width: "35%" },
  colKolicina: { width: "9%", textAlign: "right" },
  colJm: { width: "7%", textAlign: "center" },
  colRabat: { width: "8%", textAlign: "right" },
  colCijena: { width: "13%", textAlign: "right" },
  colPdv: { width: "8%", textAlign: "right" },
  colIznos: { width: "15%", textAlign: "right" },

  opisGlavni: {
    fontSize: 9,
  },
  opisDodatni: {
    fontSize: 8,
    color: "#555",
    marginTop: 2,
  },

  // Suma
  sumaBlok: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  sumaTable: {
    width: "40%",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    paddingTop: 4,
  },
  sumaRed: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  sumaLabel: {
    fontSize: 9,
    color: "#333",
  },
  sumaValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  sveukupnoLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  sveukupnoValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },

  // Tekst na dnu
  tekstNaDnu: {
    marginTop: 20,
    fontSize: 8,
    color: "#444",
    lineHeight: 1.4,
  },
});

// ─── PDF komponenta ───────────────────────────────────────────────────────────

export function PonudaPdf({ offer }: { offer: OfferForPdf }) {
  const brojPonude = fmtBroj(offer.broj, offer.datum);
  const sveukupno = offer.stavke.reduce(
    (sum, s) => sum + parseFloat(s.bruto),
    0,
  );

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* HEADER — agencija + logotip */}
        <View style={s.headerRow}>
          <View style={s.agencijaBlok}>
            <Text style={s.agencijaNaziv}>{AGENCIJA.naziv}</Text>
            <Text style={s.agencijaRed}>{AGENCIJA.adresa}</Text>
            <Text style={s.agencijaRed}>{AGENCIJA.tel}</Text>
            <Text style={s.agencijaRed}>{AGENCIJA.email}</Text>
            <Text style={s.agencijaRed}>{AGENCIJA.oib}</Text>
          </View>
          <Image style={s.logo} src={`${APP_URL}/logo.png`} />
        </View>
        <View style={s.headerLine} />

        {/* KUPAC + INFO O PONUDI */}
        <View style={s.kupacPonudaRow}>
          {/* Lijevo — kupac */}
          <View style={s.kupacBlok}>
            {offer.partnerNaziv ? (
              <>
                <Text style={s.kupacNaziv}>{offer.partnerNaziv}</Text>
                {offer.partnerAdresa && offer.partnerGrad && (
                  <Text style={s.kupacRed}>
                    {offer.partnerAdresa}, {offer.partnerGrad}
                  </Text>
                )}
                {offer.partnerOib && (
                  <Text style={s.kupacRed}>OIB {offer.partnerOib}</Text>
                )}
                {offer.partnerEmail && (
                  <Text style={s.kupacRed}>e-mail: {offer.partnerEmail}</Text>
                )}
              </>
            ) : (
              <>
                <Text style={s.kupacNaziv}>
                  {offer.guestSurname} {offer.guestName}
                </Text>
                {offer.guestEmail && (
                  <Text style={s.kupacRed}>e-mail: {offer.guestEmail}</Text>
                )}
              </>
            )}
          </View>

          {/* Desno — info o ponudi */}
          <View style={s.ponudaInfoBlok}>
            <Text style={s.ponudaBroj}>Ponuda {brojPonude}</Text>
            <View style={s.ponudaInfoRed}>
              <Text style={s.ponudaInfoLabel}>Datum ponude:</Text>
              <Text style={s.ponudaInfoValue}>{isoToHr(offer.datum)}</Text>
            </View>
            {offer.doDatuma && (
              <View style={s.ponudaInfoRed}>
                <Text style={s.ponudaInfoLabel}>Datum dospijeća:</Text>
                <Text style={s.ponudaInfoValue}>{isoToHr(offer.doDatuma)}</Text>
              </View>
            )}
            <View style={s.ponudaInfoRed}>
              <Text style={s.ponudaInfoLabel}>Model plaćanja:</Text>
              <Text style={s.ponudaInfoValue}>HR00 {brojPonude}</Text>
            </View>
            <View style={s.ponudaInfoRed}>
              <Text style={s.ponudaInfoLabel}>Način plaćanja:</Text>
              <Text style={s.ponudaInfoValue}>Transakcijski račun</Text>
            </View>
            <Text style={s.rezervacijaBroj}>
              BROJ REZERVACIJE: {offer.rezervacijaBroj}
            </Text>
          </View>
        </View>

        {/* TABLICA STAVKI — header */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, s.colRbr]}>Rbr.</Text>
          <Text style={[s.tableHeaderCell, s.colOpis]}>
            Opis artikla/usluge
          </Text>
          <Text style={[s.tableHeaderCell, s.colKolicina]}>Količina</Text>
          <Text style={[s.tableHeaderCell, s.colJm]}>Jm</Text>
          <Text style={[s.tableHeaderCell, s.colRabat]}>% rab.</Text>
          <Text style={[s.tableHeaderCell, s.colCijena]}>Cijena s rab.</Text>
          <Text style={[s.tableHeaderCell, s.colPdv]}>PDV</Text>
          <Text style={[s.tableHeaderCell, s.colIznos]}>Iznos stavke</Text>
        </View>

        {/* TABLICA STAVKI — redovi */}
        {offer.stavke.map((stavka, index) => {
          const cijenaARabatom =
            parseFloat(stavka.cijena) * (1 - parseFloat(stavka.rabat) / 100);
          const iznosStavke = parseFloat(stavka.kolicina) * cijenaARabatom;

          return (
            <View
              key={stavka.id}
              style={[s.tableRow, index % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <Text
                style={[
                  s.tableHeaderCell,
                  s.colRbr,
                  { color: "#1a1a1a", fontFamily: "Helvetica" },
                ]}
              >
                {index + 1}.
              </Text>
              <View style={s.colOpis}>
                <Text style={s.opisGlavni}>{stavka.serviceText}</Text>
                {stavka.dodatniOpis && (
                  <Text style={s.opisDodatni}>{stavka.dodatniOpis}</Text>
                )}
              </View>
              <Text style={[s.colKolicina, { fontSize: 9 }]}>
                {fmtNum(stavka.kolicina)}
              </Text>
              <Text style={[s.colJm, { fontSize: 9 }]}>
                {stavka.jedMjere ?? ""}
              </Text>
              <Text style={[s.colRabat, { fontSize: 9 }]}>
                {fmtNum(stavka.rabat)}
              </Text>
              <Text style={[s.colCijena, { fontSize: 9 }]}>
                {fmtNum(cijenaARabatom)}
              </Text>
              <Text style={[s.colPdv, { fontSize: 9 }]}></Text>
              <Text style={[s.colIznos, { fontSize: 9 }]}>
                {fmtNum(iznosStavke)}
              </Text>
            </View>
          );
        })}

        {/* SUMA */}
        <View style={s.sumaBlok}>
          <View style={s.sumaTable}>
            <View style={s.sumaRed}>
              <Text style={s.sveukupnoLabel}>Sveukupni iznos:</Text>
              <Text style={s.sveukupnoValue}>{fmtNum(sveukupno)} €</Text>
            </View>
            {offer.predujam && parseFloat(offer.predujam) > 0 && (
              <View style={s.sumaRed}>
                <Text style={s.sumaLabel}>Predujam:</Text>
                <Text style={s.sumaValue}>{fmtNum(offer.predujam)} €</Text>
              </View>
            )}
          </View>
        </View>

        {/* TEKST NA DNU */}
        {offer.tekstNaDnu && (
          <Text style={s.tekstNaDnu}>{offer.tekstNaDnu}</Text>
        )}
      </Page>
    </Document>
  );
}
