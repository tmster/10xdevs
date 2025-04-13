# API Endpoint Implementation Plan: Create Generation

## 1. Przegląd punktu końcowego
Endpoint służący do tworzenia nowej generacji, która inicjuje proces generowania fiszek przez AI. Użytkownik wysyła długi tekst (1000-10000 znaków) wraz z opcją określającą maksymalną liczbę fiszek do wygenerowania. Endpoint tworzy rekord w tabeli `generations` powiązany z użytkownikiem oraz zwraca wygenerowane fiszki w statusie "pending" i ze źródłem "ai-full".

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/generations`
- **Parametry:**
  - **Wymagane:**
    - `text`: string (1000-10000 znaków)
    - `options`: obiekt zawierający:
      - `max_cards`: number (maksymalna liczba fiszek do wygenerowania)
  - **Opcjonalne:** Brak
- **Przykładowe Body:**
  ```json
  {
    "text": "string",
    "options": {
      "max_cards": 10
    }
  }
  ```

## 3. Wykorzystywane typy
- `CreateGenerationCommand` – wejściowy model danych (zdefiniowany w `src/types.ts`)
- `CreateGenerationResponse` – model odpowiedzi (zdefiniowany w `src/types.ts`)
- `GeneratedFlashcardDTO` – reprezentacja pojedynczej fiszki w odpowiedzi

## 4. Szczegóły odpowiedzi
- **Kod sukcesu:** 201 Created
- **Struktura odpowiedzi:**
  ```json
  {
    "generation_id": "uuid",
    "flashcards": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "status": "pending",
        "source": "ai-full"
      }
    ]
  }
  ```
- **Możliwe kody błędów:**
  - 400 Bad Request: Niepoprawne dane wejściowe (np. tekst zbyt krótki/długi)
  - 401 Unauthorized: Użytkownik nie jest uwierzytelniony
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. **Autoryzacja:** Middleware weryfikuje autoryzację użytkownika, pobierając `user_id` z `context.locals` (Supabase).
2. **Walidacja:** Endpoint używa Zod do walidacji danych wejściowych – sprawdzana jest długość `text` oraz struktura obiektu `options`.
3. **Logika biznesowa:** Wyodrębniona do serwisu (np. `src/lib/services/generationService.ts`), który:
   - Tworzy rekord w tabeli `generations` z przypisanym `user_id` oraz inicjalnym logiem operacji.
   - Inicjuje proces generowania fiszek przez AI, tworząc obiekty typu `GeneratedFlashcardDTO` ze statusem "pending" i źródłem "ai-full".
4. **Odpowiedź:** W przypadku sukcesu, zwracana jest odpowiedź 201 z `generation_id` oraz listą fiszek.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie:** Endpoint dostępny tylko dla autoryzowanych użytkowników (sprawdzanych przez Supabase z `context.locals`).
- **Walidacja danych:** Wykorzystanie Zod do rygorystycznej weryfikacji danych wejściowych, w tym sprawdzenia długości tekstu.
- **Ograniczenia:** Parametr `max_cards` ogranicza liczbę tworzonych fiszek, zapobiegając nadużyciom.
- **Bezpieczne logowanie błędów:** Szczegóły błędów nie są ujawniane użytkownikowi; logowane są do tabeli `generation_error_logs`.

## 7. Obsługa błędów
- **400 Bad Request:** Zwrot gdy dane wejściowe nie spełniają kryteriów walidacji (np. tekst zbyt krótki lub zbyt długi).
- **401 Unauthorized:** Zwrot, gdy użytkownik nie jest autoryzowany.
- **500 Internal Server Error:** Zwrot w przypadku problemów operacyjnych, takich jak błędy bazy danych lub komunikacji z usługą AI. Błędy są logowane do tabeli `generation_error_logs`.

## 8. Rozważania dotyczące wydajności
- **Asynchroniczność:** Wykorzystanie asynchronicznych operacji dla zapisu do bazy danych oraz komunikacji z usługą AI, aby zminimalizować opóźnienia.
- **Optymalizacja bazy danych:** Użycie indeksów oraz triggerów (do automatycznej aktualizacji pól `updated_at` w tabelach `generations` i `generation_error_logs`).
- **Minimalizacja obciążenia:** Walidacja danych wejściowych wykonywana jak najwcześniej, aby ograniczyć niepotrzebne operacje.

## 9. Etapy wdrożenia
1. **Walidacja danych:**
   - Zdefiniowanie schematu walidacji przy użyciu Zod dla `CreateGenerationCommand`.
2. **Implementacja logiki biznesowej:**
   - Utworzenie serwisu w `src/lib/services/generationService.ts`, który:
     - Wstawia rekord do tabeli `generations` (używając `user_id` z autoryzacji).
     - Inicjuje proces generowania fiszek, ustawiając status "pending" i źródło "ai-full".
3. **Implementacja endpointa:**
   - Utworzenie pliku API w `src/pages/api/generations.ts`.
   - Integracja mechanizmu autoryzacji (middleware), walidacji danych oraz wywołania logiki biznesowej.
4. **Obsługa błędów:**
   - Implementacja mechanizmu logowania błędów do tabeli `generation_error_logs` oraz zwracanie odpowiednich kodów HTTP.
5. **Testowanie:**
   - Pisanie testów jednostkowych i integracyjnych dla endpointa.
6. **Code review i optymalizacja:**
   - Przegląd kodu przez zespół, optymalizacja zapytań do bazy oraz finalne testy wydajnościowe.
7. **Wdrożenie:**
   - Deployment na środowisko staging, testy końcowe, a następnie wdrożenie na produkcję.
