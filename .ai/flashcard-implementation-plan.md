# API Endpoint Implementation Plan: Flashcard Management

## 1. Przegląd punktu końcowego
Implementacja dwóch endpointów do zarządzania fiszkami:
- PATCH `/api/flashcards/:id` - aktualizacja istniejącej fiszki
- DELETE `/api/flashcards/:id` - usunięcie fiszki

## 2. Szczegóły żądania

### PATCH /api/flashcards/:id
- Metoda HTTP: PATCH
- Struktura URL: `/api/flashcards/:id`
- Parametry:
  - Wymagane: id (UUID)
- Request Body:
  ```typescript
  {
    front?: string;    // max 200 znaków
    back?: string;     // max 500 znaków
    status?: "accepted" | "rejected" | "pending";
  }
  ```

### DELETE /api/flashcards/:id
- Metoda HTTP: DELETE
- Struktura URL: `/api/flashcards/:id`
- Parametry:
  - Wymagane: id (UUID)

## 3. Wykorzystywane typy

### DTOs
```typescript
// Z types.ts
type FlashcardDTO = {
  id: string;
  front: string;
  back: string;
  status: "accepted" | "rejected" | "pending";
  source: "ai-full" | "ai-edited" | "manual";
  created_at: string;
  updated_at: string;
};

type UpdateFlashcardCommand = {
  front?: string;
  back?: string;
  status?: "accepted" | "rejected" | "pending";
};
```

## 4. Szczegóły odpowiedzi

### PATCH Response
- Status: 200 OK
- Body: FlashcardDTO
- Errors:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Brak autoryzacji
  - 404: Fiszka nie znaleziona
  - 500: Błąd serwera

### DELETE Response
- Status: 204 No Content
- Errors:
  - 401: Brak autoryzacji
  - 404: Fiszka nie znaleziona
  - 500: Błąd serwera

## 5. Przepływ danych

1. Walidacja żądania:
   - Sprawdzenie autoryzacji użytkownika
   - Walidacja UUID
   - Walidacja danych wejściowych (PATCH)

2. Operacje bazodanowe:
   - Pobranie fiszki z bazy danych
   - Sprawdzenie uprawnień użytkownika
   - Aktualizacja/usunięcie fiszki
   - Aktualizacja timestampów

3. Przygotowanie odpowiedzi:
   - Mapowanie danych do DTO
   - Obsługa błędów

## 6. Względy bezpieczeństwa

1. Autoryzacja:
   - Wymagane uwierzytelnienie przez Supabase Auth
   - Sprawdzenie czy użytkownik jest właścicielem fiszki

2. Walidacja danych:
   - Walidacja UUID
   - Walidacja długości pól
   - Walidacja wartości statusu
   - Sanityzacja danych wejściowych

3. RLS Policies:
   - Użytkownik może modyfikować tylko swoje fiszki
   - Zabezpieczenie przed SQL injection

## 7. Obsługa błędów

1. Walidacja wejścia:
   - Nieprawidłowy format UUID
   - Przekroczenie limitów długości
   - Nieprawidłowe wartości statusu

2. Błędy autoryzacji:
   - Brak tokenu
   - Nieprawidłowy token
   - Brak uprawnień

3. Błędy bazodanowe:
   - Fiszka nie istnieje
   - Naruszenie ograniczeń bazy danych
   - Błędy połączenia

## 8. Rozważania dotyczące wydajności

1. Optymalizacje:
   - Indeksowanie kolumny id
   - Efektywne zapytania SQL
   - Minimalizacja liczby zapytań

2. Monitoring:
   - Logowanie czasu odpowiedzi
   - Śledzenie błędów
   - Metryki użycia

## 9. Etapy wdrożenia

1. Przygotowanie środowiska:
   ```bash
   # Utworzenie pliku endpointu
   touch src/pages/api/flashcards/[id].ts
   ```

2. Implementacja walidacji:
   ```typescript
   // src/lib/validations/flashcard.ts
   import { z } from "zod";

   export const updateFlashcardSchema = z.object({
     front: z.string().max(200).optional(),
     back: z.string().max(500).optional(),
     status: z.enum(["accepted", "rejected", "pending"]).optional(),
   });
   ```

3. Implementacja serwisu:
   ```typescript
   // src/lib/services/flashcard.service.ts
   export class FlashcardService {
     async update(id: string, data: UpdateFlashcardCommand) {
       // Implementacja logiki aktualizacji
     }

     async delete(id: string) {
       // Implementacja logiki usuwania
     }
   }
   ```

4. Implementacja endpointów:
   ```typescript
   // src/pages/api/flashcards/[id].ts
   export const prerender = false;

   export async function PATCH({ params, request, locals }) {
     // Implementacja endpointu PATCH
   }

   export async function DELETE({ params, locals }) {
     // Implementacja endpointu DELETE
   }
   ```

5. Testy:
   - Testy jednostkowe dla serwisu
   - Testy integracyjne dla endpointów
   - Testy E2E dla przepływu użytkownika

6. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja obsługi błędów