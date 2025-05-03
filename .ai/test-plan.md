# Plan Testów Projektu

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument przedstawia plan testów dla projektu `{app-name}`, którego celem jest zapewnienie wysokiej jakości, niezawodności i zgodności aplikacji z wymaganiami. Plan obejmuje strategię testowania, zakres, harmonogram, zasoby oraz kryteria akceptacji dla wszystkich faz testowania. Projekt wykorzystuje nowoczesny stos technologiczny oparty o Astro, React, TypeScript, Tailwind CSS, Shadcn/ui oraz Supabase jako backend, co wymaga specyficznego podejścia do testów.

### 1.2. Cele Testowania

Główne cele procesu testowania to:

*   Weryfikacja zgodności funkcjonalnej aplikacji z założeniami projektowymi i wymaganiami użytkownika.
*   Identyfikacja i raportowanie defektów oprogramowania na jak najwcześniejszym etapie rozwoju.
*   Zapewnienie stabilności, wydajności i bezpieczeństwa aplikacji.
*   Ocena jakości interfejsu użytkownika (UI) i doświadczenia użytkownika (UX).
*   Minimalizacja ryzyka związanego z wdrożeniem aplikacji na środowisko produkcyjne.
*   Potwierdzenie poprawnej integracji z usługami zewnętrznymi (Supabase, Openrouter.ai).
*   Zapewnienie spójności wizualnej i responsywności aplikacji na różnych urządzeniach i przeglądarkach.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami

Testom poddane zostaną wszystkie kluczowe moduły i funkcjonalności aplikacji, w tym:

*   **Moduły Frontendowe (Astro/React):**
    *   Strony statyczne i dynamiczne (`src/pages`).
    *   Layouty Astro (`src/layouts`) - poprawność struktury, przekazywanie slotów.
    *   Komponenty interaktywne React (`src/components`) - renderowanie, propsy, stan, interakcje.
    *   Komponenty statyczne Astro (`src/components`) - renderowanie, propsy.
    *   Komponenty UI (integracja i użycie `src/components/ui`).
    *   Customowe hooki React (`src/hooks`) - logika, zarządzanie stanem, efekty uboczne.
    *   Routing i nawigacja (Astro routing).
    *   Formularze i walidacja danych wejściowych (po stronie klienta i serwera).
    *   Wyświetlanie danych pobieranych z backendu/API.
    *   Style globalne i specyficzne dla komponentów (`src/styles`, Tailwind).
    *   Responsywność interfejsu (RWD).
*   **Moduły Backendowe (API/Supabase):**
    *   Punkty końcowe API (`src/pages/api`).
    *   Logika biznesowa w serwisach i helperach (`src/lib`).
    *   Interakcje z bazą danych Supabase (konfiguracja w `src/db`, użycie w `src/lib` lub API routes) - operacje CRUD, RLS.
    *   System uwierzytelniania i autoryzacji użytkowników (Supabase Auth, logika w middleware/API routes).
    *   Integracja z zewnętrznymi API (Openrouter.ai, logika w `src/lib`).
*   **Middleware (`src/middleware`):**
    *   Logika działająca na poziomie żądań/odpowiedzi (np. autoryzacja, logowanie, modyfikacja nagłówków).
*   **Typy (`src/types`, `src/types.ts`):**
    *   Spójność typów między frontendem a backendem (weryfikacja w testach integracyjnych i API).
*   **Konfiguracja i Środowisko:**
    *   Proces budowania aplikacji (Astro build, `npm run build`).
    *   Poprawność działania aplikacji w kontenerze Docker (zgodnie z `Dockerfile`).

### 2.2. Funkcjonalności wyłączone z testów (jeśli dotyczy)

*   Bezpośrednie testowanie wewnętrznej implementacji komponentów biblioteki Shadcn/ui (zakładamy ich poprawność).
*   Bezpośrednie testowanie infrastruktury Supabase i Openrouter.ai (skupiamy się na integracji).

