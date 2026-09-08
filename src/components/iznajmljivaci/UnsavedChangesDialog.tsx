"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnsavedChangesDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function UnsavedChangesDialog({
  open,
  onCancel,
  onConfirm,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nespremljene promjene</AlertDialogTitle>
          <AlertDialogDescription>
            Napravili ste promjene koje nisu spremljene. Vraćanjem na popis
            iznajmljivača, promjene će biti izgubljene.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Ne</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Da</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
