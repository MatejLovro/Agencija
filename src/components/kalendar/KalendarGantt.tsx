// src/components/kalendar/KalendarGantt.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

function getCellStyle(
  dan: KalendarDan,
  isToday: boolean,
  isWeekendDay: boolean,
): CellStyle {
  if (!dan.tip) {
    if (isToday)
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
      };
    if (isWeekendDay)
      return {
        bg: "bg-sky-100",
        text: "text-sky-800",
        border: "border-sky-200",
      };
    return { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-100" };
  }
  switch (dan.tip) {
    case "prijava":
      return {
        bg: "bg-emerald-500",
        text: "text-white",
        border: "border-emerald-600",
      };
    case "rezervacija_potvrdjena":
      return {
        bg: "bg-amber-300",
        text: "text-amber-900",
        border: "border-amber-400",
      };
    case "rezervacija_nepotvrdjena":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
      };
    case "preklapanje":
      return {
        bg: "bg-orange-400",
        text: "text-white",
        border: "border-orange-500",
      };
    default:
      return {
        bg: "bg-sky-50",
        text: "text-sky-800",
        border: "border-sky-100",
      };
  }
}

// ─── Selekcija ──────────────────────────────────────────────────────────────

type Selekcija = {
  accommodationId: string;
  startDate: string;
  endDate: string;
} | null;

function isDatumUSelekciji(
  datum: string,
  sel: Selekcija,
  accommodationId: string,
): boolean {
  if (!sel || sel.accommodationId !== accommodationId) return false;
  const [od, do_] =
    sel.startDate <= sel.endDate
      ? [sel.startDate, sel.endDate]
      : [sel.endDate, sel.startDate];
  return datum >= od && datum <= do_;
}

// ─── Context menu ───────────────────────────────────────────────────────────

type ContextMenuState = {
  x: number;
  y: number;
  accommodationId: string;
  accommodationNaziv: string;
  startDate: string;
  endDate: string;
} | null;

function KalendarContextMenu({
  state,
  onClose,
  onIzradaRezervacije,
  onIzradaPrijave,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onIzradaRezervacije: (
    accommodationId: string,
    od: string,
    do_: string,
  ) => void;
  onIzradaPrijave: (accommodationId: string, od: string, do_: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [state, onClose]);

  if (!state) return null;

  const [od, do_] =
    state.startDate <= state.endDate
      ? [state.startDate, state.endDate]
      : [state.endDate, state.startDate];

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[200px] text-sm"
      style={{ left: state.x, top: state.y }}
    >
      <div className="px-3 py-1.5 text-xs text-slate-400 border-b border-slate-100 mb-1">
        {state.accommodationNaziv} &middot; {formatDatumHeader(od)}–
        {formatDatumHeader(do_)}
      </div>
      <button
        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
        onClick={() => {
          onIzradaRezervacije(state.accommodationId, od, do_);
          onClose();
        }}
      >
        Izrada rezervacije
      </button>
      <button
        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
        onClick={() => {
          onIzradaPrijave(state.accommodationId, od, do_);
          onClose();
        }}
      >
        Izrada prijave
      </button>
    </div>
  );
}

// ─── Ćelija s danom ─────────────────────────────────────────────────────────