## 3. Typy Testów do Przeprowadzenia

W celu zapewnienia kompleksowego pokrycia testowego, zastosowane zostaną następujące typy testów:

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu.
    *   **Narzędzia:** Vitest, React Testing Library (`@testing-library/react`), `@testing-library/react-hooks`.
    *   **Zakres:** Funkcje w `src/lib`, logika komponentów React (`src/components`), customowe hooki React (`src/hooks`). Mockowanie zależności zewnętrznych (Supabase SDK, Fetch API, Openrouter API).
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja poprawnej współpracy pomiędzy różnymi modułami systemu.
    *   **Narzędzia:** Vitest, React Testing Library, Supertest (dla API), MSW (Mock Service Worker), dedykowana baza testowa Supabase lub mocki SDK.
    *   **Zakres:** Interakcje komponentów React (`src/components`, `src/hooks`), współpraca frontend-backend (komponenty <-> API routes w `src/pages/api`), interakcje z bazą danych (logika w `src/lib` używająca `src/db`), działanie middleware (`src/middleware`), integracja z Openrouter.ai (z użyciem mocków).
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego.
    *   **Narzędzia:** Playwright lub Cypress.
    *   **Zakres:** Kluczowe ścieżki użytkownika (rejestracja, logowanie, CRUD, interakcja z AI), przepływy obejmujące UI (Astro strony `src/pages`, React komponenty `src/components`), API (`src/pages/api`) i bazę danych (`src/db`), renderowanie stron Astro i layoutów (`src/layouts`).
*   **Testy API:**
    *   **Cel:** Bezpośrednia weryfikacja punktów końcowych API (`src/pages/api`).
    *   **Narzędzia:** Postman, Supertest (w ramach testów integracyjnych), Playwright (do testowania API routes Astro).
    *   **Zakres:** Poprawność odpowiedzi (statusy, treść) dla różnych metod HTTP, walidacja danych wejściowych (zgodność z `src/types.ts`), obsługa błędów, autoryzacja (middleware, Supabase Auth), zgodność z kontraktem (np. OpenAPI spec, jeśli istnieje).
*   **Testy Wydajnościowe:**
    *   **Cel:** Ocena szybkości ładowania stron, czasu odpowiedzi API i ogólnej wydajności aplikacji pod obciążeniem.
    *   **Narzędzia:** Lighthouse (audyty przeglądarki), k6 (testy obciążeniowe API).
    *   **Zakres:** Czas ładowania kluczowych stron (Astro), czas odpowiedzi punktów końcowych API, zachowanie aplikacji pod symulowanym obciążeniem.
*   **Testy Bezpieczeństwa:**
    *   **Cel:** Identyfikacja potencjalnych luk bezpieczeństwa.
    *   **Narzędzia:** OWASP ZAP (podstawowe skanowanie), manualna weryfikacja, audyty Supabase RLS (Row Level Security).
    *   **Zakres:** Uwierzytelnianie, autoryzacja (role, RLS w Supabase), walidacja danych wejściowych (zapobieganie XSS, SQL Injection - choć Supabase SDK pomaga), bezpieczeństwo konfiguracji.
*   **Testy Wizualnej Regresji:**
    *   **Cel:** Wykrywanie niezamierzonych zmian w interfejsie użytkownika.
    *   **Narzędzia:** Playwright (porównywanie zrzutów ekranu), Chromatic (jeśli używany jest Storybook).
    *   **Zakres:** Kluczowe strony i komponenty w różnych rozdzielczościach ekranu.
*   **Testy Kompatybilności (Cross-Browser/Cross-Device):**
    *   **Cel:** Zapewnienie poprawnego działania i wyglądu aplikacji w różnych przeglądarkach i na różnych urządzeniach.
    *   **Narzędzia:** Manualne testy, usługi typu BrowserStack/LambdaTest, narzędzia deweloperskie przeglądarek.
    *   **Zakres:** Najpopularniejsze przeglądarki (Chrome, Firefox, Safari, Edge) w najnowszych wersjach, popularne rozdzielczości mobilne i desktopowe.
