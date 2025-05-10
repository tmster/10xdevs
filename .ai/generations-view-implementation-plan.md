# Plan implementacji widoku generowania fiszek

## 1. Przegląd
Widok generowania fiszek umożliwia użytkownikowi wklejenie fragmentu tekstu, który następnie zostanie wysłany do systemu AI. System zwróci propozycje fiszek (pytania i odpowiedzi), które użytkownik może przeglądać, edytować, zatwierdzać lub odrzucać. Widok zapewnia intuicyjną edycję inline, walidację danych wejściowych, responsywność oraz obsługę komunikatów błędów w celu poprawnego zarządzania propozycjami fiszek.

## 2. Routing widoku
Ścieżka: `/flashcards/generate`

## 3. Struktura komponentów
- **GenerationView (rodzic)**
  - Komponent odpowiedzialny za cały widok generowania fiszek. Zarządza stanem tekstu wejściowego, listą wygenerowanych fiszek oraz stanem ładowania.

  - **GenerationForm**
    - Formularz umożliwiający wprowadzenie tekstu i opcjonalnie ustawienie liczby maksymalnych fiszek.
    - Zawiera: pole tekstowe (textarea) i przycisk "Generuj".

  - **FlashcardsList**
    - Lista wyświetlająca poszczególne propozycje fiszek.
    - Zawiera: szereg komponentów FlashcardItem.

  - **FlashcardItem**
    - Komponent reprezentujący pojedynczą fiszkę.
    - Zawiera: wyświetlanie pól "front" oraz "back", przyciski akcji (Akceptuj, Edytuj, Odrzuć) oraz interfejs umożliwiający edycję inline.

  - **BulkSaveButton**
    - Przycisk umożliwiający zapis zbiorczy wybranych (zatwierdzonych) fiszek do bazy danych.

## 4. Szczegóły komponentów
### GenerationForm
- **Opis**: Formularz do wprowadzenia tekstu, który będzie użyty do generowania fiszek przez AI.
- **Główne elementy**: Pole textarea, opcjonalne pole wyboru liczby maksymalnych kart, przycisk "Generuj".
- **Obsługiwane interakcje**:
  - Wprowadzanie tekstu.
  - Kliknięcie przycisku wywołujące walidację (długość tekstu od 1000 do 10000 znaków) i wysłanie żądania do API.
- **Walidacja**:
  - Minimalna długość tekstu: 1000 znaków.
  - Maksymalna długość tekstu: 10000 znaków.
  - Weryfikacja liczby maksymalnych fiszek (np. zakres 1-10).
- **Typy**:
  - Użycie typu `CreateGenerationCommand` (text i options) z typów backendowych.
- **Propsy**: Callback do obsługi sukcesu generacji (np. aktualizacja stanu rodzica z listą fiszek).

### FlashcardsList
- **Opis**: Lista renderująca wszystkie wygenerowane fiszki otrzymane z API.
- **Główne elementy**: Lista komponentów `FlashcardItem`.
- **Obsługiwane interakcje**:
  - Renderowanie stanu (np. ładowanie, brak wyników, czy wystąpił błąd).
- **Walidacja**: Brak bezpośredniej walidacji, stan pochodzi z rodzica.
- **Typy**:
  - Tablica obiektów typu `GeneratedFlashcardDTO` lub rozszerzonego ViewModel (z lokalnym stanem edycji i wybranym statusem).
- **Propsy**: Lista fiszek, callback dla akcji na pojedynczej fisce (np. edycja, akceptacja, odrzucenie).

### FlashcardItem
- **Opis**: Pojedynczy komponent fiszki z możliwością podglądu i edycji.
- **Główne elementy**: Wyświetlanie pól tekstowych dla "front" i "back", przyciski akcji (Akceptuj, Edytuj, Odrzuć).
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku Akceptuj zmienia status na "accepted".
  - Kliknięcie przycisku Odrzuć zmienia status na "rejected".
  - Kliknięcie przycisku Edytuj przełącza stan na tryb edycji, umożliwiając modyfikację treści.
- **Walidacja**:
  - Sprawdzenie, czy w trybie edycji pola nie są puste lub przekraczają ograniczenia znaków, jeśli takie obowiązują.
- **Typy**:
  - Rozszerzenie typu `GeneratedFlashcardDTO` o dodatkowe pola stanu (np. `isEditing`).
- **Propsy**: Dane fiszki, funkcje aktualizujące status i zawartość fiszki w stanie rodzica.

### BulkSaveButton
- **Opis**: Przycisk pozwalający na zapis wszystkich zatwierdzonych fiszek w jednym zbiorczym żądaniu do API.
- **Główne elementy**: Przycisk "Zapisz wszystkie".
- **Obsługiwane interakcje**:
  - Kliknięcie powoduje zebranie wszystkich fiszek o statusie "accepted" i wysłanie odpowiedniego żądania, np. do endpointu `/api/flashcards/batch`.
- **Walidacja**: Weryfikacja, czy istnieją fiszki do zapisania.
- **Typy**:
  - Użycie typu `BatchProcessFlashcardsCommand` dla wysłania zmian.
- **Propsy**: Callback wskazujący na zakończenie zapisu, aktualizacja UI w razie błędów lub sukcesu.

