"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";

export type ComboboxOption = {
  value: number | string;
  label: string;
};

interface ComboboxWithCreateProps {
  value: number | string | undefined;
  onChange: (value: number | string) => void;
  options: ComboboxOption[];
  /** Server Action koja kreira novi zapis i vraća { id, name }.
   *  Može baciti iznimku ili vratiti null/undefined — komponenta
   *  hvata grešku i prikazuje je korisniku. */
  onCreate: (
    name: string,
  ) => Promise<{ id: number | string; name: string } | null | undefined>;
  entityLabel: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ComboboxWithCreate({
  value,
  onChange,
  options,
  onCreate,
  entityLabel,
  placeholder,
  disabled,
  className,
}: ComboboxWithCreateProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [localOptions, setLocalOptions] = useState<ComboboxOption[]>(options);

  const selectedOption = localOptions.find((opt) => opt.value === value);

  const filteredOptions = localOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelect(optionValue: number | string) {
    onChange(optionValue);
    setOpen(false);
    setSearch("");
  }

  function handleStartCreate() {
    setIsCreating(true);
    setCreateError(null);
    setNewName(search);
  }

  function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setCreateError(null);

    startTransition(async () => {
      try {
        const created = await onCreate(trimmed);

        if (!created) {
          setCreateError("Greška pri spremanju. Pokušajte ponovno.");
          return;
        }

        const newOption: ComboboxOption = {
          value: created.id,
          label: created.name,
        };
        setLocalOptions((prev) =>
          [...prev, newOption].sort((a, b) => a.label.localeCompare(b.label)),
        );
        onChange(created.id);
        setIsCreating(false);
        setNewName("");
        setSearch("");
        setOpen(false);
      } catch (e) {
        setCreateError("Greška pri spremanju. Pokušajte ponovno.");
      }
    });
  }

  function handleCancelCreate() {
    setIsCreating(false);
    setNewName("");
    setCreateError(null);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setIsCreating(false);
          setSearch("");
          setCreateError(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedOption && "text-muted-foreground",
            className,
          )}
        >
          {selectedOption
            ? selectedOption.label
            : (placeholder ?? `Odaberite ${entityLabel}...`)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {isCreating ? (
          <div className="p-3 space-y-2">
            <p className="text-sm font-medium">Novi {entityLabel}</p>
            <Input
              autoFocus
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setCreateError(null);
              }}
              placeholder={`Naziv ${entityLabel}a`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancelCreate();
                }
              }}
            />
            {/* Prikaz greške ispod inputa */}
            {createError && (
              <p className="text-xs text-red-600">{createError}</p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelCreate}
                disabled={isPending}
              >
                Odustani
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                disabled={isPending || !newName.trim()}
              >
                {isPending ? "Spremam..." : "Spremi"}
              </Button>
            </div>
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Pretraži..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty className="py-2">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleStartCreate();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj &quot;{search}&quot; kao novi {entityLabel}
                </button>
              </CommandEmpty>

              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={String(option.value)}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>

              {filteredOptions.length > 0 && (
                <div className="border-t p-1">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleStartCreate();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Dodaj novi {entityLabel}
                  </button>
                </div>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