*   **Testy Akceptacyjne Użytkownika (UAT - User Acceptance Testing):**
    *   **Cel:** Potwierdzenie przez interesariuszy lub końcowych użytkowników, że aplikacja spełnia ich oczekiwania i wymagania biznesowe.
    *   **Metoda:** Przeprowadzenie predefiniowanych scenariuszy przez wyznaczone osoby.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

*Poniżej znajdują się przykładowe, rozszerzone scenariusze. Szczegółowe przypadki testowe zostaną opracowane w osobnym dokumencie lub systemie do zarządzania testami.*

*   **Scenariusz 1: Rejestracja i Logowanie Użytkownika (Supabase Auth)**
    *   Test E2E: Użytkownik otwiera stronę logowania, klika "Zarejestruj się", wypełnia formularz poprawnymi danymi, otrzymuje email weryfikacyjny (jeśli skonfigurowano), klika link, zostaje przekierowany do aplikacji jako zalogowany. Następnie wylogowuje się i loguje ponownie używając nowo utworzonego konta.
    *   Test E2E (OAuth): Użytkownik klika "Zaloguj przez [Provider]", jest przekierowany do dostawcy, autoryzuje aplikację, wraca do aplikacji jako zalogowany.
    *   Test API: Bezpośrednie testowanie endpointu API (np. `POST /api/auth/register`, `POST /api/auth/login`, jeśli istnieją niestandardowe) z poprawnymi i błędnymi danymi (np. zły format emaila, krótkie hasło, istniejący email).
    *   Test Integracyjny: Sprawdzenie, czy po udanej rejestracji przez API/SDK, użytkownik pojawia się w tabeli `auth.users` w Supabase. Sprawdzenie działania RLS dla nowo zarejestrowanego użytkownika przy próbie dostępu do danych.
    *   Test Bezpieczeństwa: Weryfikacja polityki haseł, ochrona przed atakami brute-force na logowanie, poprawne zarządzanie sesją/tokenami JWT.
*   **Scenariusz 2: Zarządzanie Danymi (np. tworzenie/edycja/usuwanie elementu przez użytkownika)**
    *   Test E2E: Zalogowany użytkownik przechodzi do sekcji zarządzania danymi, klika "Dodaj nowy", wypełnia formularz (walidacja po stronie klienta), zapisuje, widzi nowy element na liście. Następnie edytuje ten element, zmieniając dane, zapisuje i widzi zmiany. Na koniec usuwa element i potwierdza operację, element znika z listy.
    *   Test API: Testowanie endpointów CRUD (`POST`, `GET /id`, `PUT/PATCH /id`, `DELETE /id` w `src/pages/api/`) dla danego zasobu. Sprawdzenie poprawności odpowiedzi dla różnych danych wejściowych (poprawne, niepoprawne - walidacja, brakujące pola). Testowanie pobierania listy elementów (`GET /`).
    *   Test Integracyjny: Weryfikacja, czy operacje API poprawnie modyfikują dane w odpowiednich tabelach Supabase. Sprawdzenie działania RLS - czy użytkownik A może modyfikować/usuwać dane użytkownika B (nie powinien).
    *   Test Jednostkowy: Testowanie logiki walidacji w formularzach React (`src/components`) oraz logiki biznesowej w serwisach (`src/lib`) odpowiedzialnych za przetwarzanie danych przed/po interakcji z bazą.
