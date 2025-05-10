import { z } from "zod";

/**
 * Schema for validating flashcard update requests
 * - front: optional, string, max 200 characters
 * - back: optional, string, max 500 characters
 * - status: optional, one of: "accepted", "rejected", "pending"
 */
export const updateFlashcardSchema = z.object({
  front: z.string().max(200).optional(),
  back: z.string().max(500).optional(),
  status: z.enum(["accepted", "rejected", "pending"]).optional(),
});

/**
 * Schema for validating UUID parameters
 */
export const uuidSchema = z.string().uuid();
