// Mock komponentu GenerationForm
import React, { useState, useEffect } from "react";
import type { CreateGenerationResponse } from "@/types";

interface GenerationFormProps {
  onSubmit: (text: string, maxCards: number) => Promise<CreateGenerationResponse | null>;
  isLoading: boolean;
}

export function GenerationForm({ onSubmit, isLoading }: GenerationFormProps) {
  const [text, setText] = useState("");
  const [maxCards, setMaxCards] = useState(5);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Character count progress
  const minChars = 1000;
  const maxChars = 10000;
  const isValidLength = text.length >= minChars && text.length <= maxChars;

  useEffect(() => {
    if (text.length > 0) {
      if (text.length < minChars) {
        setValidationError(`Please enter at least ${minChars} characters (${minChars - text.length} more needed)`);
      } else if (text.length > maxChars) {
        setValidationError(
          `Text is too long. Maximum ${maxChars} characters allowed (${text.length - maxChars} over limit)`
        );
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
      setText("");
      setMaxCards(5);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Generate flashcards form">
      <div className="space-y-2">
        <label htmlFor="text" className="text-base">
          Text for Flashcard Generation
          <span className="text-sm text-gray-500 ml-2">
            ({text.length}/{minChars} characters minimum)
          </span>
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text here..."
          className="min-h-[200px]"
          disabled={isLoading}
          aria-invalid={validationError ? "true" : "false"}
          aria-describedby={validationError ? "text-error" : "text-hint"}
        />
        <div
          className="h-1"
          aria-label="Text length progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min((text.length / minChars) * 100, 100)}
        />
        {validationError ? (
          <div role="alert" id="text-error">
            <div>{validationError}</div>
          </div>
        ) : (
          <p id="text-hint" className="text-sm text-gray-500">
            Enter text between {minChars} and {maxChars} characters to generate flashcards.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="maxCards" className="text-base">
          Maximum Number of Flashcards
        </label>
        <input
          id="maxCards"
          type="number"
          min={1}
          max={10}
          value={maxCards}
          onChange={(e) => setMaxCards(parseInt(e.target.value, 10))}
          disabled={isLoading}
          className="w-32"
          aria-describedby="maxCards-hint"
        />
        <p id="maxCards-hint" className="text-sm text-gray-500">
          Choose between 1 and 10 flashcards to generate.
        </p>
      </div>

      <button type="submit" disabled={!isValidLength || isLoading} aria-busy={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm mr-2" aria-hidden="true" />
            Generating...
          </>
        ) : (
          "Generate Flashcards"
        )}
      </button>
    </form>
  );
}
