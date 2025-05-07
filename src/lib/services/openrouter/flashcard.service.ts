import { OpenRouterService } from "./index";
import { flashcardGenerationSchema } from "./flashcard.schema";
import type { GeneratedFlashcardDTO } from "../../../types";
import { OpenRouterError } from "./errors";

export class FlashcardGenerationService {
  constructor(private readonly openRouter: OpenRouterService) {}

  async generateFlashcards(text: string, maxCards: number): Promise<GeneratedFlashcardDTO[]> {
    const systemMessage = `You are a helpful AI assistant that creates high-quality flashcards from provided text.
Your task is to create ${maxCards} flashcards that cover the most important concepts from the text.
Each flashcard should have a clear question or concept on the front and a concise but comprehensive answer on the back.
Focus on key concepts, definitions, and relationships. Avoid trivial or redundant information.
Make sure each flashcard is self-contained and meaningful on its own.
IMPORTANT: You must return exactly ${maxCards} flashcards, no more and no less.
IMPORTANT: Your response must be a valid JSON object with a 'flashcards' array containing exactly ${maxCards} flashcard objects. Queston is stored under front key, answer under back`;

    try {
      const response = await this.openRouter.createChatCompletion({
        messages: [
          {
            role: "user",
            content: `Please create ${maxCards} flashcards from the following text. Format your response as a JSON object with a 'flashcards' array:\n\n${text}`,
          },
        ],
        systemMessage,
        responseFormat: flashcardGenerationSchema,
        temperature: 0.7,
      });

      console.log("OpenRouter response:", response);

      let parsedResponse;
      if (typeof response.response === "string") {
        try {
          console.log("Parsing response as JSON:", response.response);

          parsedResponse = JSON.parse(response.response);
        } catch (e) {
          console.error("Failed to parse response as JSON:", response.response.response);
          throw new OpenRouterError("Invalid response: response is not a valid JSON", "INVALID_RESPONSE");
        }
      } else {
        parsedResponse = response.response;
      }

      console.log("Parsed response:", parsedResponse);

      if (!parsedResponse || typeof parsedResponse !== "object") {
        throw new OpenRouterError("Invalid response: response must be an object", "INVALID_RESPONSE");
      }

      const { flashcards } = parsedResponse;

      if (!Array.isArray(flashcards)) {
        console.error("Invalid flashcards format:", parsedResponse);
        throw new OpenRouterError("Invalid response: flashcards must be an array", "INVALID_RESPONSE");
      }

      if (flashcards.length !== maxCards) {
        throw new OpenRouterError(
          `Invalid response: expected ${maxCards} flashcards but got ${flashcards.length}`,
          "INVALID_RESPONSE"
        );
      }

      const now = new Date().toISOString();
      return flashcards.map((card, index) => {
        if (!card.front || !card.back || typeof card.front !== "string" || typeof card.back !== "string") {
          console.error(`Invalid flashcard at index ${index}:`, card);
          throw new OpenRouterError(
            "Invalid response: each flashcard must have front and back content as strings",
            "INVALID_RESPONSE"
          );
        }

        return {
          id: crypto.randomUUID(),
          front: card.front.trim(),
          back: card.back.trim(),
          status: "pending" as const,
          source: "ai-full" as const,
          created_at: now,
          updated_at: now,
        };
      });
    } catch (error) {
      console.error("Flashcard generation error:", error);
      throw error;
    }
  }
}
