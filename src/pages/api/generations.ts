import type { APIRoute } from "astro";
import { createGenerationSchema } from "../../lib/schemas/generation.schema";
import { GenerationService } from "../../lib/services/generationService";
import { DELAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = createGenerationSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process generation using default user ID
    const generationService = new GenerationService(locals.supabase);
    const response = await generationService.createGeneration(DELAULT_USER_ID, result.data);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generation creation failed:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process generation request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
