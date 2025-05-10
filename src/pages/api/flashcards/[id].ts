import { updateFlashcardSchema, uuidSchema } from "../../../lib/validations/flashcard";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import type { APIContext } from "astro";
import { ZodError } from "zod";

export const prerender = false;

/**
 * Update an existing flashcard
 * PATCH /api/flashcards/:id
 */
export async function PATCH({ params, request, locals }: APIContext) {
  // Get authenticated user from Supabase Auth
  const supabase = locals.supabase;
  const {
    data: { session },
  } = await locals.supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate flashcard ID
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ message: "Flashcard ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    uuidSchema.parse(id);
  } catch (error: unknown) {
    const message =
      error instanceof ZodError ? error.errors[0]?.message || "Invalid format" : "Invalid flashcard ID format";

    return new Response(
      JSON.stringify({
        message: "Invalid flashcard ID format",
        details: message,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Parse and validate request body
  let body;
  try {
    body = await request.json();
    updateFlashcardSchema.parse(body);
  } catch (error: unknown) {
    const message =
      error instanceof ZodError
        ? error.errors[0]?.message || "Invalid format"
        : error instanceof Error
          ? error.message
          : "Invalid request body";

    return new Response(
      JSON.stringify({
        message: "Invalid request body",
        details: message,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Execute update operation
  const flashcardService = new FlashcardService(supabase);
  const updatedFlashcard = await flashcardService.update(id, body, session.user.id);

  // Handle not found or operation failure
  if (!updatedFlashcard) {
    return new Response(JSON.stringify({ message: "Flashcard not found or update failed" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return updated flashcard
  return new Response(JSON.stringify(updatedFlashcard), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Delete a flashcard
 * DELETE /api/flashcards/:id
 */
export async function DELETE({ params, locals }: APIContext) {
  // Get authenticated user from Supabase Auth
  const supabase = locals.supabase;
  const {
    data: { session },
  } = await locals.supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate flashcard ID
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ message: "Flashcard ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    uuidSchema.parse(id);
  } catch (error: unknown) {
    const message =
      error instanceof ZodError ? error.errors[0]?.message || "Invalid format" : "Invalid flashcard ID format";

    return new Response(
      JSON.stringify({
        message: "Invalid flashcard ID format",
        details: message,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Execute delete operation
  const flashcardService = new FlashcardService(supabase);
  const success = await flashcardService.delete(id, session.user.id);

  // Handle not found
  if (!success) {
    return new Response(JSON.stringify({ message: "Flashcard not found or delete failed" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return success with no content
  return new Response(null, { status: 204 });
}