*   **Scenariusz 3: Interakcja z AI (Openrouter.ai przez `src/lib`)**
    *   Test E2E: Zalogowany użytkownik wykonuje akcję w UI (np. wpisuje prompt, klika przycisk "Generuj"), która wywołuje zapytanie do AI. Po chwili widzi wynik (wygenerowany tekst, analizę) wyświetlony w odpowiednim komponencie.
    *   Test Integracyjny (z mockowaniem AI): Wywołanie funkcji z `src/lib`, która komunikuje się z Openrouter. Sprawdzenie, czy funkcja poprawnie formatuje zapytanie do mocka API AI, obsługuje poprawną odpowiedź z mocka i zwraca przetworzone dane. Testowanie obsługi błędów zwracanych przez mock API AI (np. błąd 4xx, 5xx).
    *   Test Jednostkowy: Testowanie funkcji pomocniczych w `src/lib` odpowiedzialnych za przygotowanie danych wejściowych dla AI lub przetwarzanie odpowiedzi.
    *   Test API (jeśli istnieje dedykowany endpoint): Testowanie endpointu API, który wewnętrznie wywołuje logikę AI. Mockowanie wywołania do `src/lib` lub bezpośrednio do Openrouter API.
*   **Scenariusz 4: Wyświetlanie Stron i Layoutów (Astro `src/pages`, `src/layouts`)**
    *   Test E2E: Nawigacja między różnymi stronami zdefiniowanymi w `src/pages`. Weryfikacja, czy podstawowa struktura strony (nagłówek, stopka) zdefiniowana w layoucie (`src/layouts`) jest obecna na każdej stronie go używającej. Sprawdzenie, czy treść specyficzna dla danej strony jest poprawnie renderowana w odpowiednim miejscu (np. w `<slot />`).
    *   Test E2E (React Islands): Weryfikacja, czy interaktywne komponenty React (`client:load`, `client:visible` itp.) na stronach Astro ładują się i działają poprawnie (np. otwieranie menu, walidacja formularza po stronie klienta).
    *   Test Wizualnej Regresji: Porównanie zrzutów ekranu kluczowych stron i layoutów w różnych rozdzielczościach w celu wykrycia niezamierzonych zmian wizualnych.
    *   Test Wydajności (Lighthouse): Pomiar metryk Core Web Vitals dla najważniejszych stron generowanych przez Astro.
*   **Scenariusz 5: Logika Customowego Hooka React (`src/hooks`)**
    *   Test Jednostkowy (`@testing-library/react-hooks`): Wyrenderowanie hooka w środowisku testowym. Wywołanie funkcji zwracanych przez hooka z różnymi parametrami. Asercje dotyczące zwracanych wartości, stanu wewnętrznego hooka oraz wywołań efektów ubocznych (np. mockowanych zapytań fetch).
    *   Przykład: Testowanie hooka `useDataFetching(url)` - sprawdzenie stanu `loading`, `error`, `data` w różnych fazach zapytania (początkowy, w trakcie, sukces, błąd). Mockowanie `fetch`.
*   **Scenariusz 6: Działanie Middleware Astro (`src/middleware`)**
    *   Test Integracyjny/E2E: Próba dostępu do chronionej strony (`src/pages`) przez niezalogowanego użytkownika. Asercja, że użytkownik został przekierowany na stronę logowania (zgodnie z logiką w middleware).
    *   Test Integracyjny/E2E: Wykonanie zapytania do API (`src/pages/api`) bez wymaganego tokenu/autoryzacji. Asercja, że odpowiedź ma status 401/403 (zgodnie z logiką w middleware).
    *   Test Integracyjny (z mockowaniem kontekstu): Bezpośrednie wywołanie funkcji middleware z mockowanym obiektem `context` i `next`. Asercje dotyczące modyfikacji odpowiedzi (np. dodanie nagłówków) lub wyniku wywołania `next()`/przekierowania.
*   **Scenariusz 7: Interakcje z Bazą Danych przez Serwisy (`src/lib`, `src/db`)**
    *   Test Integracyjny (z bazą testową): Wywołanie funkcji z `src/lib` (np. `getUserData(userId)`), która korzysta z klienta Supabase skonfigurowanego w `src/db`. Wcześniejsze przygotowanie danych w testowej bazie Supabase. Asercja, że funkcja zwraca oczekiwane dane pobrane z bazy.
    *   Test Integracyjny (z mockowaniem SDK): Wywołanie funkcji z `src/lib`. Mockowanie metod klienta Supabase (`supabase.from(...).select()` itp.). Asercja, że funkcja wywołuje odpowiednie metody SDK z prawidłowymi parametrami i poprawnie przetwarza zwrócone (mockowane) dane/błędy.
