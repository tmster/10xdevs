import { toast } from "sonner";
import type { ApiError, ValidationError, AIGenerationError } from "@/types/api-errors";

export function useApiError() {
  const handleApiError = (error: unknown) => {
    let title = "Error";
    let description = "An unexpected error occurred. Please try again.";

    if (error instanceof Response) {
      // Handle fetch Response error
      title = `Error ${error.status}`;
      description = error.statusText;
    } else if (typeof error === "object" && error !== null) {
      const apiError = error as ApiError;

      switch (apiError.error) {
        case "VALIDATION_ERROR": {
          const validationError = apiError as ValidationError;
          title = "Validation Error";
          if (validationError.details?.fields) {
            description = Object.entries(validationError.details.fields)
              .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
              .join("\n");
          }
          break;
        }

        case "AI_GENERATION_ERROR": {
          const aiError = apiError as AIGenerationError;
          title = "AI Generation Failed";
          description = aiError.details?.reason || apiError.message;
          break;
        }

        case "DB_ERROR":
          title = "Database Error";
          description = "Failed to save changes. Please try again.";
          break;

        case "UNAUTHORIZED":
          title = "Authentication Required";
          description = "Please sign in to continue.";
          break;

        default:
          if (apiError.message) {
            description = apiError.message;
          }
      }
    } else if (error instanceof Error) {
      description = error.message;
    }

    // Display error toast with title and description
    toast(title, {
      description,
      duration: 5000,
    });

    // Log error for debugging
    console.error("API Error:", error);
  };

  return { handleApiError };
}
