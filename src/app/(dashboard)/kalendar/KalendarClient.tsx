// src/app/(dashboard)/kalendar/KalendarClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import KalendarFiltriForm from "@/components/kalendar/KalendarFiltriForm";
import KalendarGantt from "@/components/kalendar/KalendarGantt";
import RezervacijaModal from "@/components/kalendar/RezervacijaModal";
import { KalendarFiltri, KalendarIznajmljivac } from "@/types/kalendar";
import {
  actionFetchKalendarData,
  actionProvjeriMoguceRezerviranje,
} from "@/lib/actions/kalendar";
import { generateDates } from "@/lib/mock/kalendarMock";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeDefaultRange(): { od: string; do: string } {
  const daysBefore = parseInt(
    process.env.NEXT_PUBLIC_CALENDAR_DAYS_BEFORE ?? "6",
    10,
  );
  const daysAfter = parseInt(
    process.env.NEXT_PUBLIC_CALENDAR_DAYS_AFTER ?? "45",
    10,
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const od = new Date(today);
  od.setDate(today.getDate() - daysBefore);
  const do_ = new Date(today);
  do_.setDate(today.getDate() + daysAfter);
  return {
    od: od.toISOString().slice(0, 10),
    do: do_.toISOString().slice(0, 10),
  };
}

function getTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// ─── Tip za otvoreni modal rezervacije ──────────────────────────────────────

type RezervacijaModalState = {
  accommodationId: string;
  dateFromIso: string;
  dateToIso: string;
} | null;

// ─── Komponenta ──────────────────────────────────────────────────────────────

export default function KalendarClient() {
  const defaultRange = useMemo(() => computeDefaultRange(), []);
  const today = useMemo(() => getTodayIso(), []);

  const [datumOd, setDatumOd] = useState(defaultRange.od);
  const [datumDo, setDatumDo] = useState(defaultRange.do);
  const [iznajmljivaci, setIznajmljivaci] = useState<KalendarIznajmljivac[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modalna poruka za blokade (provjera prije otvaranja forme)
  const [blokiranoPorukom, setBlokiranoPorukom] = useState<string | null>(null);

  // Modal za upis rezervacije
  const [rezervacijaModal, setRezervacijaModal] =
    useState<RezervacijaModalState>(null);

  const datumi = useMemo(
    () => generateDates(datumOd, datumDo),
    [datumOd, datumDo],
  );

  async function handleSearch(filtri: KalendarFiltri) {
    setIsLoading(true);
    setError(null);
    setDatumOd(filtri.datumOd);
    setDatumDo(filtri.datumDo);
    try {
      const data = await actionFetchKalendarData(filtri);
      setIznajmljivaci(data);
    } catch (e) {
      setError("Greška pri učitavanju podataka.");
    } finally {
      setIsLoading(false);
    }
  }

  // Ponovno dohvaća trenutno prikazani raspon (koristi se nakon spremanja rezervacije)
  function refreshKalendar() {
    handleSearch({
      gradId: null,
      landlordId: null,
      datumOd,
      datumDo,
      brojSoba: null,
      brojKreveta: null,
      brojPomocnihLezajeva: null,
      samoPotvrdjene: false,
      samoNepotvrdjene: false,
      imaKlima: false,
      imaParking: false,
      imaWifi: false,
      kucniLjubimac: false,
      pogledNaMore: false,
      samoPrioritetan: false,
    });
  }

  async function handleIzradaRezervacije(
    accommodationId: string,
    od: string,
    do_: string,
  ) {
    const provjera = await actionProvjeriMoguceRezerviranje(
      accommodationId,
      od,
      do_,
    );

    if (!provjera.dozvoljeno) {
      setBlokiranoPorukom(provjera.poruka);
      return;
    }

    setRezervacijaModal({
      accommodationId,
      dateFromIso: od,
      dateToIso: do_,
    });
  }

  async function handleIzradaPrijave(
    accommodationId: string,
    od: string,
    do_: string,
  ) {
    // TODO: implementirati provjere i modalnu formu za prijavu
    console.log("Otvaranje forme za prijavu", { accommodationId, od, do_ });
  }

  useEffect(() => {
    handleSearch({
      gradId: null,
      landlordId: null,
      datumOd: defaultRange.od,
      datumDo: defaultRange.do,
      brojSoba: null,
      brojKreveta: null,
      brojPomocnihLezajeva: null,
      samoPotvrdjene: false,
      samoNepotvrdjene: false,
      imaKlima: false,
      imaParking: false,
      imaWifi: false,
      kucniLjubimac: false,
      pogledNaMore: false,
      samoPrioritetan: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Naslov stranice */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-base font-semibold text-slate-800 tracking-wide">
          Kalendar rezervacija
        </h1>
        <span className="text-xs text-slate-400">
          {datumi.length} {datumi.length === 1 ? "dan" : "dana"}
        </span>
      </div>

      {/* Forma filtera */}
      <KalendarFiltriForm
        onSearch={handleSearch}
        isLoading={isLoading}
        defaultDatumOd={datumOd}
        defaultDatumDo={datumDo}
      />

      {/* Gantt tablica */}
      <div className="flex-1 overflow-hidden bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <div className="text-sm text-slate-500">Učitavanje...</div>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-32 text-sm text-red-500">
            {error}
          </div>
        )}
        {!error && (
          <KalendarGantt
            iznajmljivaci={iznajmljivaci}
            datumi={datumi}
            today={today}
            onIzradaRezervacije={handleIzradaRezervacije}
            onIzradaPrijave={handleIzradaPrijave}
          />
        )}
      </div>

      {/* Modalna poruka za blokade */}
      <AlertDialog
        open={blokiranoPorukom !== null}
        onOpenChange={(open) => {
          if (!open) setBlokiranoPorukom(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rezervacija nije moguća</AlertDialogTitle>
            <AlertDialogDescription>{blokiranoPorukom}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setBlokiranoPorukom(null)}>
              U redu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal za upis nove rezervacije */}
      {rezervacijaModal && (
        <RezervacijaModal
          open={rezervacijaModal !== null}
          onOpenChange={(open) => {
            if (!open) setRezervacijaModal(null);
          }}
          accommodationId={rezervacijaModal.accommodationId}
          dateFromIso={rezervacijaModal.dateFromIso}
          dateToIso={rezervacijaModal.dateToIso}
          onSaved={() => {
            setRezervacijaModal(null);
            refreshKalendar();
          }}
        />
      )}
    </div>
  );
}
