import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlashcardViewModel } from "@/types";

interface PendingFlashcardsProps {
  count: number;
  items: FlashcardViewModel[];
}

export function PendingFlashcards({ count, items }: PendingFlashcardsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Pending Flashcards</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href="/flashcards/list?status=pending">View All</a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">You have {count} flashcards waiting for review</p>
          {items.slice(0, 3).map((flashcard) => (
            <div
              key={flashcard.id}
              className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <p className="font-medium">{flashcard.front}</p>
              <p className="text-sm text-muted-foreground mt-1">{flashcard.back}</p>
            </div>
          ))}
          {count > 3 && <p className="text-sm text-muted-foreground text-center">+{count - 3} more flashcards</p>}
        </div>
      </CardContent>
    </Card>
  );
}
