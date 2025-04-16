# Architektura UI dla 10cards

## 1. Przegląd struktury UI

Ogólny przegląd struktury UI dla 10cards obejmuje podział na kluczowe widoki, które odpowiadają najważniejszym funkcjom systemu. Interfejs użytkownika jest zaprojektowany w oparciu o gotowe komponenty Shadcn/ui oraz Tailwind CSS, z uwzględnieniem responsywności, dostępności i bezpieczeństwa. Główne obszary to ekran autoryzacji, dashboard, widok generowania fiszek, lista fiszek, panel użytkownika oraz ekran sesji powtórkowych. Każdy widok jest zintegrowany z odpowiednimi endpointami API, co umożliwia zarówno indywidualną, jak i zbiorczą edycję danych.

## 2. Lista widoków

- **Ekran autoryzacji**
  - Ścieżka: `/auth`
  - Główny cel: Umożliwienie logowania i rejestracji użytkownika.
  - Kluczowe informacje: Formularze logowania i rejestracji, komunikaty o błędach (inline oraz toast), informacje o autoryzacji.
  - Kluczowe komponenty: Formularze z walidacją, pola input, przyciski, toast message.
  - UX, dostępność, bezpieczeństwo: Walidacja po stronie HTML, komunikaty błędów inline, wsparcie dla czytników ekranowych, mechanizmy zabezpieczeń autoryzacyjnych.

- **Dashboard**
  - Ścieżka: `/dashboard`
  - Główny cel: Przegląd głównych funkcji systemu i szybki dostęp do najważniejszych sekcji.
  - Kluczowe informacje: Statystyki (liczba zaakceptowanych fiszek, liczba sesji nauki, liczba nauczonych słówek), skróty do poszczególnych widoków.
  - Kluczowe komponenty: Karty informacyjne, wykresy, przyciski nawigacyjne.
  - UX, dostępność, bezpieczeństwo: Przejrzysta prezentacja informacji, responsywny design, zabezpieczenia przed dostępem nieautoryzowanym.

- **Widok generowania fiszek**
  - Ścieżka: `/flashcards/generate`
  - Główny cel: Wprowadzenie tekstu do generowania fiszek przez AI oraz recenzja i modyfikacja proponowanych fiszek.
  - Kluczowe informacje: Pole tekstowe do wprowadzania danych, lista propozycji fiszek z opcjami akceptacji, edycji i odrzucenia, możliwość zapisu zbiorczego (bulk "Zapisz wszystkie" lub "Zapisz zatwierdzone").
  - Kluczowe komponenty: Formularze, listy fiszek, przyciski akcji.
  - UX, dostępność, bezpieczeństwo: Intuicyjna edycja inline, walidacja i komunikaty błędów (HTML, toast message), responsywność dla różnych urządzeń.

- **Widok listy fiszek**
  - Ścieżka: `/flashcards/list`
  - Główny cel: Przegląd wcześniej wygenerowanych fiszek z opcjami edycji i usuwania.
  - Kluczowe informacje: Lista fiszek, przyciski do edycji i usuwania, opcje akcji zbiorczych.
  - Kluczowe komponenty: Tabele lub listy, przyciski edycji, funkcje usuwania.
  - UX, dostępność, bezpieczeństwo: Prosty i intuicyjny interfejs, łatwe w obsłudze akcje, wsparcie dla dostępności.

- **Panel użytkownika**
  - Ścieżka: `/user/profile`
  - Główny cel: Prezentacja informacji o koncie użytkownika i statystyk systemowych.
  - Kluczowe informacje: Dane profilowe, statystyki (zaakceptowane fiszki, sesje nauki, nauczone słówka), opcja wylogowania.
  - Kluczowe komponenty: Karty informacyjne, przyciski, elementy statystyczne.
  - UX, dostępność, bezpieczeństwo: Czytelny układ, responsywność, zabezpieczenia danych użytkownika.

- **Ekran sesji powtórkowych**
  - Ścieżka: `/flashcards/review`
  - Główny cel: Umożliwienie użytkownikowi nauki i powtórek fiszek na podstawie algorytmów nauki.
  - Kluczowe informacje: Prezentacja przodu fiszki, interakcja umożliwiająca wyświetlenie tyłu, system oceny fiszek.
  - Kluczowe komponenty: Komponenty quizowe, przyciski do oceny, moduły interaktywne.
  - UX, dostępność, bezpieczeństwo: Intuicyjna interakcja, responsywny design, wsparcie dla czytników ekranowych, zabezpieczenia sesji.

## 3. Mapa podróży użytkownika

- Użytkownik rozpoczyna na ekranie autoryzacji, gdzie wykonuje logowanie lub rejestrację.
- Po udanej autoryzacji, użytkownik zostaje przekierowany do widoku generowania fiszek.
- W widoku generowania fiszek użytkownik wprowadza tekst, otrzymuje propozycje fiszek od AI, a następnie recenzuje każdą propozycję przez jednostkową akceptację, edycję lub odrzucenie. Finalny zapis następuje w formie bulk ("Zapisz wszystkie" lub "Zapisz zatwierdzone").
- Użytkownik może przejść do widoku listy fiszek, gdzie przegląda, edytuje lub usuwa wcześniej zapisane fiszki.
- Z poziomu dashboardu lub panelu użytkownika, użytkownik ma dostęp do statystyk systemowych oraz opcji wylogowania.
- Na końcu, użytkownik może przejść do ekranu sesji powtórkowych, aby rozpocząć naukę i powtórki.

## 4. Układ i struktura nawigacji

Navigation Menu umieszczone w topbar (górna belka) stanowi główny element nawigacyjny. Menu zawiera następujące sekcje:
- Dashboard
- Generowanie fiszek
- Lista fiszek
- Panel użytkownika
- Sesja powtórkowa

Menu jest responsywne i dostosowuje się do różnych rozmiarów ekranów przy użyciu utility variants Tailwind (sm:, md:, lg:). Użytkownik może łatwo przełączać się między widokami, co zapewnia intuicyjny przepływ oraz szybki dostęp do najważniejszych funkcji.

## 5. Kluczowe komponenty

- **Formularze logowania i rejestracji**: Z walidacją HTML, inline komunikatami błędów i toast message dla błędów autoryzacji.
- **Komponent recenzji fiszek**: Umożliwia jednostkową akceptację, edycję i odrzucenie propozycji, z opcją bulk zapisu.
- **Tabele/listy fiszek**: Do przeglądania, edycji i usuwania zapisanych fiszek.
- **Karty informacyjne/statystyki**: Wizualizacja kluczowych metryk w dashboardzie i panelu użytkownika.
- **Interaktywne komponenty sesji powtórkowych**: Mechanizmy oceny i interakcji, które wspierają proces nauki.
- **Topbar Navigation Menu**: Główny element nawigacyjny umożliwiający szybki dostęp do wszystkich głównych widoków.