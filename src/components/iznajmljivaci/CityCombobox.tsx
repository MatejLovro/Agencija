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

  const selectedCity = localCities.find((c) => c.id === value);

  const filtered = localCities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal bg-muted/40 h-9",
              error && "border-destructive",
            )}
            onKeyDown={(e) => {
              if (!open && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
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
              }
            }}
          >
            {selectedCity ? selectedCity.name : "Odaberite ili dodajte grad..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              ref={searchInputRef}
              placeholder="Pretraži grad..."
              value={search}
              onValueChange={setSearch}
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
                  setOpen(false);
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Dodaj novi grad...
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
      />
    </div>
  );
}
