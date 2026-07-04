"use client";

import { useController } from "react-hook-form";
import type { FieldValues, Path, Control } from "react-hook-form";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  className?: string;
}

export function IznosField<T extends FieldValues>({
  name,
  control,
  className,
}: Props<T>) {
  const { field } = useController({ control, name });

  return (
    <span className={className ?? "text-sm font-medium tabular-nums"}>
      {(parseFloat(String(field.value)) || 0).toFixed(2)}
    </span>
  );
}
