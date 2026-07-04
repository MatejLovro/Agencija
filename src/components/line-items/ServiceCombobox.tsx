"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export interface ServiceOption {
  id: string;
  naziv: string;
  cijena: string | null;
  taxId: string | null;
  taxStopa: string | null;
  taxNaziv: string | null;
}

interface Props {
  services: ServiceOption[];
  value: string;
  onChange: (id: string) => void;
  onAddNew?: () => void;
}

export function ServiceCombobox({
  services,
  value,
  onChange,
  onAddNew,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = services.filter((s) =>
    s.naziv.toLowerCase().includes(query.toLowerCase()),
  );

  const selected = services.find((s) => s.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Prikazni red */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <span
          className={selected ? "text-sm" : "text-sm text-muted-foreground"}
        >
          {selected ? selected.naziv : "Odaberi uslugu"}
        </span>
        <svg
          className="h-4 w-4 text-muted-foreground shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-white border border-slate-200 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži..."
              className="h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  handleSelect(filtered[0].id);
                }
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Nema rezultata.
              </div>
            )}
            {filtered.map((s) => (
              <div
                key={s.id}
                className="px-3 py-2 cursor-pointer hover:bg-slate-100 text-sm"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s.id);
                }}
              >
                <div>{s.naziv}</div>
                {s.cijena && (
                  <div className="text-xs text-muted-foreground">
                    €{parseFloat(s.cijena).toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dodaj novu uslugu */}
          {onAddNew && (
            <div
              className="px-3 py-2 border-t cursor-pointer text-primary text-sm hover:bg-slate-100 flex items-center gap-2"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                setQuery("");
                onAddNew();
              }}
            >
              <Plus className="h-4 w-4" />
              Dodaj novu uslugu
            </div>
          )}
        </div>
      )}
    </div>
  );
}