## 5. Typy
- **GeneratedFlashcardDTO**: Reprezentuje pojedynczą fiszkę wygenerowaną przez AI (pola: id, front, back, status: 'pending' oraz source: 'ai-full').
- **Rozszerzony ViewModel dla fiszki**: Może być zdefiniowany jako:
  ```typescript
  type FlashcardVM = {
    id: string;
    front: string;
    back: string;
    status: 'pending' | 'accepted' | 'rejected';
    source: 'ai-full' | 'ai-edited';
    isEditing?: boolean;
  };
  ```
- **CreateGenerationCommand**: Używany do wywołania API generacji fiszek, zawiera `text` oraz `options: { max_cards: number }`.
- **CreateGenerationResponse**: Odpowiedź zawierająca `generation_id` oraz listę fiszek.

## 6. Zarządzanie stanem
- Stan głównego widoku (`GenerationView`) będzie zarządzał:
  - Tekstem wejściowym z formularza.
  - Listą wygenerowanych fiszek (tablica obiektów typu `FlashcardVM`).
  - Stanem ładowania i błędami API.
- Można zastosować niestandardowy hook (np. `useFlashcardsGeneration`) do enkapsulacji logiki pobierania, walidacji oraz aktualizacji stanów poszczególnych fiszek.

## 7. Integracja API
- **Generowanie fiszek**:
  - Przy wysłaniu formularza, wykonywane jest żądanie POST do `/api/generations` z danymi w formacie `CreateGenerationCommand`.
  - Po sukcesie zwrócony zostaje obiekt `CreateGenerationResponse`, z którego lista fiszek jest zapisywana w stanie.
  - W przypadku błędu wyświetlany jest komunikat błędu (np. toast, alert).
- **Zapis zbiorczy**:
  - Po zatwierdzeniu wybranych fiszek, zbierana jest lista fiszek o statusie 'accepted' i wysyłane jest żądanie do endpointu (np. `/api/flashcards/batch`) z odpowiednią strukturą typu `BatchProcessFlashcardsCommand`.

## 8. Interakcje użytkownika
- Użytkownik wkleja tekst w pole formularza.
- Po kliknięciu przycisku "Generuj", następuje walidacja długości tekstu i wywołanie API.
- Po otrzymaniu odpowiedzi, wyświetlana jest lista fiszek.
- Użytkownik może:
  - Kliknąć "Akceptuj" aby zatwierdzić fiszkę.
  - Kliknąć "Odrzuć", aby odrzucić daną propozycję.
  - Kliknąć "Edytuj" aby zmodyfikować zawartość fiszki inline.
- Po dokonaniu zmian, użytkownik klika przycisk "Zapisz wszystkie", co powoduje wysłanie zbiorczego żądania zapisu zatwierdzonych fiszek do bazy.

## 9. Warunki i walidacja
- **Tekst wejściowy**:
  - Musi mieć od 1000 do 10000 znaków, inaczej formularz wyświetla błąd.
- **Maksymalna liczba fiszek**:
  - Walidacja, czy wartość jest liczbą mieszczącą się w ustalonym zakresie (np. 1-10).
- **FlashcardItem**:
  - W trybie edycji pola nie mogą być puste.
  - Aktualizacja statusu musi być widoczna (np. wizualne zaznaczenie zatwierdzonej lub odrzuconej karty).

## 10. Obsługa błędów
- Błędy walidacyjne formularza (np. tekst za krótki/długi) powinny być wyświetlane inline w obrębie komponentu.
- Błędy API (np. 500 Internal Server Error, 401 Unauthorized) powinny być obsługiwane przez wyświetlenie toast/alertu z odpowiednim komunikatem.
- Podczas zapisywania zbiorczego, każdy błąd powinien umożliwić ponowną próbę zapisu oraz informować użytkownika o szczegółach problemu.

## 11. Kroki implementacji
1. Utworzenie pliku widoku (np. `/src/pages/flashcards/generate.tsx`) i skonfigurowanie routingu.
2. Stworzenie komponentu `GenerationView` wraz z wewnętrznym stanem:
   - Tekst wejściowy i pole ustawienia maksymalnej liczby fiszek.
   - Stan ładowania i lista fiszek.
3. Implementacja komponentu `GenerationForm` z walidacją tekstu i wywołaniem API `/api/generations`.
4. Implementacja komponentu `FlashcardsList`, który renderuje listę `FlashcardItem`.
5. Utworzenie komponentu `FlashcardItem` umożliwiającego inline edycję, oraz akcje: Akceptuj, Edytuj, Odrzuć.
6. Dodanie komponentu `BulkSaveButton` z logiką zbiorczego zapisu wybranych fiszek przy użyciu endpointu `/api/flashcards/batch`.
7. Zaimplementowanie niestandardowego hooka (np. `useFlashcardsGeneration`) do zarządzania stanem widoku.
8. Integracja z API – stworzenie funkcji wywołujących odpowiednie endpointy z wykorzystaniem typów `CreateGenerationCommand`, `CreateGenerationResponse` oraz `BatchProcessFlashcardsCommand`.
9. Dodanie obsługi błędów, walidacji oraz komunikatów (toasty/alerty) przy nieudanych operacjach.
10. Przeprowadzenie testów widoku w różnych scenariuszach (różne długości tekstu, błędy API, interakcje użytkownika) i wdrożenie poprawek.
11. Zadbanie o responsywność widoku oraz zgodność z wytycznymi dostępu (accessibility) i UX.