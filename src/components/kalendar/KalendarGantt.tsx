// src/components/kalendar/KalendarGantt.tsx
"use client";

import { KalendarIznajmljivac, KalendarDan } from "@/types/kalendar";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDatumHeader(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

function getDayOfWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return ["ned", "pon", "uto", "sri", "čet", "pet", "sub"][d.getDay()];
}

function isWeekend(iso: string): boolean {
  const d = new Date(iso + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

// ─── boje ćelija ────────────────────────────────────────────────────────────

type CellStyle = {
  bg: string;
  text: string;
  border: string;
};

function getCellStyle(dan: KalendarDan, isToday: boolean, isWeekendDay: boolean): CellStyle {
  if (!dan.tip) {
    if (isToday) return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" };
    if (isWeekendDay) return { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-200" };
    return { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-100" };
  }
  switch (dan.tip) {
    case "prijava":
      return { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600" };
    case "rezervacija_potvrdjena":
      return { bg: "bg-amber-300", text: "text-amber-900", border: "border-amber-400" };
    case "rezervacija_nepotvrdjena":
      return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" };
    case "preklapanje":
      return { bg: "bg-orange-400", text: "text-white", border: "border-orange-500" };
    default:
      return { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-100" };
  }
}

// ─── Ćelija s danom ─────────────────────────────────────────────────────────

function DanCelija({
  dan,
  isWeekendDay,
  isToday,
}: {
  dan: KalendarDan;
  isWeekendDay: boolean;
  isToday: boolean;
}) {
  const style = getCellStyle(dan, isToday, isWeekendDay);

  return (
    <td
      className={[
        "relative border-r border-b h-8 min-w-[38px] max-w-[38px] w-[38px] text-center align-middle select-none cursor-default",
        style.bg,
        style.border,
      ].join(" ")}
    >
      {dan.tip && (
        <span className={`text-[10px] font-semibold leading-none ${style.text}`}>
          {dan.tip === "prijava" && dan.redniBroj
            ? `P${dan.redniBroj}`
            : dan.redniBroj
            ? String(dan.redniBroj)
            : ""}
        </span>
      )}
      {/* Oznaka odjave — tanka vertikalna crta na desnom rubu */}
      {dan.jeOdjava && (
        <span className="absolute right-0 top-0 bottom-0 w-0.5 bg-slate-500 pointer-events-none" />
      )}
    </td>
  );
}

// ─── Legenda ────────────────────────────────────────────────────────────────

function Legenda() {
  const items = [
    { label: "Rezervacija (potvrđena)", bg: "bg-amber-300" },
    { label: "Rezervacija (nepotvrđena)", bg: "bg-yellow-100 border border-yellow-300" },
    { label: "Prijava", bg: "bg-emerald-500" },
    { label: "Dan preklapanja", bg: "bg-orange-400" },
    { label: "Danas", bg: "bg-emerald-50 border border-emerald-200" },
  ];
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-200 bg-white text-xs text-slate-600">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`inline-block w-4 h-4 rounded-sm ${item.bg}`} />
          <span>{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-4 h-4 rounded-sm bg-sky-100 border border-sky-200" />
        <span>Slobodan (vikend)</span>
      </div>
    </div>
  );
}

// ─── Glavna komponenta ───────────────────────────────────────────────────────

interface KalendarGanttProps {
  iznajmljivaci: KalendarIznajmljivac[];
  datumi: string[]; // niz ISO datuma u rasponu
  today: string;    // ISO datum današnjeg dana, npr. "2026-06-15"
}

export default function KalendarGantt({ iznajmljivaci, datumi, today }: KalendarGanttProps) {
  if (iznajmljivaci.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Nema rezultata za odabrane filtere.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Legenda />

      {/* Scrollable wrapper */}
      <div className="overflow-auto flex-1">
        <table className="border-collapse text-xs" style={{ tableLayout: "fixed" }}>
          {/* Header */}
          <thead>
            <tr>
              <th
                className="sticky left-0 z-30 bg-slate-700 border-r border-b border-slate-600 text-slate-300 font-medium text-left px-2 py-1 min-w-[160px] max-w-[160px] w-[160px]"
              >
                IZNAJMLJIVAČ
              </th>
              <th
                className="sticky left-[160px] z-30 bg-slate-700 border-r border-b border-slate-600 text-slate-300 font-medium text-center py-1 min-w-[80px] max-w-[80px] w-[80px]"
              >
                KAPACITET
              </th>
              {datumi.map((datum) => {
                const isToday = datum === today;
                const isWeekendDay = isWeekend(datum);
                return (
                  <th
                    key={datum}
                    className={[
                      "border-r border-b min-w-[38px] max-w-[38px] w-[38px] text-center font-normal py-0.5",
                      isToday
                        ? "bg-emerald-600 text-white"
                        : isWeekendDay
                        ? "bg-slate-600 text-slate-200"
                        : "bg-slate-700 text-slate-300",
                    ].join(" ")}
                  >
                    <div className={`text-[9px] leading-tight ${isToday ? "text-emerald-100" : "text-slate-400"}`}>
                      {getDayOfWeek(datum)}
                    </div>
                    <div className="text-[10px] leading-tight font-semibold">
                      {formatDatumHeader(datum)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {iznajmljivaci.map((iznajmljivac) => (
              <>
                {/* Red iznajmljivača */}
                <tr key={`iznajmljivac-${iznajmljivac.landlordId}`} className="bg-slate-100">
                  <td
                    className="sticky left-0 z-20 bg-slate-100 border-r border-b border-slate-300 font-semibold text-slate-700 px-2 py-1 min-w-[160px] max-w-[160px] w-[160px] uppercase tracking-wide text-[11px]"
                  >
                    {iznajmljivac.ime}
                  </td>
                  <td
                    className="sticky left-[160px] z-20 bg-slate-100 border-r border-b border-slate-300 min-w-[80px] max-w-[80px] w-[80px]"
                  />
                  {datumi.map((datum) => {
                    const isToday = datum === today;
                    return (
                      <td
                        key={datum}
                        className={[
                          "border-r border-b h-7 min-w-[38px] max-w-[38px] w-[38px]",
                          isToday ? "bg-emerald-100" : isWeekend(datum) ? "bg-slate-200" : "bg-slate-100",
                        ].join(" ")}
                      />
                    );
                  })}
                </tr>

                {/* Redovi apartmana */}
                {iznajmljivac.apartmani.map((apartman) => (
                  <tr key={apartman.accommodationId}>
                    {/* Prazna ćelija ispod iznajmljivača */}
                    <td className="sticky left-0 z-20 bg-white border-r border-b border-slate-200 min-w-[160px] max-w-[160px] w-[160px]" />

                    {/* Naziv apartmana */}
                    <td className="sticky left-[160px] z-20 bg-white border-r border-b border-slate-200 text-slate-600 font-medium text-right pr-2 min-w-[80px] max-w-[80px] w-[80px]">
                      {apartman.naziv}
                    </td>

                    {/* Dani */}
                    {datumi.map((datum) => {
                      const isToday = datum === today;
                      const isWeekendDay = isWeekend(datum);
                      const dan = apartman.dani.find((d) => d.datum === datum);
                      if (!dan) {
                        return (
                          <td
                            key={datum}
                            className={[
                              "border-r border-b h-8 min-w-[38px] max-w-[38px] w-[38px]",
                              isToday ? "bg-emerald-50 border-emerald-200" : isWeekendDay ? "bg-sky-100" : "bg-sky-50",
                            ].join(" ")}
                          />
                        );
                      }
                      return (
                        <DanCelija
                          key={datum}
                          dan={dan}
                          isWeekendDay={isWeekendDay}
                          isToday={isToday}
                        />
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
