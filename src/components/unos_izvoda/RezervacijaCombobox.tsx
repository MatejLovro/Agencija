"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type RezervacijaOption = {
  id: string;
  redniBroj: number;
  guestName: string;
  guestSurname: string;
  dateFrom: string; // ISO — trenutno se ne prikazuje, ostavljeno za buduće sortiranje
  predujam: string | null;
};

function formatLabel(opt: RezervacijaOption): string {
  const broj = String(opt.redniBroj).padEnd(6);
  const gost = `${opt.guestName} ${opt.guestSurname}`.slice(0, 20).padEnd(20);
  const predujamText = opt.predujam
    ? `predujam: ${Number(opt.predujam).toFixed(2)} \u20ac`
    : "predujam: -";

  return `${broj}${gost}${predujamText}`;
}

export function RezervacijaCombobox({
  options,
  value,
  onChange,
  disabled,
}: {
  options: RezervacijaOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between font-mono font-normal pr-16"
          >
            <span className="truncate whitespace-pre">
              {selected ? formatLabel(selected) : "Odaberi rezervaciju..."}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        {selected && (
          // Namjerno IZVAN Button/PopoverTrigger stabla — shadcn Button ima
          // [&_svg]:pointer-events-none na svim <svg> unutar sebe (da ikone
          // poput ChevronsUpDown ne kradu klik od dugmeta), pa X ikona
          // ugniježđena unutar Button-a nikad ne bi primila klik.
          <button
            type="button"
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 p-1 opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange(null);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <PopoverContent className="w-[440px] p-0">
        <Command>
          <CommandInput placeholder="Pretraži po gostu ili broju..." />

          <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground font-mono whitespace-pre border-b">
            <span className="h-4 w-4 shrink-0 inline-block" aria-hidden />
            <span>
              {"Broj".padEnd(6)}
              {"Gost".padEnd(20)}
              {"Predujam"}
            </span>
          </div>

          <CommandList>
            <CommandEmpty>Nema rezultata.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={formatLabel(opt)}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className="font-mono text-sm"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === opt.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="whitespace-pre">{formatLabel(opt)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
