import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

// Class to manage test data lifecycle
export class TestDataManager {
  private supabase;
  private createdRecords: Map<string, string[]> = new Map();

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Initialize the test data manager by signing in
   */
  async init() {
    // Sign in with the test user credentials
    const { error: signInError } = await this.supabase.auth.signInWithPassword({
      email: process.env.E2E_USERNAME!,
      password: process.env.E2E_PASSWORD!,
    });

    if (signInError) {
      console.error('Error signing in for test data management:', signInError);
      throw signInError;
    }
  }

  /**
   * Insert a test record and track it for later cleanup
   * @param table The table to insert into
   * @param data The data to insert
   * @returns The inserted record
   */
  async insert<T extends object>(table: string, data: T): Promise<T> {
    const { data: record, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error(`Error inserting test data into ${table}:`, error);
      throw error;
    }

    // Track the record for cleanup
    if (!this.createdRecords.has(table)) {
      this.createdRecords.set(table, []);
    }

    // Assuming all tables have an id column
    this.createdRecords.get(table)!.push(record.id);

    return record as T;
  }

  /**
   * Clean up all tracked test records
   */
  async cleanup() {
    try {
      // Delete data from each tracked table
      for (const [table, ids] of this.createdRecords.entries()) {
        if (ids.length === 0) continue;

        const { error } = await this.supabase
          .from(table)
          .delete()
          .in('id', ids);

        if (error) {
          console.error(`Error cleaning up test data from ${table}:`, error);
        }
      }

      // Clear the tracked records
      this.createdRecords.clear();
    } catch (error) {
      console.error('Error during test data cleanup:', error);
    }
  }
}