import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { FlashcardDTO } from "../../types";

export interface GetFlashcardsOptions {
  limit: number;
  offset: number;
  status?: "accepted" | "rejected";
  source?: "ai-full" | "ai-edited" | "manual";
  sort: "created_at" | "updated_at";
  order: "asc" | "desc";
}

export interface GetFlashcardsResult {
  data: FlashcardDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export class FlashcardService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getFlashcards(userId: string, options: GetFlashcardsOptions): Promise<GetFlashcardsResult> {
    const query = this.supabase.from("flashcards").select("*", { count: "exact" }).eq("user_id", userId);

    if (options.status) {
      query.eq("status", options.status);
    }
    if (options.source) {
      query.eq("source", options.source);
    }

    query
      .order(options.sort, { ascending: options.order === "asc" })
      .range(options.offset, options.offset + options.limit - 1);

    const { data: flashcards, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      data: flashcards as FlashcardDTO[],
      pagination: {
        total: count ?? 0,
        limit: options.limit,
        offset: options.offset,
      },
    };
  }
}
