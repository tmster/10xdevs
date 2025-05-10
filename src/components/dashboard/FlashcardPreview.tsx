import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlashcardViewModel } from "@/types";

interface FlashcardPreviewProps {
  flashcard: FlashcardViewModel | null;
}

export function FlashcardPreview({ flashcard }: FlashcardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcard) {
    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">No flashcards yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Create your first flashcard to see it here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setIsFlipped(!isFlipped)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {isFlipped ? "That's the answer!" : "Click and test your knowledge!"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">{isFlipped ? flashcard.back : flashcard.front}</p>
      </CardContent>
    </Card>
  );
}
