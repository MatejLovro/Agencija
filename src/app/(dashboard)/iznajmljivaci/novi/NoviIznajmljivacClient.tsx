"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LandlordForm } from "@/components/iznajmljivaci/LandlordForm";
import { UnsavedChangesDialog } from "@/components/iznajmljivaci/UnsavedChangesDialog";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

interface City {
  id: number;
  name: string;
  zip?: string | null;
}

interface NoviIznajmljivacClientProps {
  cities: City[];
}

export function NoviIznajmljivacClient({
  cities,
}: NoviIznajmljivacClientProps) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);

  const goToList = useCallback(() => {
    router.push("/iznajmljivaci");
  }, [router]);

  const { dialogOpen, requestExit, cancelExit, confirmExit } =
    useUnsavedChangesGuard(isDirty, goToList);

  return (
    <div className="max-w-[1200px] px-4 py-6 bg-background">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Novi iznajmljivač</h1>
      </div>

      <LandlordForm
        cities={cities}
        onDirtyChange={setIsDirty}
        onRequestExit={requestExit}
      />

      <p className="text-sm text-muted-foreground mt-2">
        <span className="text-destructive">*</span> Obavezno polje
      </p>

      <UnsavedChangesDialog
        open={dialogOpen}
        onCancel={cancelExit}
        onConfirm={confirmExit}
      />
    </div>
  );
}
