import type { APIRoute } from "astro";
import { z } from "zod";

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be less than 64 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Attempt to sign up
    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
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

    // Return success response with user data
    return new Response(
      JSON.stringify({
        success: true,
        user: data.user,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred during registration",
      }),
      { status: 500 }
    );
  }
};

// Disable pre-rendering for this API route
export const prerender = false;