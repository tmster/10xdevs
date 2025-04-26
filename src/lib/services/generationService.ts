import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateGenerationInput } from "../schemas/generation.schema";
import type { CreateGenerationResponse, GeneratedFlashcardDTO } from "../../types";
import { FlashcardGenerationService } from "./openrouter/flashcard.service";

export class GenerationService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly flashcardGenerator: FlashcardGenerationService
  ) {}

  async createGeneration(userId: string, input: CreateGenerationInput): Promise<CreateGenerationResponse> {
    const generationId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create initial generation record
    const { error: generationError } = await this.supabase.from("generations").insert({
      id: generationId,
      user_id: userId,
      created_at: now,
      updated_at: now,
      log: {
        text_length: input.text.length,
        requested_cards: input.options.max_cards,
        status: "pending",
      },
    });

    if (generationError) {
      console.error("Generation creation error:", generationError);
      await this.logError(generationId, "DB_INSERT_FAILED", generationError.message);
      throw new Error(`Failed to create generation record: ${generationError.message}`);
    }

    try {
      // Generate flashcards using AI
      const flashcards = await this.flashcardGenerator.generateFlashcards(
        input.text,
        input.options.max_cards
      );

      // Insert generated flashcards
      const { error: flashcardsError } = await this.supabase.from("flashcards").insert(
        flashcards.map((card) => ({
          ...card,
          user_id: userId,
          generation_id: generationId,
        }))
      );

      if (flashcardsError) {
        console.error("Flashcards creation error:", flashcardsError);
        await this.logError(generationId, "FLASHCARDS_INSERT_FAILED", flashcardsError.message);
        throw new Error("Failed to create flashcard records");
      }

      // Update generation status to completed
      await this.supabase
        .from("generations")
        .update({
          updated_at: new Date().toISOString(),
          log: {
            text_length: input.text.length,
            requested_cards: input.options.max_cards,
            status: "completed",
          },
        })
        .eq("id", generationId);

      return {
        generation_id: generationId,
        flashcards,
      };
    } catch (error) {
      console.error("Flashcard generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      await this.logError(generationId, "AI_GENERATION_FAILED", errorMessage);
      throw error;
    }
  }

  private async logError(generationId: string, code: string, message: string) {
    await this.supabase.from("generation_error_logs").insert({
      generation_id: generationId,
      error_code: code,
      error_message: message,
      status: "error",
    });
  }
}
