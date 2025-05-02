import type { APIRoute } from "astro";
import { z } from "zod";

// Validation schema for login credentials
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error.issues[0].message
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Attempt to sign in
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        { status: 400 }
      );
    }

    // Ensure the session is established
    await locals.supabase.auth.getSession();

    // Return redirect response to ensure cookies are properly set
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/flashcards/list",
        "Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
        Pragma: "no-cache",
        Expires: "0"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred during login"
      }),
      { status: 500 }
    );
  }
};

// Disable pre-rendering for this API route
export const prerender = false;