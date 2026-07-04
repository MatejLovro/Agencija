"use client";

import { useController } from "react-hook-form";
import type { FieldValues, Path, Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
}

export function DodatniOpisField<T extends FieldValues>({
  name,
  control,
}: Props<T>) {
  const { field } = useController({ control, name });

  return (
    <Textarea
      className="mt-1 text-xs min-h-[60px]"
      placeholder="Dodajte opis stavke"
      value={field.value ?? ""}
      onChange={(e) => field.onChange(e.target.value || null)}
      autoFocus
    />
  );
}
