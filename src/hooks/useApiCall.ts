import { useState, useCallback } from "react";

interface ApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface ApiCallState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useApiCall<T>() {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>, options: ApiCallOptions<T> = {}) => {
    const { onSuccess, onError, retryCount = 3, retryDelay = 1000 } = options;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < retryCount) {
      try {
        const data = await apiCall();
        setState((prev) => ({ ...prev, data, isLoading: false, error: null }));
        onSuccess?.(data);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error occurred");
        attempts++;

        if (attempts === retryCount) {
          setState((prev) => ({ ...prev, error: lastError, isLoading: false }));
          onError?.(lastError);
          break;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempts));
      }
    }

    return null;
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
