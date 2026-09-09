"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { capitalizeFirst } from "@/lib/utils/formatters";

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
import { useFormKeyboardNav } from "@/hooks/use-form-keyboard-nav";

interface AddCityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCityCreated: (city: {
    id: number;
    name: string;
    zip?: string | null;
  }) => void;
  initialName?: string;
  /**
   * Poziva se kad Radix Dialog zatvara i vraća fokus (Escape, Odustani,
   * uspješno Spremi). Preuzima Radixov default focus-return — pozivatelj
   * (npr. combobox koji je otvorio ovaj dialog) odlučuje kamo fokus ide.
   */
  onCloseAutoFocus?: (event: Event) => void;
}

export function AddCityDialog({
  open,
  onOpenChange,
  onCityCreated,
  initialName,
  onCloseAutoFocus,
}: AddCityDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: capitalizeFirst(initialName ?? ""),
      zip: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: capitalizeFirst(initialName ?? ""), zip: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialName]);

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

  const handleFormKeyDown = useFormKeyboardNav();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[360px]"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>Dodaj grad / mjesto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              // Dialog sadržaj je React-portaliziran, ali ostaje dijete u
              // React component tree-u LandlordForm-a — sintetički submit
              // event bi inače probublao kroz React (ne DOM) stablo sve do
              // vanjske <form> i pokrenuo njezinu validaciju/submit. Ova
              // forma mora biti zasebna interakcijska cjelina.
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              handleFormKeyDown(e);
            }}
            noValidate
          >
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
                        placeholder="npr. 21000"
                        maxLength={10}
                        autoComplete="off"
                        autoFocus
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
                          field.onChange(capitalizeFirst(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Spremi je DOM-prvi (ispred Odustani) da Tab nakon zadnjeg
                inputa ide na primarnu akciju; flex-row-reverse zadržava
                dosadašnji vizualni raspored (Odustani lijevo, Spremi desno). */}
            <DialogFooter className="mt-4 flex-col sm:flex-row-reverse">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Spremanje..." : "Spremi"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Odustani
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
