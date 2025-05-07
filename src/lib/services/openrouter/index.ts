import type {
  OpenRouterConfig,
  ChatCompletionParams,
  ChatCompletionResponse,
  RequestBody,
  OpenRouterAPIResponse,
  ChatMessage,
  ResponseFormat,
} from "./types";
import { handleError, OpenRouterError } from "./errors";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1";
  private readonly defaultModel: string;
  private readonly defaultSystemMessage: string;
  private readonly maxRetries: number = 3;
  private readonly initialRetryDelay: number = 1000; // 1 second

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || "openai/gpt-4o-mini";
    this.defaultSystemMessage = config.defaultSystemMessage || "You are a helpful AI assistant.";
  }

  private validateMessages(messages: ChatMessage[]): void {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new OpenRouterError("Invalid request: messages must be a non-empty array", "INVALID_REQUEST");
    }

    for (const message of messages) {
      if (!message.role || !["user", "assistant"].includes(message.role)) {
        throw new OpenRouterError(
          "Invalid request: each message must have a valid role (user or assistant)",
          "INVALID_REQUEST"
        );
      }

      if (!message.content || typeof message.content !== "string" || message.content.trim().length === 0) {
        throw new OpenRouterError("Invalid request: each message must have non-empty content", "INVALID_REQUEST");
      }
    }
  }

  private validateResponseFormat(format: ResponseFormat | undefined): void {
    if (!format) return;

    if (format.type !== "json_object") {
      throw new OpenRouterError("Invalid request: response format type must be json_object", "INVALID_REQUEST");
    }

    if (!format.json_schema || typeof format.json_schema !== "object") {
      throw new OpenRouterError("Invalid request: response format must have a json_schema object", "INVALID_REQUEST");
    }

    if (format.json_schema.type !== "object") {
      throw new OpenRouterError("Invalid request: json_schema type must be object", "INVALID_REQUEST");
    }

    if (!format.json_schema.properties || typeof format.json_schema.properties !== "object") {
      throw new OpenRouterError("Invalid request: json_schema must have properties object", "INVALID_REQUEST");
    }
  }

  private validateParameters(params: ChatCompletionParams): void {
    this.validateMessages(params.messages);
    this.validateResponseFormat(params.responseFormat);

    if (
      params.temperature !== undefined &&
      (typeof params.temperature !== "number" || params.temperature < 0 || params.temperature > 2)
    ) {
      throw new OpenRouterError("Invalid request: temperature must be a number between 0 and 2", "INVALID_REQUEST");
    }

    if (params.maxTokens !== undefined && (typeof params.maxTokens !== "number" || params.maxTokens < 1)) {
      throw new OpenRouterError("Invalid request: maxTokens must be a positive number", "INVALID_REQUEST");
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.maxRetries) return false;

    if (error instanceof Response) {
      // Retry on rate limits and server errors
      return error.status === 429 || (error.status >= 500 && error.status < 600);
    }

    // Retry on network errors
    if (error instanceof Error) {
      return error.name === "TypeError" || error.message.includes("network");
    }

    return false;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.shouldRetry(error, attempt)) {
        const delay = this.initialRetryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.executeWithRetry(operation, attempt + 1);
      }
      throw error;
    }
  }

  private formatRequest(params: ChatCompletionParams): RequestBody {
    this.validateParameters(params);

    return {
      messages: [{ role: "system", content: params.systemMessage || this.defaultSystemMessage }, ...params.messages],
      response_format: params.responseFormat
        ? {
            type: "json_object",
            json_schema: params.responseFormat.json_schema,
          }
        : undefined,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
    };
  }

  public async createChatCompletion({
    messages,
    model = this.defaultModel,
    systemMessage = this.defaultSystemMessage,
    responseFormat,
    temperature = 0.7,
    maxTokens,
  }: ChatCompletionParams): Promise<ChatCompletionResponse> {
    try {
      return await this.executeWithRetry(async () => {
        console.log("Sending request to OpenRouter with format:", responseFormat);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://github.com/tomaszszkaradek/10xdevs",
            "X-Title": "10xDevs Flashcard Generator",
            "OpenRouter-Model": model,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "system", content: systemMessage }, ...messages],
            response_format: { type: "json_object" },
            temperature,
            max_tokens: maxTokens,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("OpenRouter API error:", errorData);
          throw new OpenRouterError(
            `API request failed: ${response.statusText}`,
            "API_ERROR",
            response.status,
            errorData || undefined
          );
        }

        const data = await response.json();
        console.log("Raw OpenRouter response:", data);
        return this.parseResponse(data);
      });
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      if (error instanceof OpenRouterError) {
        throw error;
      }
      return handleError(error);
    }
  }

  private parseResponse(rawResponse: unknown): ChatCompletionResponse {
    if (!rawResponse || typeof rawResponse !== "object") {
      throw new OpenRouterError("Invalid response format: Response must be an object", "INVALID_RESPONSE");
    }

    const response = rawResponse as any;
    console.log("Parsing OpenRouter response:", response);

    // OpenRouter wraps the response in a choices array
    const messageContent = response.choices?.[0]?.message?.content;
    if (!messageContent) {
      console.error("Invalid OpenRouter response structure:", response);
      throw new OpenRouterError(
        "Invalid response format: Missing content in response",
        "INVALID_RESPONSE",
        undefined,
        response
      );
    }

    // If we have a JSON schema response format, try to parse the content if it's a string
    if (typeof messageContent === "string") {
      try {
        // First check if the content is already a stringified JSON
        if (messageContent.trim().startsWith("{") || messageContent.trim().startsWith("[")) {
          try {
            const parsed = JSON.parse(messageContent);
            return {
              id: response.id || crypto.randomUUID(),
              model: response.model || this.defaultModel,
              created: response.created || Date.now(),
              response: parsed,
              done: true,
            };
          } catch (e: unknown) {
            // If JSON parsing fails, return the raw string content
            console.warn("Content appears to be JSON but failed to parse, returning as string:", messageContent);
            return {
              id: response.id || crypto.randomUUID(),
              model: response.model || this.defaultModel,
              created: response.created || Date.now(),
              response: messageContent,
              done: true,
            };
          }
        }

        // If content doesn't look like JSON, return it as is
        return {
          id: response.id || crypto.randomUUID(),
          model: response.model || this.defaultModel,
          created: response.created || Date.now(),
          response: messageContent,
          done: true,
        };
      } catch (e: unknown) {
        console.error("Failed to process message content:", messageContent);
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        throw new OpenRouterError("Failed to process response content", "INVALID_RESPONSE", undefined, {
          content: messageContent,
          error: errorMessage,
        });
      }
    }

    // If messageContent is not a string (e.g. already an object), return it directly
    return {
      id: response.id || crypto.randomUUID(),
      model: response.model || this.defaultModel,
      created: response.created || Date.now(),
      response: messageContent,
      done: true,
    };
  }
}
