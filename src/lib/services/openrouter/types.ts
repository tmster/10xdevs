export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ResponseFormat {
  type: "json_object";
  schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  created: number;
  response: string | Record<string, unknown>;
  done: boolean;
}

export interface OpenRouterConfig {
  apiKey: string;
  defaultModel?: string;
  defaultSystemMessage?: string;
}

export interface ChatCompletionParams {
  messages: ChatMessage[];
  model?: string;
  systemMessage?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  maxTokens?: number;
}

export interface RequestBody {
  messages: ChatMessage[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterAPIResponse {
  id: string;
  model: string;
  created: number;
  choices: {
    message: {
      content: string | Record<string, unknown>;
    };
  }[];
}
