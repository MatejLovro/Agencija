// src/app/(dashboard)/kalendar/KalendarClient.tsx
"use client";

import { useState, useMemo } from "react";
import KalendarFiltriForm from "@/components/kalendar/KalendarFiltriForm";
import KalendarGantt from "@/components/kalendar/KalendarGantt";
import { KalendarFiltri, KalendarIznajmljivac } from "@/types/kalendar";
import { MOCK_IZNAJMLJIVACI, generateDates } from "@/lib/mock/kalendarMock";

// Početni raspon: tekući mjesec
const today = new Date();
const DEFAULT_OD = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .slice(0, 10);
const DEFAULT_DO = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  .toISOString()
  .slice(0, 10);

export default function KalendarClient() {
  const [datumOd, setDatumOd] = useState(DEFAULT_OD);
  const [datumDo, setDatumDo] = useState(DEFAULT_DO);
  const [iznajmljivaci, setIznajmljivaci] = useState<KalendarIznajmljivac[]>(
    MOCK_IZNAJMLJIVACI
  );
  const [isLoading, setIsLoading] = useState(false);

  const datumi = useMemo(() => generateDates(datumOd, datumDo), [datumOd, datumDo]);

  function handleSearch(filtri: KalendarFiltri) {
    setIsLoading(true);
    setDatumOd(filtri.datumOd);
    setDatumDo(filtri.datumDo);

    // Za sada koristimo mock podatke — ovdje će ići Server Action
    setTimeout(() => {
      setIznajmljivaci(MOCK_IZNAJMLJIVACI);
      setIsLoading(false);
    }, 300);
  }

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
      <KalendarFiltriForm onSearch={handleSearch} isLoading={isLoading} />

      {/* Gantt tablica */}
      <div className="flex-1 overflow-hidden bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <div className="text-sm text-slate-500">Učitavanje...</div>
          </div>
        )}
        <KalendarGantt iznajmljivaci={iznajmljivaci} datumi={datumi} />
      </div>
    </div>
  );
}
