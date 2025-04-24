# Plan implementacji widoku listy fiszek

## 1. Przegląd
Widok listy fiszek (`/flashcards/list`) umożliwia użytkownikom przeglądanie, edycję i zarządzanie ich fiszkami. Zapewnia intuicyjny interfejs do wykonywania operacji CRUD na fiszkach, z naciskiem na wydajność i dostępność.

## 2. Routing widoku
- Ścieżka: `/flashcards/list`
- Komponent: `FlashcardsIndexView`

## 3. Struktura komponentów
```
FlashcardsIndexView
├── Header
│   └── CreateFlashcardButton
├── FlashcardsList
│   └── FlashcardItem[]
├── CreateFlashcardDialog
└── DeleteConfirmationDialog
```

## 4. Szczegóły komponentów

### FlashcardsIndexView
- Opis komponentu: Główny kontener widoku, zarządza stanem globalnym i wywołaniami API
- Główne elementy: Header, FlashcardsList, dialogi modalne
- Obsługiwane interakcje: Zarządzanie stanem globalnym, obsługa routingu
- Obsługiwana walidacja: Sprawdzanie autoryzacji
- Typy: `FlashcardsListState`, `FlashcardListViewModel`
- Propsy: Brak (komponent najwyższego poziomu)

### Header
- Opis komponentu: Górny pasek nawigacyjny z akcjami
- Główne elementy: CreateFlashcardButton, opcje filtrowania i sortowania
- Obsługiwane interakcje: Kliknięcia przycisków, zmiana filtrów
- Obsługiwana walidacja: Brak
- Typy: `FlashcardsListFilters`
- Propsy: `onCreateClick`, `onFilterChange`, `filters`

### FlashcardsList
- Opis komponentu: Lista fiszek z paginacją
- Główne elementy: FlashcardItem[], kontrolki paginacji
- Obsługiwane interakcje: Przewijanie, paginacja, zaznaczanie
- Obsługiwana walidacja: Brak
- Typy: `FlashcardListViewModel[]`, `PaginationState`
- Propsy: `flashcards`, `pagination`, `onPageChange`

### FlashcardItem
- Opis komponentu: Pojedyncza fiszka z możliwością edycji
- Główne elementy: Pola tekstowe, przyciski akcji
- Obsługiwane interakcje: Edycja, usuwanie, zaznaczanie
- Obsługiwana walidacja: Niepuste pola front/back
- Typy: `FlashcardListViewModel`
- Propsy: `flashcard`, `onEdit`, `onDelete`, `onSelect`

### CreateFlashcardDialog
- Opis komponentu: Modal do tworzenia nowej fiszki
- Główne elementy: Formularz z polami front/back
- Obsługiwane interakcje: Submit formularza
- Obsługiwana walidacja: Niepuste pola, max długość
- Typy: `CreateFlashcardCommand`
- Propsy: `isOpen`, `onClose`, `onCreate`

### DeleteConfirmationDialog
- Opis komponentu: Modal potwierdzenia usunięcia
- Główne elementy: Tekst potwierdzenia, przyciski akcji
- Obsługiwane interakcje: Potwierdzenie/anulowanie
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy: `isOpen`, `onClose`, `onConfirm`, `flashcardId`

## 5. Typy

```typescript
interface FlashcardListViewModel extends FlashcardDTO {
  isEditing: boolean;
  isSelected: boolean;
}

interface FlashcardsListState {
  items: FlashcardListViewModel[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  filters: {
    status?: FlashcardStatus;
    source?: FlashcardSource;
    sort: 'created_at' | 'updated_at';
    order: 'asc' | 'desc';
  };
  selectedIds: string[];
}

interface FlashcardsListFilters {
  status?: FlashcardStatus;
  source?: FlashcardSource;
  sort: string;
  order: string;
}
```

## 6. Zarządzanie stanem

### useFlashcardsList
Custom hook zarządzający listą fiszek:
- Pobieranie danych z paginacją
- Zarządzanie filtrami i sortowaniem
- Obsługa zaznaczania elementów
- Optymistyczne aktualizacje

### useFlashcardActions
Custom hook do operacji CRUD:
- Tworzenie nowych fiszek
- Edycja istniejących
- Usuwanie z potwierdzeniem
- Obsługa błędów i komunikatów

## 7. Integracja API

### Pobieranie listy
```typescript
GET /api/flashcards
Query: {
  limit: number;
  offset: number;
  status?: FlashcardStatus;
  source?: FlashcardSource;
  sort: string;
  order: string;
}
```

### Tworzenie fiszki
```typescript
POST /api/flashcards
Body: CreateFlashcardCommand
```

### Aktualizacja fiszki
```typescript
PATCH /api/flashcards/:id
Body: UpdateFlashcardCommand
```

### Usuwanie fiszki
```typescript
DELETE /api/flashcards/:id
```

## 8. Interakcje użytkownika
1. Tworzenie fiszki:
   - Kliknięcie "Nowa fiszka"
   - Wypełnienie formularza
   - Zatwierdzenie/anulowanie

2. Edycja fiszki:
   - Kliknięcie przycisku edycji
   - Modyfikacja pól
   - Zatwierdzenie zmian

3. Usuwanie fiszki:
   - Kliknięcie przycisku usuwania
   - Potwierdzenie w modalu
   - Wykonanie akcji

4. Paginacja i filtrowanie:
   - Zmiana strony
   - Ustawienie filtrów
   - Sortowanie listy

## 9. Warunki i walidacja
1. Tworzenie/edycja fiszki:
   - Front: wymagane, min. 1 znak
   - Back: wymagane, min. 1 znak
   - Walidacja przed wysłaniem do API

2. Usuwanie:
   - Wymagane potwierdzenie
   - Sprawdzenie uprawnień

3. Filtrowanie:
   - Poprawne wartości statusu i źródła
   - Prawidłowy format sortowania

## 10. Obsługa błędów
1. Błędy API:
   - Wyświetlanie komunikatów użytkownikowi
   - Retry dla nieudanych operacji
   - Rollback dla optymistycznych aktualizacji

2. Błędy walidacji:
   - Wyświetlanie przy polach formularza
   - Blokada submit dla niepoprawnych danych

3. Błędy autoryzacji:
   - Przekierowanie do logowania
   - Zachowanie stanu formularza

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów:
   - Konfiguracja routingu
   - Szkielet głównych komponentów
   - Definicje typów

2. Implementacja komponentów UI:
   - Header z filtrowaniem
   - Lista fiszek
   - Komponenty modalne

3. Integracja z API:
   - Implementacja custom hooks
   - Podłączenie endpoints
   - Obsługa błędów

4. Implementacja logiki biznesowej:
   - CRUD operacje
   - Walidacja
   - Optymistyczne aktualizacje

5. Stylowanie i dostępność:
   - Aplikacja styli Tailwind
   - Komponenty Shadcn/ui
   - Testy dostępności

6. Testy i optymalizacja:
   - Testy jednostkowe
   - Testy integracyjne
   - Optymalizacja wydajności

7. Dokumentacja:
   - Komentarze w kodzie
   - README
   - Storybook (opcjonalnie)