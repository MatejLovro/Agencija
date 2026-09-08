"use client";

import { useCallback, useState } from "react";

/**
 * Zajednička logika za "izlaznu" akciju (Povratak na popis / Odustani) iz forme
 * koja može imati nespremljene promjene. Ako forma nije dirty, izlaz je odmah.
 * Ako je dirty, prvo se prikazuje confirmation dialog (vidi UnsavedChangesDialog).
 */
export function useUnsavedChangesGuard(
  isDirty: boolean,
  onConfirmedExit: () => void,
) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const requestExit = useCallback(() => {
    if (isDirty) {
      setDialogOpen(true);
    } else {
      onConfirmedExit();
    }
  }, [isDirty, onConfirmedExit]);

  const cancelExit = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const confirmExit = useCallback(() => {
    setDialogOpen(false);
    onConfirmedExit();
  }, [onConfirmedExit]);

  return { dialogOpen, requestExit, cancelExit, confirmExit };
}
