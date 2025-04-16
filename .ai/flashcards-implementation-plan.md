# API Endpoint Implementation Plan: Get All Flashcards

## 1. Przegląd punktu końcowego
Endpoint `GET /api/flashcards` służy do pobierania wszystkich fiszek dla uwierzytelnionego użytkownika. Umożliwia filtrowanie według statusu (accepted, rejected) oraz źródła (ai-full, ai-edited, manual), a także sortowanie i paginację wyników.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **URL:** `/api/flashcards`
- **Parametry zapytania:**
  - **limit** (opcjonalny, domyślnie: 20): Liczba wyników na stronę.
  - **offset** (opcjonalny, domyślnie: 0): Przesunięcie w paginacji.
  - **status** (opcjonalny): Filtrowanie według statusu (`accepted`, `rejected`).
  - **source** (opcjonalny): Filtrowanie według źródła (`ai-full`, `ai-edited`, `manual`).
  - **sort** (opcjonalny, domyślnie: `created_at`): Pole sortowania.
  - **order** (opcjonalny, domyślnie: `desc`): Kolejność sortowania (`asc`, `desc`).

## 3. Wykorzystywane typy
- **FlashcardDTO:** Obejmuje pola: `id`, `front`, `back`, `status`, `source`, `created_at`, `updated_at`.
- **Pagination Object:** Zawiera `total`, `limit` oraz `offset` do obsługi paginacji odpowiedzi.

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "status": "accepted|rejected|pending",
        "source": "ai-full|ai-edited|manual",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0
    }
  }
  ```
- **Błędy:**
  - 401 Unauthorized – gdy użytkownik nie jest uwierzytelniony.
  - 500 Internal Server Error – błąd serwera.

## 5. Przepływ danych
1. **Uwierzytelnienie:** Middleware sprawdza token uwierzytelniający i przypisuje `user_id` z kontekstu Supabase (RLS).
2. **Walidacja zapytania:** Parametry zapytania są sprawdzane pod kątem poprawności (np. `limit` i `offset` jako liczby, dozwolone wartości dla `status` i `source`).
3. **Zapytanie do bazy danych:** Na podstawie `user_id` wykonywane jest zapytanie z uwzględnieniem opcjonalnych filtrów, paginacji i sortowania.
4. **Formatowanie odpowiedzi:** Wyniki zapytania są przekształcane do formatu zgodnego z API (lista fiszek oraz obiekt paginacji).
5. **Wysłanie odpowiedzi:** W przypadku powodzenia, zwracamy odpowiedź 200 z danymi, w przeciwnym razie odpowiednio obsługujemy błędy.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie:** Endpoint dostępny tylko dla uwierzytelnionych użytkowników.
- **Ograniczenie danych:** RLS na tabeli `flashcards` gwarantuje, że użytkownik widzi tylko swoje dane.
- **Walidacja wejścia:** Staranna walidacja parametrów zapytania aby zabezpieczyć przed SQL Injection i innymi atakami.
- **Przygotowane zapytania:** Użycie parametrów w zapytaniach do bazy danych w celu zwiększenia bezpieczeństwa.

## 7. Obsługa błędów
- **401 Unauthorized:** Zwracane, gdy użytkownik nie jest uwierzytelniony.
- **400 Bad Request:** Opcjonalnie, w przypadku niepoprawnych wartości parametrów (dodatkowa walidacja).
- **500 Internal Server Error:** Zwracane w przypadku błędów serwera (np. problemy z bazą danych, nieprzewidziane wyjątki).
- **Logowanie błędów:** Każdy błąd powinien być logowany, a w razie potrzeby zapisywany w dedykowanej tabeli logów błędów.

## 8. Rozważania dotyczące wydajności
- **Indeksy:** Upewnić się, że tabela `flashcards` posiada indeksy na `user_id`, `status` oraz `source` i polu używanym do sortowania (np. `created_at`).
- **Paginação:** Wykorzystanie paginacji (limit i offset) pozwala na optymalizację wydajności przy dużych zbiorach danych.
- **Optymalizacja zapytań:** Pobieranie tylko niezbędnych pól.

## 9. Etapy wdrożenia
1. Utworzenie nowego endpointu w katalogu `/src/pages/api/flashcards/index.ts`.
2. Implementacja uwierzytelnienia użytkownika z wykorzystaniem `context.locals` (Supabase Auth).
3. Walidacja parametrów zapytania (`limit`, `offset`, `status`, `source`, `sort`, `order`).
4. Implementacja logiki zapytania do bazy danych z wykorzystaniem filtrów, paginacji i sortowania.
5. Formatowanie wyników zgodnie ze specyfikacją API.
6. Implementacja mechanizmu obsługi błędów oraz logowania potencjalnych wyjątków.
7. Testy jednostkowe i integracyjne endpointu.
8. Przegląd kodu przez zespół oraz wdrożenie do środowiska testowego.
9. Monitorowanie wydajności i wdrażanie ewentualnych optymalizacji.