export class OpenRouterError extends Error {
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

export const handleError = (error: unknown): never => {
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
};