// src/app/(dashboard)/kalendar/KalendarClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import KalendarFiltriForm from "@/components/kalendar/KalendarFiltriForm";
import KalendarGantt from "@/components/kalendar/KalendarGantt";
import { KalendarFiltri, KalendarIznajmljivac } from "@/types/kalendar.types";
import { actionFetchKalendarData } from "@/lib/actions/kalendar";
import { generateDates } from "@/lib/utils/dates";

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

  // Inicijalni load s defaultnim filterima
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
          />
        )}
      </div>
    </div>
  );
}
