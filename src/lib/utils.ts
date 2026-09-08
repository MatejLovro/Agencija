import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Globalni klase za tablice s selekcijom retka (header / row hover / selected row).
 * Vidi docs/ui-design-system.md — poglavlje "Tables — selectable rows".
 */
export const selectableTableHeaderClass = "bg-muted/60 text-muted-foreground border-b border-border"

export function selectableTableRowClass(selected: boolean) {
  return cn(
    "cursor-pointer border-b border-border last:border-0 border-l-2 transition-colors",
    selected
      ? "border-l-primary bg-primary/20 font-medium hover:bg-primary/20"
      : "border-l-transparent hover:bg-muted/40",
  )
}
