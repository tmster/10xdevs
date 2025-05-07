import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Client-side Supabase client
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type SupabaseClient = typeof supabaseClient;

// Cookie options for server-side client
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: import.meta.env.PROD, // Only use secure in production
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Helper function to parse cookies from header
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) return [];
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Server-side Supabase client
export const createSupabaseServerClient = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        const cookieHeader = context.headers.get("Cookie") || "";
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // When setting cookies, use maxAge for better browser compatibility
          context.cookies.set(name, value, {
            ...options,
            maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 days default
          });
        });
      },
    },
  });

  return supabase;
};

export const DELAULT_USER_ID = "cd8cb47b-7c60-448a-b36e-00cfd1f799e0";
