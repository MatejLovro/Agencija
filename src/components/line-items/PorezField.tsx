"use client";

import { useController } from "react-hook-form";
import type { FieldValues, Path, Control } from "react-hook-form";

interface Props<T extends FieldValues> {
  taxIdName: Path<T>;
  taxStopaName: Path<T>;
  control: Control<T>;
}

export function PorezField<T extends FieldValues>({
  taxIdName,
  taxStopaName,
  control,
}: Props<T>) {
  const { field: taxIdField } = useController({ control, name: taxIdName });
  const { field: taxStopaField } = useController({
    control,
    name: taxStopaName,
  });

  return (
    <span className="text-sm text-muted-foreground">
      {taxIdField.value
        ? `${parseFloat(String(taxStopaField.value)).toFixed(0)}%`
        : "—"}
    </span>
  );
}