*   **Scenariusz 8: Spójność Typów (`src/types.ts`)**
    *   Test API/Integracyjny: Wykonanie zapytania do endpointu API (`src/pages/api`). Asercja, że struktura i typy danych w odpowiedzi JSON są zgodne z definicjami typów eksportowanymi z `src/types.ts`. Można użyć walidacji schematu (np. Zod) opartej na tych typach.
    *   Proces Budowania (CI): Upewnienie się, że `tsc --noEmit` jest częścią pipeline'u CI, co weryfikuje poprawność typowania w całym projekcie, w tym użycie współdzielonych typów.

## 5. Środowisko Testowe

*   **Środowisko Deweloperskie:** Lokalne maszyny deweloperów (dla testów jednostkowych i integracyjnych uruchamianych lokalnie).
*   **Środowisko CI (Continuous Integration):** Github Actions. Testy jednostkowe i integracyjne uruchamiane automatycznie przy każdym pushu/pull requeście. Potencjalnie E2E na dedykowanym środowisku.
*   **Środowisko Stagingowe:** Odizolowana instancja aplikacji hostowana na DigitalOcean (lub podobnym środowisku), możliwie zbliżona do produkcji. Dedykowana baza danych Supabase (kopia struktury produkcyjnej, ale z danymi testowymi). Używane do testów E2E, wydajnościowych, UAT i manualnych testów eksploracyjnych.
*   **Środowisko Produkcyjne:** Ograniczone testy typu "smoke tests" po wdrożeniu nowej wersji.

## 6. Narzędzia do Testowania

*   **Frameworki Testowe:** Vitest (Unit/Integration), Playwright/Cypress (E2E, Visual Regression, API).
*   **Biblioteki Pomocnicze:** React Testing Library (Testowanie komponentów React), Supertest (Testy API w Node.js).
*   **Mockowanie/Stubowanie:** Mock Service Worker (MSW), natywne mocki Vitest/Jest.
*   **Testy Wydajnościowe:** Lighthouse, k6.
*   **Testy Bezpieczeństwa:** OWASP ZAP, narzędzia do skanowania zależności.
*   **Testy Kompatybilności:** BrowserStack/LambdaTest (opcjonalnie), narzędzia deweloperskie przeglądarek.
*   **Zarządzanie Testami i Błędami:** Jira, TestRail, Xray (lub inne narzędzie klasy TM/BTS), Github Issues.
*   **CI/CD:** Github Actions.

## 7. Harmonogram Testów

*   Testy jednostkowe i integracyjne będą tworzone równolegle z rozwojem kodu przez deweloperów.
*   Testy będą uruchamiane automatycznie w ramach pipeline'u CI/CD przy każdym pushu do repozytorium i przed każdym mergem do głównej gałęzi.
*   Testy E2E będą rozwijane iteracyjnie, pokrywając kluczowe funkcjonalności. Będą uruchamiane w CI (np. raz dziennie lub przed wdrożeniem na staging).
*   Sesje testów manualnych (eksploracyjnych, kompatybilności) będą przeprowadzane na środowisku stagingowym przed planowanym wydaniem nowej wersji.
*   Testy wydajnościowe i bezpieczeństwa będą przeprowadzane okresowo lub przed ważnymi wdrożeniami.
*   UAT będzie przeprowadzane na środowisku stagingowym po zakończeniu głównych prac deweloperskich i testów wewnętrznych dla danej wersji/funkcjonalności.

*Szczegółowy harmonogram zostanie dostosowany do planu rozwoju projektu.*

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów)

