import { z } from "zod";

export const createGenerationSchema = z.object({
  text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text cannot exceed 10000 characters"),
  options: z.object({
    max_cards: z
      .number()
      .int("Number of cards must be an integer")
      .min(1, "Must generate at least 1 card")
      .max(50, "Cannot generate more than 50 cards at once"),
  }),
});

export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;
