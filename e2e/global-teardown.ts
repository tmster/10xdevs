import { createClient } from '@supabase/supabase-js';
import type { FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PUBLIC_KEY!;

async function globalTeardown(config: FullConfig) {
  console.log('Starting global teardown...');

  // Create the Supabase client for test cleanup
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Log in with the same test user credentials used in tests
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME!,
    password: process.env.E2E_PASSWORD!,
  });

  if (signInError) {
    console.error('Error signing in for test cleanup:', signInError);
    throw signInError;
  }

  // Clean up data created during tests
  try {
    const testUserId = process.env.E2E_USER_ID!;

    // Clean up in reverse order of dependencies to respect foreign key constraints

    // 1. Delete generation_error_logs related to test user's generations
    const { data: generations } = await supabase
      .from('generations')
      .select('id')
      .eq('user_id', testUserId);

    if (generations && generations.length > 0) {
      const generationIds = generations.map(gen => gen.id);

      // Delete error logs associated with these generations
      const { error: errorLogsDeleteError } = await supabase
        .from('generation_error_logs')
        .delete()
        .in('generation_id', generationIds);

      if (errorLogsDeleteError) {
        console.error('Error deleting test generation error logs:', errorLogsDeleteError);
      }

      // 2. Delete flashcards associated with these generations
      const { error: flashcardsDeleteError } = await supabase
        .from('flashcards')
        .delete()
        .in('generation_id', generationIds);

      if (flashcardsDeleteError) {
        console.error('Error deleting test flashcards by generation:', flashcardsDeleteError);
      }
    }

    // 3. Delete any remaining flashcards created by the test user
    const { error: remainingFlashcardsError } = await supabase
      .from('flashcards')
      .delete()
      .eq('user_id', testUserId);

    if (remainingFlashcardsError) {
      console.error('Error deleting remaining test flashcards:', remainingFlashcardsError);
    }

    // 4. Delete all generations created by the test user
    const { error: generationsDeleteError } = await supabase
      .from('generations')
      .delete()
      .eq('user_id', testUserId);

    if (generationsDeleteError) {
      console.error('Error deleting test generations:', generationsDeleteError);
    }

    // Note: We don't delete from the users table since it's managed by Supabase Auth

  } catch (error) {
    console.error('Error during test data cleanup:', error);
  }

  console.log('Global teardown completed');
}

export default globalTeardown;