*   Dostępna dokumentacja wymagań/historyjek użytkownika.
*   Kod źródłowy dostępny w repozytorium.
*   Środowisko testowe (staging) przygotowane i dostępne.
*   Zakończone development danej funkcjonalności/modułu.
*   Pomyślnie zakończony proces budowania aplikacji.

### 8.2. Kryteria Wyjścia (Zakończenia Testów)

*   Wykonanie wszystkich zaplanowanych przypadków testowych dla danej wersji/wydania.
*   Osiągnięcie wymaganego pokrycia kodu testami (np. >80% dla testów jednostkowych/integracyjnych dla kluczowych modułów - do ustalenia).
*   Wszystkie krytyczne i wysokie błędy zostały naprawione i retestowane pomyślnie.
*   Liczba otwartych błędów o niższym priorytecie mieści się w akceptowalnych granicach (do ustalenia z zespołem/interesariuszami).
*   Pomyślne przejście testów akceptacyjnych użytkownika (UAT).
*   Dokumentacja testowa (raporty, status przypadków testowych) jest aktualna.

## 9. Role i Odpowiedzialności w Procesie Testowania

*   **Deweloperzy:**
    *   Tworzenie i utrzymanie testów jednostkowych i integracyjnych.
    *   Naprawianie błędów zgłoszonych przez QA/UAT.
    *   Uczestnictwo w przeglądach kodu pod kątem testowalności.
    *   Uruchamianie testów lokalnie przed wypchnięciem kodu.
*   **Inżynier QA (Tester):**
    *   Projektowanie i utrzymanie planu testów.
    *   Tworzenie i utrzymanie szczegółowych przypadków testowych.
    *   Tworzenie i utrzymanie testów automatycznych (E2E, API, wizualna regresja).
    *   Wykonywanie testów manualnych (eksploracyjnych, kompatybilności).
    *   Raportowanie i śledzenie błędów.
    *   Przygotowywanie raportów z postępu testów.
    *   Konfiguracja i utrzymanie środowisk testowych (we współpracy z DevOps/Dev).
    *   Przeprowadzanie testów wydajnościowych i podstawowych testów bezpieczeństwa.
*   **Product Owner/Manager:**
    *   Definiowanie kryteriów akceptacji dla funkcjonalności.
    *   Uczestnictwo w UAT.
    *   Priorytetyzacja naprawy błędów.
*   **Użytkownicy Końcowi/Interesariusze:**
    *   Uczestnictwo w UAT.
    *   Dostarczanie informacji zwrotnej na temat funkcjonalności i użyteczności.

## 10. Procedury Raportowania Błędów

*   Wszystkie znalezione defekty będą raportowane w systemie do śledzenia błędów (np. Github Issues, Jira).
*   Każdy raport o błędzie powinien zawierać:
    *   **Tytuł:** Krótki, zwięzły opis problemu.
    *   **Opis:** Szczegółowy opis błędu, kroki do reprodukcji (jasne i precyzyjne).
    *   **Środowisko:** Wersja aplikacji, przeglądarka/system operacyjny, środowisko (np. Staging).
    *   **Oczekiwany Rezultat:** Jak system powinien się zachować.
    *   **Rzeczywisty Rezultat:** Jak system się zachował.
    *   **Priorytet/Waga:** (np. Krytyczny, Wysoki, Średni, Niski) - wstępnie określony przez zgłaszającego, może być weryfikowany przez PO/ zespół.
    *   **Załączniki:** Zrzuty ekranu, nagrania wideo, logi (jeśli relevantne).
*   Cykl życia błędu: `Nowy` -> `W Analizie` -> `Do Naprawy` -> `W Trakcie Naprawy` -> `Do Retestu` -> `Zamknięty` / `Odrzucony` / `Ponownie Otwarty`.
*   Regularne spotkania (np. Bug Triage) w celu przeglądu i priorytetyzacji zgłoszonych błędów.