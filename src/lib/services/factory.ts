import type { SupabaseClient } from "../../db/supabase.client";
import { GenerationService } from "./generationService";
import { OpenRouterService } from "./openrouter";
import { FlashcardGenerationService } from "./openrouter/flashcard.service";

export class ServiceFactory {
  private static instance: ServiceFactory | null = null;
  private readonly openRouter: OpenRouterService;
  private readonly flashcardGenerator: FlashcardGenerationService;

  private constructor() {
    this.openRouter = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      defaultModel: 'openai/gpt-4o-mini',
      defaultSystemMessage: 'You are a helpful AI assistant that creates high-quality flashcards.'
    });

    this.flashcardGenerator = new FlashcardGenerationService(this.openRouter);
  }

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  createGenerationService(supabase: SupabaseClient): GenerationService {
    return new GenerationService(supabase, this.flashcardGenerator);
  }
}