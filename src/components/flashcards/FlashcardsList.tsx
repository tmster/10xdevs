import type { FlashcardViewModel } from "@/types";
import { FlashcardItem } from "./FlashcardItem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface FlashcardsListProps {
  flashcards: FlashcardViewModel[];
  onFlashcardUpdate: (id: string, updates: Partial<FlashcardViewModel>) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function FlashcardsList({
  flashcards,
  onFlashcardUpdate,
  isLoading = false,
  error = null
}: FlashcardsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No flashcards generated yet. Start by entering some text above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Generated Flashcards</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {flashcards.map((flashcard) => (
          <FlashcardItem
            key={flashcard.id}
            flashcard={flashcard}
            onUpdate={(updates) => onFlashcardUpdate(flashcard.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}
