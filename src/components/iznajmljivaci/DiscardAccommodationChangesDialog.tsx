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

interface DiscardAccommodationChangesDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DiscardAccommodationChangesDialog({
  open,
  onCancel,
  onConfirm,
}: DiscardAccommodationChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Poništavanje promjena</AlertDialogTitle>
          <AlertDialogDescription>
            Ovim poništavate upisane podatke. Jeste li sigurni?
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
