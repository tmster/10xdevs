import { useState } from "react";
import type { FlashcardViewModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useApiCall } from "@/hooks/useApiCall";

interface BulkSaveButtonProps {
  generationId: string;
  flashcards: FlashcardViewModel[];
  onSuccess: () => void;
  onError: () => void;
}

export function BulkSaveButton({ generationId, flashcards, onSuccess, onError }: BulkSaveButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const { isLoading, execute } = useApiCall<void>();

  const handleSave = async () => {
    if (flashcards.length === 0) {
      setError("No flashcards selected");
      return;
    }

    const acceptedFlashcards = flashcards.filter((f) => f.status === "accepted");

    if (acceptedFlashcards.length === 0) {
      setError("No accepted flashcards to save");
      return;
    }

    try {
      await execute(
        async () => {
          const response = await fetch("/api/flashcards/bulk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              generation_id: generationId,
              flashcards: acceptedFlashcards.map((f) => ({
                id: f.id,
                front: f.front,
                back: f.back,
              })),
            }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.message || "Failed to save flashcards");
          }
        },
        {
          onSuccess,
          onError,
        }
      );
    } catch (err) {
      console.error("Failed to save flashcards:", err);
      setError("Failed to save flashcards");
    }
  };

  const acceptedCount = flashcards.filter((f) => f.status === "accepted").length;

  return (
    <div className="space-y-4" data-testid="bulk-save-container">
      {error && (
        <Alert variant="destructive" className="mb-4" data-testid="bulk-save-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-2" data-testid="save-progress-container">
          <Progress value={75} className="w-full" data-testid="save-progress" />
          <p className="text-sm text-muted-foreground">Saving flashcards... This may take a moment.</p>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={acceptedCount === 0 || isLoading}
        className="w-full md:w-auto"
        data-testid="bulk-save-button"
      >
        {isLoading ? "Saving..." : `Save Selected Flashcards (${acceptedCount})`}
      </Button>
    </div>
  );
}
