"use client";

import { useController } from "react-hook-form";
import type { FieldValues, Path, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  onChangeCallback?: (val: number) => void;
  className?: string;
}

export function NumberField<T extends FieldValues>({
  name,
  control,
  onChangeCallback,
  className,
}: Props<T>) {
  const { field } = useController({ control, name });

  return (
    <Input
      className={className ?? "h-7 text-xs text-right w-full"}
      value={field.value}
      onChange={(e) => {
        const val = parseFloat(e.target.value) || 0;
        field.onChange(val);
        onChangeCallback?.(val);
      }}
      onFocus={(e) => e.target.select()}
    />
  );
}
