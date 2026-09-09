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

interface CopyPricelistDialogProps {
  open: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CopyPricelistDialog({
  open,
  isPending,
  onCancel,
  onConfirm,
}: CopyPricelistDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kopiranje cjenika</AlertDialogTitle>
          <AlertDialogDescription>
            Cjenik označene smještajne jedinice bit će kopiran na sve
            smještajne jedinice ovog iznajmljivača koje nemaju upisan cjenik.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            Odustani
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            Kopiraj
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
