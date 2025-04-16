<conversation_summary>
<decisions>
Użytkownik loguje się i po zalogowaniu trafia do widoku generowania fiszek z AI, gdzie może jednostkowo akceptować, edytować lub odrzucać propozycje, a finalny zapis następuje w postaci bulk ("Zapisz wszystkie" lub "Zapisz zatwierdzone").
Kluczowe widoki obejmują ekran autoryzacji (logowania/rejestracji), dashboard, widok generowania fiszek, widok listy fiszek (z możliwością edycji i usuwania), panel użytkownika oraz ekran sesji powtórkowych.
Użytkownik będzie miał możliwość wylogowania się oraz przejścia do listy wcześniej wygenerowanych fiszek.
Formularze będą zawierały walidację po stronie HTML, z komunikatami błędów wyświetlanymi inline oraz użyciem toast message dla błędów autoryzacji.
Panel użytkownika wyświetli liczbę zaakceptowanych fiszek, liczbę sesji nauki oraz liczbę nauczonych słówek.
Interfejs zostanie zbudowany przy użyciu gotowych komponentów Shadcn/ui, z topbar Navigation Menu jako głównym elementem nawigacji.
Zarządzanie stanem będzie oparte na React hooks i React Context, z możliwością dodania Zustand w przyszłości.
Mechanizmy buforowania i paginacji nie będą wdrożone na początkowym etapie, aby przyspieszyć implementację.
Responsywność interfejsu zostanie osiągnięta przy użyciu utility variants Tailwind (sm:, md:, lg: itd.).
Integracja JWT dla zabezpieczeń zostanie wdrożona w późniejszym etapie rozwoju.
</decisions>
<matched_recommendations>
Zdefiniować wyraźny przepływ użytkownika od ekranu logowania, przez widok generowania fiszek, aż po finalny bulk zapis.
Utworzyć oddzielne widoki dla ekranu autoryzacji, dashboardu, generowania fiszek, listy fiszek oraz panelu użytkownika, a także ekran sesji powtórkowych.
Wdrożyć formularze z walidacją HTML i inline komunikatami błędów oraz dedykowanymi ekranami błędów (500, 404) z toast message dla błędów autoryzacji.
Wykorzystać gotowe komponenty Shadcn/ui oraz utility variants Tailwind CSS dla responsywnego i spójnego designu.
Skonfigurować topbar Navigation Menu w oparciu o priorytety najważniejszych sekcji (dashboard, sesje, panel użytkownika).
Zastosować wbudowane zarządzanie stanem przy użyciu React hooks i React Context, z możliwością rozbudowy do Zustand w przyszłości.
Zaplanować przyszłą integrację mechanizmów JWT do zabezpieczania sesji użytkownika.
</matched_recommendations>
<ui_architecture_planning_summary>
Główne wymagania dotyczące architektury UI obejmują intuicyjny przepływ użytkownika zaczynający się od ekranu logowania, poprzez widok generowania fiszek, aż do panelu z listą fiszek oraz sesji powtórkowych.
Kluczowe widoki to ekran autoryzacji, dashboard, widok generowania fiszek, widok listy fiszek z interaktywną edycją (inline) oraz usuwaniem, panel użytkownika prezentujący statystyki (akceptowane fiszki, sesje nauki, nauczone słówka) oraz ekran sesji powtórkowych.
Strategia integracji z API zakłada komunikację z endpointami REST API (np. generowanie flashcards, pobieranie historii, edycja/usuwanie) z synchronizacją stanu realizowaną poprzez React hooks i Context, przy czym mechanizmy paginacji czy buforowania nie będą wdrożone na początkowym etapie.
Aspekty responsywności zostaną zrealizowane przy użyciu Tailwind CSS z wariantami responsywnymi (sm:, md:, lg:), a dostępność będzie wspierana przez domyślne mechanizmy dostarczane przez Shadcn/ui. Bezpieczeństwo UI będzie początkowo oparte na mechanizmach autoryzacji (flash message przy błędach, standardowe komunikaty) z planowaną przyszłą integracją JWT.
Kluczową częścią interfejsu jest topbar Navigation Menu oparty na Shadcn/ui, które umożliwi użytkownikowi łatwe przełączanie się między głównymi sekcjami, uwzględniając priorytety jak dashboard, lista fiszek i panel użytkownika.
</ui_architecture_planning_summary>
<unresolved_issues>
Szczegółowe priorytety i zawartość topbar Navigation Menu wymagają dalszego doprecyzowania, aby określić, które sekcje są najważniejsze dla użytkowników.
Dokładne wymagania dotyczące funkcjonalności ekranu sesji powtórkowych nie zostały szczegółowo omówione i mogą wymagać dalszych ustaleń na kolejnych etapach.
</unresolved_issues>
</conversation_summary>
