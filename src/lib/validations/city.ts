import { z } from "zod";

export const citySchema = z.object({
  name: z.string().min(1, "Naziv grada je obavezan").max(100),
  zip: z.string().max(10).optional().or(z.literal("")),
});

export type CityFormValues = z.infer<typeof citySchema>;
