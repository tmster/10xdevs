import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcardService";

// Schema for validating query parameters
const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(["accepted", "rejected"]).optional(),
  source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
  sort: z.enum(["created_at", "updated_at"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "User must be authenticated to access flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(url.searchParams));

    if (!queryResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: queryResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process request using FlashcardService with authenticated user's ID
    const flashcardService = new FlashcardService(locals.supabase);
    const response = await flashcardService.getFlashcards(locals.user.id, queryResult.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Flashcard retrieval failed:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to retrieve flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