function DanCelija({
  dan,
  isWeekendDay,
  isToday,
  isSelected,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
}: {
  dan: KalendarDan;
  isWeekendDay: boolean;
  isToday: boolean;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const style = getCellStyle(dan, isToday, isWeekendDay);

  return (
    <td
      className={[
        "relative border-r border-b h-8 min-w-[38px] max-w-[38px] w-[38px] text-center align-middle select-none cursor-pointer",
        style.bg,
        style.border,
      ].join(" ")}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onContextMenu={onContextMenu}
    >
      {dan.tip && (
        <span
          className={`text-[10px] font-semibold leading-none ${style.text}`}
        >
          {dan.tip === "prijava" && dan.redniBroj
            ? `P${dan.redniBroj}`
            : dan.redniBroj
              ? String(dan.redniBroj)
              : ""}
        </span>
      )}
      {dan.jeOdjava && (
        <span className="absolute right-0 top-0 bottom-0 w-0.5 bg-slate-500 pointer-events-none" />
      )}
      {isSelected && (
        <span className="absolute inset-0 bg-blue-500/30 border-2 border-blue-500 pointer-events-none" />
      )}
    </td>
  );
}

// ─── Legenda ────────────────────────────────────────────────────────────────

function Legenda() {
  const items = [
    { label: "Rezervacija (potvrđena)", bg: "bg-amber-300" },
    {
      label: "Rezervacija (nepotvrđena)",
      bg: "bg-yellow-100 border border-yellow-300",
    },
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
  datumi: string[];
  today: string;
  onIzradaRezervacije?: (
    accommodationId: string,
    od: string,
    do_: string,
  ) => void;
  onIzradaPrijave?: (accommodationId: string, od: string, do_: string) => void;
}

export default function KalendarGantt({
  iznajmljivaci,
  datumi,
  today,
  onIzradaRezervacije,
  onIzradaPrijave,
}: KalendarGanttProps) {
  const [selekcija, setSelekcija] = useState<Selekcija>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  // Globalni mouseup — zaustavlja drag selekciju bilo gdje na stranici
  useEffect(() => {
    function handleMouseUp() {
      setIsDragging(false);
    }
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleCellMouseDown = useCallback(
    (e: React.MouseEvent, accommodationId: string, datum: string) => {
      if (e.button !== 0) return; // ignoriraj desni i srednji klik
      setIsDragging(true);
      setSelekcija({ accommodationId, startDate: datum, endDate: datum });
    },
    [],
  );

  const handleCellMouseEnter = useCallback(
    (accommodationId: string, datum: string) => {
      if (!isDragging) return;
      setSelekcija((prev) => {
        // Selekcija ostaje ograničena na isti apartman u kojem je počela
        if (!prev || prev.accommodationId !== accommodationId) return prev;
        return { ...prev, endDate: datum };
      });
    },
    [isDragging],
  );

  const handleCellContextMenu = useCallback(
    (
      e: React.MouseEvent,
      accommodationId: string,
      accommodationNaziv: string,
      datum: string,
    ) => {
      e.preventDefault();
      setIsDragging(false);

      // Ako postoji aktivna selekcija u ovom apartmanu, koristi je.
      // Inače tretiraj klik kao selekciju jednog dana.
      setSelekcija((prev) => {
        const aktivna =
          prev && prev.accommodationId === accommodationId
            ? prev
            : { accommodationId, startDate: datum, endDate: datum };

        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          accommodationId,
          accommodationNaziv,
          startDate: aktivna.startDate,
          endDate: aktivna.endDate,
        });

        return aktivna;
      });
    },
    [],
  );

  function closeContextMenu() {
    setContextMenu(null);
    setSelekcija(null);
  }

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

      <div className="overflow-auto flex-1">
        <table
          className="border-collapse text-xs"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              <th className="sticky left-0 z-30 bg-slate-700 border-r border-b border-slate-600 text-slate-300 font-medium text-left px-2 py-1 min-w-[160px] max-w-[160px] w-[160px]">
                IZNAJMLJIVAČ
              </th>
              <th className="sticky left-[160px] z-30 bg-slate-700 border-r border-b border-slate-600 text-slate-300 font-medium text-center py-1 min-w-[80px] max-w-[80px] w-[80px]">
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
                    <div
                      className={`text-[9px] leading-tight ${isToday ? "text-emerald-100" : "text-slate-400"}`}
                    >
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

          <tbody>
            {iznajmljivaci.map((iznajmljivac) => (
              <>
                <tr
                  key={`iznajmljivac-${iznajmljivac.landlordId}`}
                  className="bg-slate-100"
                >
                  <td className="sticky left-0 z-20 bg-slate-100 border-r border-b border-slate-300 font-semibold text-slate-700 px-2 py-1 min-w-[160px] max-w-[160px] w-[160px] uppercase tracking-wide text-[11px]">
                    {iznajmljivac.ime}
                  </td>
                  <td className="sticky left-[160px] z-20 bg-slate-100 border-r border-b border-slate-300 min-w-[80px] max-w-[80px] w-[80px]" />
                  {datumi.map((datum) => {
                    const isToday = datum === today;
                    return (
                      <td
                        key={datum}
                        className={[
                          "border-r border-b h-7 min-w-[38px] max-w-[38px] w-[38px]",
                          isToday
                            ? "bg-emerald-100"
                            : isWeekend(datum)
                              ? "bg-slate-200"
                              : "bg-slate-100",
                        ].join(" ")}
                      />
                    );
                  })}
                </tr>

                {iznajmljivac.apartmani.map((apartman) => (
                  <tr key={apartman.accommodationId}>
                    <td className="sticky left-0 z-20 bg-white border-r border-b border-slate-200 min-w-[160px] max-w-[160px] w-[160px]" />
                    <td className="sticky left-[160px] z-20 bg-white border-r border-b border-slate-200 text-slate-600 font-medium text-right pr-2 min-w-[80px] max-w-[80px] w-[80px]">
                      {apartman.naziv}
                    </td>

                    {datumi.map((datum) => {
                      const isToday = datum === today;
                      const isWeekendDay = isWeekend(datum);
                      const dan = apartman.dani.find(
                        (d) => d.datum === datum,
                      ) ?? {
                        datum,
                        tip: null,
                        redniBroj: null,
                        jeOdjava: false,
                      };
                      const isSelected = isDatumUSelekciji(
                        datum,
                        selekcija,
                        apartman.accommodationId,
                      );

                      return (
                        <DanCelija
                          key={datum}
                          dan={dan}
                          isWeekendDay={isWeekendDay}
                          isToday={isToday}
                          isSelected={isSelected}
                          onMouseDown={(e) =>
                            handleCellMouseDown(
                              e,
                              apartman.accommodationId,
                              datum,
                            )
                          }
                          onMouseEnter={() =>
                            handleCellMouseEnter(
                              apartman.accommodationId,
                              datum,
                            )
                          }
                          onContextMenu={(e) =>
                            handleCellContextMenu(
                              e,
                              apartman.accommodationId,
                              apartman.naziv,
                              datum,
                            )
                          }
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

      <KalendarContextMenu
        state={contextMenu}
        onClose={closeContextMenu}
        onIzradaRezervacije={(accommodationId, od, do_) => {
          onIzradaRezervacije?.(accommodationId, od, do_);
        }}
        onIzradaPrijave={(accommodationId, od, do_) => {
          onIzradaPrijave?.(accommodationId, od, do_);
        }}
      />
    </div>
  );
}
