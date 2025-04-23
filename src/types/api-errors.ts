export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'AI_GENERATION_ERROR'
  | 'DB_ERROR'
  | 'RATE_LIMIT_ERROR';

export interface ApiErrorResponse {
  error: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationError extends ApiErrorResponse {
  error: 'VALIDATION_ERROR';
  details: {
    fields: Record<string, string[]>;
  };
}

export interface AIGenerationError extends ApiErrorResponse {
  error: 'AI_GENERATION_ERROR';
  details: {
    generation_id?: string;
    reason: string;
  };
}

export interface DatabaseError extends ApiErrorResponse {
  error: 'DB_ERROR';
  details: {
    code: string;
    table?: string;
  };
}

export type ApiError =
  | ValidationError
  | AIGenerationError
  | DatabaseError
  | ApiErrorResponse;