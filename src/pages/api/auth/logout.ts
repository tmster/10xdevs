import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, redirect }) => {
  try {
    // Sign out the user - this will clear session cookies automatically
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      console.error("Error during logout:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Redirect to login page with cache-control headers
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
        "Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);

    // Even on error, try to redirect to login
    return redirect("/login");
  }
};

// Disable pre-rendering for this API route
export const prerender = false;
