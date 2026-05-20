"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { landlordSchema, type LandlordFormValues } from "@/lib/validations/landlord"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 mt-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {children}
      </h3>
      <hr className="mt-1 border-border" />
    </div>
  )
}

export function LandlordForm() {
  const form = useForm<LandlordFormValues>({
    resolver: zodResolver(landlordSchema),
    defaultValues: {
      surname: "",
      name: "",
      oib: "",
      address: "",
      phone: "",
      iban: "",
      rjesenje: "",
      brUgovora: "",
      eVisitName: "",
      eVisitPass: "",
    },
  })

  // Submit logic will be added when server actions are implemented.
  function onSubmit(values: LandlordFormValues) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        noValidate
      >
        <SectionHeading>Osnove</SectionHeading>

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prezime</FormLabel>
              <FormControl>
                <Input placeholder="Horvat" {...field} />
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
              <FormLabel>Ime</FormLabel>
              <FormControl>
                <Input placeholder="Ivan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vrstaIznajmljivaca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vrsta iznajmljivača</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Odaberite vrstu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fizicka_osoba">Fizička osoba</SelectItem>
                  <SelectItem value="obrt">Obrt</SelectItem>
                  <SelectItem value="tvrtka">Tvrtka</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="oib"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OIB</FormLabel>
              <FormControl>
                <Input
                  placeholder="12345678901"
                  maxLength={11}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SectionHeading>Kontakt i lokacija</SectionHeading>

        {/* cityId will be replaced with a combobox populated from the cities table */}
        <FormField
          control={form.control}
          name="cityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="ID grada"
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input placeholder="+385 91 234 5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Adresa</FormLabel>
              <FormControl>
                <Input placeholder="Ulica i broj" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iban"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>IBAN</FormLabel>
              <FormControl>
                <Input placeholder="HR1234567890123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SectionHeading>Poslovni podaci</SectionHeading>

        <FormField
          control={form.control}
          name="rjesenje"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Rješenje{" "}
                <span className="text-muted-foreground font-normal">(neobavezno)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Broj rješenja" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brUgovora"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Br. ugovora{" "}
                <span className="text-muted-foreground font-normal">(neobavezno)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Broj ugovora" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SectionHeading>Provizija</SectionHeading>

        <FormField
          control={form.control}
          name="tipProvizije"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tip provizije</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Odaberite tip" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="P">Postotak (%)</SelectItem>
                  <SelectItem value="I">Fiksni iznos (€)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iznos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Iznos provizije</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SectionHeading>eVisit</SectionHeading>

        <FormField
          control={form.control}
          name="eVisitName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                eVisit korisničko ime{" "}
                <span className="text-muted-foreground font-normal">(neobavezno)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="korisnicko.ime" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eVisitPass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                eVisit lozinka{" "}
                <span className="text-muted-foreground font-normal">(neobavezno)</span>
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-2 flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline">
            Odustani
          </Button>
          <Button type="submit">Spremi iznajmljivača</Button>
        </div>
      </form>
    </Form>
  )
}
