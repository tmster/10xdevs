import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient, type SupabaseClient } from "../db/supabase.client";
import type { User } from "@supabase/supabase-js";

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

// Define the minimal user type we need
type MinimalUser = Pick<User, "id" | "email">;

// Extend Astro's Locals interface
declare module "astro" {
  interface Locals {
    supabase: SupabaseClient;
    user?: MinimalUser;
  }
}

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
    // Get authenticated user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      // User is logged in, redirect to flashcards
      return redirect("/flashcards/list");
    } else {
      // User is not logged in, redirect to login
      return redirect("/login");
    }
  }

  // For non-public paths, check authentication
  if (!isPublicPath) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      // User is authenticated, set user data and continue
      locals.user = {
        id: user.id,
        email: user.email,
      };
    } else {
      // User is not authenticated, redirect to login
      return redirect("/login");
    }
  }

  // All checks passed, continue to the requested route
  return next();
});
