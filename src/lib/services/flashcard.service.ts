import type { SupabaseClient } from "../../db/supabase.client";
import type { UpdateFlashcardCommand, FlashcardDTO } from "../../types";

/**
 * Service for flashcard management operations
 */
export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Update an existing flashcard
   * @param id - Flashcard UUID
   * @param data - Data to update (front, back, status)
   * @param userId - Current user ID
   * @returns Updated flashcard data or null if not found
   */
  async update(id: string, data: UpdateFlashcardCommand, userId: string): Promise<FlashcardDTO | null> {
    // First check if the flashcard exists and belongs to the user
    const { data: flashcard, error: fetchError } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !flashcard) {
      return null;
    }

    // Prepare update data with timestamp
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Update the flashcard
    const { data: updatedFlashcard, error: updateError } = await this.supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, front, back, status, source, created_at, updated_at")
      .single();

    if (updateError || !updatedFlashcard) {
      return null;
    }

    return updatedFlashcard as FlashcardDTO;
  }

  /**
   * Delete a flashcard
   * @param id - Flashcard UUID
   * @param userId - Current user ID
   * @returns True if deletion was successful, false otherwise
   */
  async delete(id: string, userId: string): Promise<boolean> {
    // First check if the flashcard exists and belongs to the user
    const { data: flashcard, error: fetchError } = await this.supabase
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !flashcard) {
      return false;
    }

    // Delete the flashcard
    const { error: deleteError } = await this.supabase.from("flashcards").delete().eq("id", id).eq("user_id", userId);

    return !deleteError;
  }
}
