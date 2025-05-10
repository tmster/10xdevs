# Plan implementacji widoku Dashboard

## 1. Przegląd
Dashboard jest głównym widokiem aplikacji, który służy jako punkt wejścia do wszystkich kluczowych funkcji systemu. Widok prezentuje najważniejsze statystyki użytkownika oraz zapewnia szybki dostęp do głównych sekcji aplikacji. Jest to widok chroniony, dostępny tylko dla zalogowanych użytkowników.

## 2. Routing widoku
- Ścieżka: `/dashboard`
- Middleware: Wymagana autoryzacja użytkownika
- Layout: Główny layout aplikacji z nawigacją

## 3. Struktura komponentów
```
Dashboard
├── DashboardHeader
│   └── UserWelcome
├── DashboardStats
│   ├── StatCard
│   └── StatChart
├── QuickActions
│   └── ActionButton
├── FlashcardPreview
│   ├── FlashcardFront
│   └── FlashcardBack
└── PendingFlashcards
    └── PendingFlashcardList
```

## 4. Szczegóły komponentów

### Dashboard
- Opis: Główny komponent widoku, zarządza stanem i układem wszystkich podkomponentów
- Główne elementy: Grid layout z sekcjami dla statystyk, akcji i podglądu fiszek
- Obsługiwane interakcje:
  - Inicjalizacja danych
  - Obsługa błędów ładowania
- Typy: DashboardViewModel
- Propsy: Brak (komponent główny)

### DashboardHeader
- Opis: Nagłówek z powitaniem użytkownika
- Główne elementy:
  - UserWelcome (komponent)
  - Statystyki sesji
- Obsługiwane interakcje: Brak
- Typy: UserWelcomeProps
- Propsy:
  - username: string
  - lastLoginDate: Date

### DashboardStats
- Opis: Sekcja prezentująca statystyki użytkownika
- Główne elementy:
  - StatCard (komponenty)
  - StatChart (komponent)
- Obsługiwane interakcje:
  - Filtrowanie statystyk
  - Zmiana okresu
- Typy: DashboardStatsViewModel
- Propsy:
  - stats: StatisticsDTO
  - onPeriodChange: (period: string) => void

### QuickActions
- Opis: Sekcja z szybkimi akcjami
- Główne elementy:
  - ActionButton (komponenty)
- Obsługiwane interakcje:
  - Nawigacja do sekcji
- Typy: QuickAction[]
- Propsy:
  - actions: QuickAction[]
  - onActionClick: (action: QuickAction) => void

### FlashcardPreview
- Opis: Komponent prezentujący pojedynczą fiszkę
- Główne elementy:
  - FlashcardFront
  - FlashcardBack
- Obsługiwane interakcje:
  - Kliknięcie w fiszkę (odwrócenie)
  - Animacja odwracania
- Typy: FlashcardViewModel
- Propsy:
  - flashcard: FlashcardViewModel
  - onFlip: () => void

### PendingFlashcards
- Opis: Sekcja z listą oczekujących fiszek
- Główne elementy:
  - PendingFlashcardList
- Obsługiwane interakcje:
  - Nawigacja do listy
  - Podgląd liczby oczekujących
- Typy: PendingFlashcardsViewModel
- Propsy:
  - count: number
  - onViewAll: () => void

## 5. Typy

### DashboardViewModel
```typescript
interface DashboardViewModel {
  user: {
    username: string;
    lastLoginDate: Date;
  };
  stats: StatisticsDTO;
  currentFlashcard: FlashcardViewModel | null;
  pendingFlashcards: {
    count: number;
    items: FlashcardViewModel[];
  };
}
```

### QuickAction
```typescript
interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path: string;
  description: string;
}
```

## 6. Zarządzanie stanem
- Custom hook: `useDashboard`
  - Zarządzanie stanem ładowania
  - Pobieranie i aktualizacja statystyk
  - Pobieranie aktualnej fiszki
  - Pobieranie listy oczekujących fiszek
  - Obsługa błędów

## 7. Integracja API
- Endpoint: GET `/api/flashcards`
  - Parametry: limit=1, status=accepted
  - Użycie: Pobieranie aktualnej fiszki
- Endpoint: GET `/api/statistics`
  - Użycie: Pobieranie statystyk użytkownika
- Endpoint: GET `/api/flashcards`
  - Parametry: status=pending
  - Użycie: Pobieranie liczby oczekujących fiszek

## 8. Interakcje użytkownika
1. Wejście na dashboard:
   - Automatyczne ładowanie statystyk
   - Automatyczne ładowanie aktualnej fiszki
   - Automatyczne sprawdzanie oczekujących fiszek

2. Interakcja z fiszką:
   - Kliknięcie w fiszkę -> animacja odwracania
   - Wyświetlenie tyłu fiszki
   - Możliwość powrotu do przodu

3. Interakcja z akcjami:
   - Kliknięcie w akcję -> nawigacja do odpowiedniej sekcji
   - Hover na akcji -> wyświetlenie opisu

4. Interakcja z oczekującymi fiszkami:
   - Kliknięcie w licznik -> nawigacja do listy oczekujących

## 9. Warunki i walidacja
1. Autoryzacja:
   - Sprawdzenie czy użytkownik jest zalogowany
   - Przekierowanie do logowania jeśli brak autoryzacji

2. Dane:
   - Walidacja odpowiedzi API
   - Sprawdzanie poprawności typów danych
   - Obsługa pustych stanów

3. Interakcje:
   - Walidacja stanu przed wykonaniem akcji
   - Sprawdzanie uprawnień do akcji

## 10. Obsługa błędów
1. Błędy API:
   - Wyświetlenie komunikatu o błędzie
   - Możliwość ponowienia próby
   - Zachowanie stanu aplikacji

2. Błędy walidacji:
   - Wyświetlenie informacji o błędzie
   - Podpowiedź jak naprawić

3. Błędy autoryzacji:
   - Przekierowanie do logowania
   - Zachowanie URL do powrotu

## 11. Kroki implementacji
1. Przygotowanie struktury:
   - Utworzenie plików komponentów
   - Konfiguracja routingu
   - Przygotowanie typów

2. Implementacja komponentów:
   - Dashboard (komponent główny)
   - DashboardHeader
   - DashboardStats
   - QuickActions
   - FlashcardPreview
   - PendingFlashcards

3. Implementacja logiki:
   - Custom hook useDashboard
   - Integracja z API
   - Obsługa stanu

4. Implementacja interakcji:
   - Animacje
   - Obsługa zdarzeń
   - Nawigacja

5. Testy i optymalizacja:
   - Testy jednostkowe
   - Testy integracyjne
   - Optymalizacja wydajności

6. Dokumentacja:
   - Dokumentacja komponentów
   - Dokumentacja typów
   - Dokumentacja API