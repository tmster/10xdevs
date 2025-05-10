import { createClient } from "@supabase/supabase-js";
import type { FullConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalSetup(_config: FullConfig) {
  // Create the Supabase client for test setup
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Log in with test user credentials
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME || "",
    password: process.env.E2E_PASSWORD || "",
  });

  if (signInError) {
    throw signInError;
  }
}

export default globalSetup;
