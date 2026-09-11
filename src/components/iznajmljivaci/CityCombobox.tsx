"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AddCityDialog } from "./AddCityDialog";
import { focusNextKbNavItem } from "@/hooks/use-form-keyboard-nav";

interface City {
  id: number;
  name: string;
}

interface CityComboboxProps {
  cities: City[];
  value: number | null;
  onChange: (value: number) => void;
  error?: string;
}

export function CityCombobox({
  cities,
  value,
  onChange,
  error,
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [localCities, setLocalCities] = React.useState<City[]>(cities);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  // Kontrolira cmdk-ov interni "highlighted" state. Postavlja se eksplicitno
  // na odabranu stavku kad se lista otvori klikom/Enterom (da highlight ne
  // krene od prve stavke po abecedi), a resetira na "" kad se otvori
  // tipkanjem znaka (da cmdk sam highlighta prvi filtrirani rezultat).
  const [highlighted, setHighlighted] = React.useState("");

  const selectedCity = localCities.find((c) => c.id === value);

  const filtered = localCities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  function openAddCityDialog() {
    setOpen(false);
    setDialogOpen(true);
  }

  // CityCombobox ostaje vlasnik trigger refa i odlučuje da fokus treba
  // vratiti na sebe kad se AddCityDialog zatvori (Escape, Odustani, ili
  // uspješno Spremi) — AddCityDialog samo prosljeđuje Radixov
  // onCloseAutoFocus hook prema van, bez vezivanja uz konkretan
  // combobox koji ga je otvorio.
  function handleDialogCloseAutoFocus(event: Event) {
    event.preventDefault();
    triggerRef.current?.focus();
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            data-kbnav-stop
            className={cn(
              "w-full justify-between font-normal bg-muted/40 h-9 rounded-sm border-input hover:border-input-hover focus-visible:ring-1 aria-expanded:border-ring aria-expanded:ring-1 aria-expanded:ring-ring",
              error && "border-destructive",
            )}
            onClick={() => {
              if (!open && selectedCity) {
                setHighlighted(selectedCity.name);
              }
            }}
            onKeyDown={(e) => {
              if (!open && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setHighlighted("");
                setSearch(e.key);
                setOpen(true);
                // Nakon otvaranja, postavi cursor na kraj inputa
                setTimeout(() => {
                  if (searchInputRef.current) {
                    const len = searchInputRef.current.value.length;
                    searchInputRef.current.setSelectionRange(len, len);
                    searchInputRef.current.focus();
                  }
                }, 0);
                return;
              }

              if (!open && e.key === "ArrowDown") {
                e.preventDefault();
                if (selectedCity) setHighlighted(selectedCity.name);
                setOpen(true);
                return;
              }

              if (!open && e.key === "Enter") {
                if (selectedCity) {
                  // Validna vrijednost je već odabrana i lista je zatvorena —
                  // Enter ne otvara listu, nego se ponaša kao ostala polja u
                  // formi (isti "idi na sljedeće polje" mehanizam).
                  e.preventDefault();
                  focusNextKbNavItem(e.currentTarget);
                } else {
                  setOpen(true);
                }
              }
            }}
          >
            {selectedCity ? selectedCity.name : "Odaberite ili dodajte grad..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command
            value={highlighted}
            onValueChange={setHighlighted}
            onKeyDown={(e) => {
              // Insert je lokalni shortcut samo za ovaj combobox — otvara
              // istu "Dodaj novi grad" akciju kao klik, bez upisivanja
              // znaka i bez utjecaja na Arrow/Enter/Escape/Tab navigaciju
              // ili globalnu Enter navigaciju forme (koja ionako ignorira
              // sadržaj unutar cmdk-root-a).
              if (e.key === "Insert") {
                e.preventDefault();
                openAddCityDialog();
              }
            }}
          >
            <CommandInput
              ref={searchInputRef}
              placeholder="Pretraži grad..."
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setHighlighted("");
              }}
            />
            <CommandList>
              {filtered.length > 0 && (
                <CommandGroup>
                  {filtered.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.name}
                      onSelect={() => {
                        onChange(city.id);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === city.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {city.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nema rezultata.
                </p>
              )}
            </CommandList>

            {/* Fiksni gumb ispod liste — uvijek vidljiv */}
            <div className="border-t p-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault(); // spriječi blur na input
                  openAddCityDialog();
                }}
              >
                <Plus className="h-4 w-4" />
                Dodaj novi grad (Ins)...
              </button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-destructive text-xs mt-1">{error}</p>}

      <AddCityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCityCreated={(city) => {
          setLocalCities((prev) => [...prev, { id: city.id, name: city.name }]);
          onChange(city.id);
        }}
        initialName={search}
        onCloseAutoFocus={handleDialogCloseAutoFocus}
      />
    </div>
  );
}
