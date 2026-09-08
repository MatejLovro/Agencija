import { XMLParser } from "fast-xml-parser";

// Normalized transaction extracted from a camt.053.001.08 statement,
// ready to be inserted into izvod_tmp (agencyId added by the caller).
export type ParsedIzvodEntry = {
  year: string;
  brojIzvoda: number;
  bankRef: string;
  datum: string; // ISO date (yyyy-mm-dd)
  platitelj: string;
  pozivNaBroj: string | null;
  opisPlacanja: string | null;
  uplaceno: number; // signed: CRDT positive, DBIT negative
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true, // treats <ns:Tag> the same as <Tag>
});

// Ensures a possibly-single-object field is always treated as an array
function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// Loosely-typed shape of the parsed camt.053 XML — fast-xml-parser has no
// schema-aware output, so we only describe the fields we actually read.
type XmlParty = { Pty?: { Nm?: string }; Nm?: string };
type XmlRelatedParties = { Dbtr?: XmlParty; Cdtr?: XmlParty };
type XmlTxDtls = {
  RltdPties?: XmlRelatedParties;
  RmtInf?: { Strd?: { CdtrRefInf?: { Ref?: string }; AddtlRmtInf?: string } };
};
type XmlEntry = {
  CdtDbtInd: "CRDT" | "DBIT";
  Amt?: { "#text"?: string } | string;
  AcctSvcrRef?: string;
  ValDt?: { Dt?: string };
  BookgDt?: { DtTm?: string };
  NtryDtls?: { TxDtls?: XmlTxDtls | XmlTxDtls[] };
};

function extractPartyName(
  rltdPties: XmlRelatedParties | undefined,
  cdtDbtInd: "CRDT" | "DBIT",
): string {
  const partyNode = cdtDbtInd === "CRDT" ? rltdPties?.Dbtr : rltdPties?.Cdtr;
  const name = partyNode?.Pty?.Nm ?? partyNode?.Nm;
  return typeof name === "string" ? name.trim() : "NEPOZNAT";
}

export function parseCamt053(xml: string): ParsedIzvodEntry[] {
  const parsed = parser.parse(xml);
  const stmt = parsed?.Document?.BkToCstmrStmt?.Stmt;

  if (!stmt) {
    throw new Error(
      "Neispravan format izvoda: nedostaje Document/BkToCstmrStmt/Stmt",
    );
  }

  const brojIzvoda = Number(stmt.LglSeqNb);
  if (!brojIzvoda) {
    throw new Error(
      "Neispravan format izvoda: nedostaje LglSeqNb (broj izvoda)",
    );
  }

  const entries = asArray(stmt.Ntry);

  return entries.map((ntry: XmlEntry) => {
    const cdtDbtInd = ntry.CdtDbtInd as "CRDT" | "DBIT";
    const amountRaw =
      typeof ntry.Amt === "string" ? ntry.Amt : ntry.Amt?.["#text"];
    const amount = Number(amountRaw);
    const bankRef = ntry.AcctSvcrRef;

    if (!bankRef) {
      throw new Error(
        "Stavka izvoda nema AcctSvcrRef (bank_ref) — ne mogu je jedinstveno identificirati",
      );
    }

    const valDt = ntry.ValDt?.Dt ?? ntry.BookgDt?.DtTm?.slice(0, 10);
    if (!valDt) {
      throw new Error(
        "Stavka izvoda nema datum valute (ValDt/BookgDt) — ne mogu je obraditi",
      );
    }
    const year = valDt.slice(0, 4);

    // A single Ntry can in theory contain multiple TxDtls (batched entries);
    // we take the first, since our statements are one entry per transaction.
    const txDtls = asArray(ntry.NtryDtls?.TxDtls)[0] ?? {};

    const platitelj = extractPartyName(txDtls.RltdPties, cdtDbtInd);
    const strd = txDtls.RmtInf?.Strd;
    const pozivNaBroj: string | null = strd?.CdtrRefInf?.Ref ?? null;
    const opisPlacanja: string | null = strd?.AddtlRmtInf ?? null;

    return {
      year,
      brojIzvoda,
      bankRef: String(bankRef).trim(),
      datum: valDt,
      platitelj,
      pozivNaBroj,
      opisPlacanja,
      uplaceno: cdtDbtInd === "CRDT" ? amount : -amount,
    };
  });
}
