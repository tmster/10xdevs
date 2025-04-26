import type { APIRoute } from "astro";
import { createGenerationSchema } from "../../lib/schemas/generation.schema";
import { ServiceFactory } from "../../lib/services/factory";
import { DELAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // In production, we should require authentication
    const userId = locals.user?.id || DELAULT_USER_ID;

    const body = await request.json();
    const validationResult = createGenerationSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    const generationService = ServiceFactory.getInstance().createGenerationService(locals.supabase);
    const result = await generationService.createGeneration(userId, validationResult.data);

    return new Response(JSON.stringify(result), {
      status: 201,
    });
  } catch (error) {
    console.error("Generation creation failed:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create generation",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
