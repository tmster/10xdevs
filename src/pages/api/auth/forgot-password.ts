import type { APIRoute } from "astro";
import { z } from "zod";

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Send password reset email via Supabase
    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/reset-password", request.url).toString(),
    });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 400 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset email sent",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};

// Disable pre-rendering for this API route
export const prerender = false;