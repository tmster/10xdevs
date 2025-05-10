# API Endpoint Implementation Plan: Batch Process Generated Flashcards

## 1. Przegląd punktu końcowego
Endpoint umożliwia zbiorcze przetwarzanie wygenerowanych przez AI fiszek. Użytkownik może zaakceptować, odrzucić lub edytować wiele fiszek jednocześnie.

- Metoda HTTP: POST
- Ścieżka: `/api/flashcards/batch`
- Autoryzacja: wymaga uwierzytelnionego użytkownika przez Supabase Auth

## 2. Szczegóły żądania
- Request Body (JSON):
  ```json
  {
    "generation_id": "uuid",
    "flashcards": [
      {
        "id": "uuid",
        "action": "accept"|"reject"|"edit",
        // pola wymagane tylko gdy action == "edit":
        "front": "string",
        "back": "string"
      }
    ]
  }
  ```
- Parametry:
  - Wymagane:
    - `generation_id` (string, UUID)
    - `flashcards` (non-empty array):
      - `id` (string, UUID)
      - `action` (enum: `accept`, `reject`, `edit`)
      - `front`, `back` (string) — wymagane tylko dla akcji `edit`
  - Opcjonalne: brak

## 3. Wykorzystywane typy
- `BatchProcessFlashcardsCommand` (typ komendy): zawiera `generation_id` i tablicę `BatchFlashcardAction`
- `BatchFlashcardAction` (union):
  - `{ id: string; action: "accept" | "reject" }`
  - `{ id: string; action: "edit"; front: string; back: string }`
- `ProcessedFlashcardItemDTO`: wynik pojedynczej operacji (id, status, source)
- `BatchProcessFlashcardsResponse`: całościowa odpowiedź (success, processed, failed, flashcards)

## 4. Szczegóły odpowiedzi
- Status 200 OK:
  ```json
  {
    "success": true,
    "processed": number,
    "failed": number,
    "flashcards": [
      { "id": "uuid", "status": "accepted"|"rejected", "source": "ai-full"|"ai-edited" }
    ]
  }
  ```
- Kody błędów:
  - 400 Bad Request: niepoprawny JSON lub walidacja danych wejściowych
  - 401 Unauthorized: brak lub nieważny token JWT
  - 404 Not Found: nieznaleziony `generation_id` lub któraś z fiszek nie należy do tej generacji/użytkownika
  - 500 Internal Server Error: nieoczekiwany błąd serwera

## 5. Przepływ danych
1. Parsowanie i walidacja wejścia za pomocą Zod:
   - `generation_id`: `string().uuid()`
   - `flashcards`: `array().min(1)`
   - `action`: `enum(["accept","reject","edit"])`
   - dla `edit` wymaga `front: string().max(200)`, `back: string().max(500)`
2. Pobranie z kontekstu Supabase (`context.locals.supabase`) uwierzytelnionego użytkownika i RLS.
3. Weryfikacja istnienia rekordu generacji i przynależności do użytkownika.
4. W pętli lub w jednym zapytaniu wsadowym wykonanie operacji na tabeli `flashcards`:
   - `accept`: `UPDATE flashcards SET status='accepted'`
   - `reject`: `UPDATE flashcards SET status='rejected'`
   - `edit`: `UPDATE flashcards SET front=?, back=?, status='accepted', source='ai-edited'`
5. Zliczenie udanych i nieudanych operacji.
6. Zwrócenie odpowiedzi JSON z podsumowaniem.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: wywołanie chronione middleware Supabase Auth, weryfikacja JWT.
- Autoryzacja: RLS w Supabase zapewnia, że użytkownik może modyfikować tylko swoje fiszki/generacje.
- Walidacja wejścia na serwerze: Zod w Astro API route.
- Brak bezpośredniego dostępu do SQL — używanie klienta Supabase z kontekstu.

## 7. Obsługa błędów
- **400 Bad Request**: Zod rzuca błędy walidacji — przechwycić i zwrócić szczegółowe komunikaty.
- **401 Unauthorized**: brak `session` lub nieważny JWT — zwrócić odpowiedź bez wejścia w logikę.
- **404 Not Found**: jeśli `generation_id` nie istnieje lub nie należy do użytkownika, albo któryś `id` fiszki nie istnieje w tej generacji — zwrócić 404.
- **500 Internal Server Error**: nieprzewidziane wyjątki — logowanie błędu (np. Sentry lub console.error) i zwrócenie ogólnego komunikatu.

## 8. Rozważania dotyczące wydajności
- Aktualizacje wsadowe zamiast pojedynczych zapytań: `supabase.from('flashcards').update(...).in('id', [...])`.
- Indeks na kolumnie `generation_id` zapewnia szybkość filtrowania.
- Ograniczenie rozmiaru tablicy (np. max 50 elementów) może chronić przed przeciążeniem.

## 9. Kroki implementacji
1. Utworzyć plik `src/pages/api/flashcards/batch.ts`.
2. Zadeklarować i wyeksportować `export const prerender = false` oraz `export const POST`.
3. Zaimplementować Zod schema dla `BatchProcessFlashcardsCommand`.
4. Wyciągnąć logikę do serwisu (`src/lib/services/flashcards.ts`): funkcja `batchProcessFlashcards(command, userId)`.
5. W routingu API pobrać `supabase` z `context.locals`, wywołać serwis, obsłużyć odpowiedź i wyjątki.
6. Dodać testy jednostkowe w Vitest dla serwisu (mock MSW dla Supabase).
7. Napisać testy integracyjne/end-to-end w Playwright symulujące różne scenariusze.
8. Uaktualnić dokumentację API i dodać wpis w swagger/openapi (jeśli używane).
9. Code review i merge do głównej gałęzi.
10. Monitorowanie i ew. optymalizacja po wdrożeniu.