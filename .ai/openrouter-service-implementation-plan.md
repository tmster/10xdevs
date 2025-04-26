# OpenRouter Service Implementation Guide

## 1. Service Overview

The OpenRouter service will act as a bridge between our application and the OpenRouter.ai API, providing a clean interface for making LLM requests. The service will handle:
- Model selection and configuration
- Request formatting and validation
- Response parsing and error handling
- Rate limiting and retry logic
- Type safety throughout the integration

## 2. Service Constructor

```typescript
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://openrouter.ai/api/v1';
  private readonly defaultModel: string;
  private readonly defaultSystemMessage: string;

  constructor(config: {
    apiKey: string;
    defaultModel?: string;
    defaultSystemMessage?: string;
  }) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || 'anthropic/claude-3-sonnet';
    this.defaultSystemMessage = config.defaultSystemMessage || 'You are a helpful AI assistant.';
  }
}
```

## 3. Public Methods and Fields

### 3.1 Chat Completion Method

```typescript
public async createChatCompletion({
  messages,
  model = this.defaultModel,
  systemMessage = this.defaultSystemMessage,
  responseFormat,
  temperature = 0.7,
  maxTokens,
}: {
  messages: ChatMessage[];
  model?: string;
  systemMessage?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  maxTokens?: number;
}): Promise<ChatCompletionResponse> {
  // Implementation details in section 7
}
```

### 3.2 Types and Interfaces

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ResponseFormat {
  type: 'json_schema';
  schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

interface ChatCompletionResponse {
  id: string;
  model: string;
  created: number;
  response: string | Record<string, unknown>;
  done: boolean;
}
```

## 4. Private Methods and Fields

### 4.1 Request Formatting

```typescript
private formatRequest({
  messages,
  systemMessage,
  responseFormat,
  temperature,
  maxTokens,
}: ChatCompletionParams): RequestBody {
  return {
    messages: [
      { role: 'system', content: systemMessage },
      ...messages
    ],
    response_format: responseFormat,
    temperature,
    max_tokens: maxTokens,
  };
}
```

### 4.2 Response Parsing

```typescript
private parseResponse(rawResponse: unknown): ChatCompletionResponse {
  // Implementation details in section 7
}
```

### 4.3 Error Handling

```typescript
private handleError(error: unknown): never {
  // Implementation details in section 5
}
```

## 5. Error Handling

The service will handle the following error scenarios:

1. Network Errors
   - Connection timeouts
   - DNS failures
   - SSL/TLS errors

2. API Errors
   - Rate limiting (429)
   - Authentication errors (401)
   - Invalid requests (400)
   - Server errors (500)

3. Response Format Errors
   - Invalid JSON
   - Schema validation failures
   - Unexpected response structure

Error handling implementation:

```typescript
class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

private handleError(error: unknown): never {
  if (error instanceof Response) {
    throw new OpenRouterError(
      'API request failed',
      'API_ERROR',
      error.status
    );
  }

  if (error instanceof Error) {
    throw new OpenRouterError(
      error.message,
      'INTERNAL_ERROR'
    );
  }

  throw new OpenRouterError(
    'Unknown error occurred',
    'UNKNOWN_ERROR'
  );
}
```

## 6. Security Considerations

1. API Key Management
   - Store API key in environment variables
   - Never expose API key in client-side code
   - Implement key rotation mechanism

2. Request/Response Validation
   - Validate all inputs before sending to API
   - Sanitize responses before processing
   - Implement request signing if required

3. Rate Limiting
   - Implement client-side rate limiting
   - Track API usage and costs
   - Set up alerts for unusual usage patterns

## 7. Implementation Steps

1. Create Service Files
   ```bash
   mkdir -p src/lib/services/openrouter
   touch src/lib/services/openrouter/index.ts
   touch src/lib/services/openrouter/types.ts
   touch src/lib/services/openrouter/errors.ts
   ```

2. Implement Core Service
   ```typescript
   // src/lib/services/openrouter/index.ts

   export class OpenRouterService {
     constructor(config: OpenRouterConfig) {
       // Initialize service
     }

     public async createChatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
       try {
         const response = await fetch(`${this.baseUrl}/chat/completions`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${this.apiKey}`,
             'HTTP-Referer': window.location.origin,
           },
           body: JSON.stringify(this.formatRequest(params)),
         });

         if (!response.ok) {
           throw response;
         }

         const data = await response.json();
         return this.parseResponse(data);
       } catch (error) {
         this.handleError(error);
       }
     }
   }
   ```

3. Implement Types
   ```typescript
   // src/lib/services/openrouter/types.ts

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
   ```

4. Implement Error Handling
   ```typescript
   // src/lib/services/openrouter/errors.ts

   export class OpenRouterError extends Error {
     constructor(message: string, code: string, status?: number, details?: Record<string, unknown>) {
       super(message);
       this.name = 'OpenRouterError';
       this.code = code;
       this.status = status;
       this.details = details;
     }
   }
   ```

5. Environment Setup
   ```typescript
   // src/env.d.ts

   interface ImportMetaEnv {
     readonly OPENROUTER_API_KEY: string;
     // ... existing env vars
   }
   ```

6. Service Integration
   ```typescript
   // src/lib/services/index.ts

   export { OpenRouterService } from './openrouter';
   ```

7. Usage Example
   ```typescript
   const openRouter = new OpenRouterService({
     apiKey: import.meta.env.OPENROUTER_API_KEY,
     defaultModel: 'anthropic/claude-3-sonnet',
     defaultSystemMessage: 'You are a helpful AI assistant.',
   });

   const response = await openRouter.createChatCompletion({
     messages: [
       { role: 'user', content: 'Hello, how are you?' }
     ],
     responseFormat: {
       type: 'json_schema',
       schema: {
         name: 'greeting',
         strict: true,
         schema: {
           type: 'object',
           properties: {
             greeting: { type: 'string' },
             mood: { type: 'string' },
           },
           required: ['greeting', 'mood'],
         },
       },
     },
   });
   ```

## 8. Testing Strategy

1. Unit Tests
   - Test request formatting
   - Test response parsing
   - Test error handling
   - Test input validation

2. Integration Tests
   - Test API connectivity
   - Test rate limiting
   - Test retry logic
   - Test error scenarios

3. End-to-End Tests
   - Test complete chat flows
   - Test response format handling
   - Test system message integration
   - Test model selection

## 9. Monitoring and Logging

1. Request Logging
   - Log all API requests (excluding sensitive data)
   - Track response times
   - Monitor error rates

2. Usage Metrics
   - Track token usage
   - Monitor costs
   - Track model usage

3. Error Tracking
   - Log detailed error information
   - Track error patterns
   - Set up error alerts

## 10. Future Improvements

1. Streaming Support
   - Implement SSE handling
   - Add progress callbacks
   - Support partial response processing

2. Caching Layer
   - Implement response caching
   - Add cache invalidation
   - Support cache warming

3. Advanced Features
   - Function calling
   - Tool use
   - Multi-model routing