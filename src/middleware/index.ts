import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create the Supabase client
  const supabase = createSupabaseServerClient({
    cookies,
    headers: request.headers,
  });

  // Make it available to all routes
  locals.supabase = supabase;

  // Get the current path
  const path = url.pathname;

  // Check if this is a public path
  const isPublicPath = PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(publicPath + "/"));

  // Special case for root path
  if (path === "/") {
    // Get session
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      // User is logged in, redirect to flashcards
      return redirect("/flashcards/list");
    } else {
      // User is not logged in, redirect to login
      return redirect("/login");
    }
  }

  // For non-public paths, check authentication
  if (!isPublicPath) {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      // User is authenticated, set user data and continue
      locals.user = {
        id: data.session.user.id,
        email: data.session.user.email,
      };
    } else {
      // User is not authenticated, redirect to login
      return redirect("/login");
    }
  }

  // All checks passed, continue to the requested route
  return next();
});
