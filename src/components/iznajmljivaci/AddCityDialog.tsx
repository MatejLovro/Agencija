"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { capitalizeWords } from "@/lib/utils/formatters";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { citySchema, type CityFormValues } from "@/lib/validations/city";
import { actionCreateCity } from "@/lib/actions/cities";

interface AddCityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCityCreated: (city: {
    id: number;
    name: string;
    zip?: string | null;
  }) => void;
}

export function AddCityDialog({
  open,
  onOpenChange,
  onCityCreated,
}: AddCityDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: "",
      zip: "",
    },
  });

  function onSubmit(data: CityFormValues) {
    startTransition(async () => {
      const result = await actionCreateCity({ name: data.name, zip: data.zip });

      if (result.error) {
        form.setError("name", { type: "manual", message: result.error });
        return;
      }

      onCityCreated(result.data!);
      form.reset();
      onOpenChange(false);
    });
  }

  function handleOpenChange(val: boolean) {
    if (!val) form.reset();
    onOpenChange(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Dodaj grad / mjesto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poštanski broj</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-muted/40 w-32"
                        placeholder="21000"
                        maxLength={10}
                        autoComplete="off"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Naziv <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-muted/40"
                        placeholder="npr. Split"
                        autoComplete="off"
                        {...field}
                        onChange={(e) =>
                          field.onChange(capitalizeWords(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Spremanje..." : "Spremi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
