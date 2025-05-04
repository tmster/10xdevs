import { useState, useEffect } from 'react';
import type { CreateGenerationResponse } from '@/types';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useApiError } from "@/hooks/useApiError";

interface GenerationFormProps {
  onSubmit: (text: string, maxCards: number) => Promise<CreateGenerationResponse | null>;
  isLoading: boolean;
}

export function GenerationForm({ onSubmit, isLoading }: GenerationFormProps) {
  const [text, setText] = useState('');
  const [maxCards, setMaxCards] = useState(5);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { handleApiError } = useApiError();

  // Character count progress
  const minChars = 1000;
  const maxChars = 10000;
  const progress = Math.min((text.length / minChars) * 100, 100);
  const isValidLength = text.length >= minChars && text.length <= maxChars;

  useEffect(() => {
    if (text.length > 0) {
      if (text.length < minChars) {
        setValidationError(`Please enter at least ${minChars} characters (${minChars - text.length} more needed)`);
      } else if (text.length > maxChars) {
        setValidationError(`Text is too long. Maximum ${maxChars} characters allowed (${text.length - maxChars} over limit)`);
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLength) {
      return;
    }

    try {
      await onSubmit(text, maxCards);
      setText('');
      setMaxCards(5);
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Generate flashcards form" data-testid="generation-form">
      <div className="space-y-2">
        <Label htmlFor="text" className="text-base">
          Text for Flashcard Generation
          <span className="text-sm text-gray-500 ml-2">
            ({text.length}/{minChars} characters minimum)
          </span>
        </Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text here..."
          className="min-h-[200px]"
          disabled={isLoading}
          aria-invalid={validationError ? "true" : "false"}
          aria-describedby={validationError ? "text-error" : "text-hint"}
          data-testid="generation-text-input"
        />
        <Progress
          value={progress}
          className="h-1"
          aria-label="Text length progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          data-testid="text-progress"
        />
        {validationError ? (
          <Alert variant="destructive" id="text-error" role="alert" data-testid="text-validation-error">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        ) : (
          <p id="text-hint" className="text-sm text-gray-500">
            Enter text between {minChars} and {maxChars} characters to generate flashcards.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxCards" className="text-base">
          Maximum Number of Flashcards
        </Label>
        <Input
          id="maxCards"
          type="number"
          min={1}
          max={10}
          value={maxCards}
          onChange={(e) => setMaxCards(parseInt(e.target.value, 10))}
          disabled={isLoading}
          className="w-32"
          aria-describedby="maxCards-hint"
          data-testid="max-cards-input"
        />
        <p id="maxCards-hint" className="text-sm text-gray-500">
          Choose between 1 and 10 flashcards to generate.
        </p>
      </div>

      <Button
        type="submit"
        disabled={!isValidLength || isLoading}
        aria-busy={isLoading}
        className="w-full sm:w-auto"
        data-testid="generate-button"
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm mr-2" aria-hidden="true" />
            Generating...
          </>
        ) : (
          'Generate Flashcards'
        )}
      </Button>
    </form>
  );
}
