<conversation_summary>
<decisions>
Kluczowe encje to: users (zarządzani przez Supabase Auth), flashcards, generations oraz generation_error_logs.
Użytkownicy będą posiadać dodatkowe informacje, takie jak data rejestracji, przy czym supabase auth obsługuje podstawowe dane uwierzytelniające.
Tabela flashcards będzie przechowywać dane: front (do 200 znaków), back (do 500 znaków), status (np. "accepted" lub "rejected"), source (dozwolone wartości: "ai-full", "ai-edited", "manual"), created_at, updated_at oraz opcjonalne odniesienie (generation_id) do tabeli generations.
Tabele generations i generation_error_logs będą przechowywać pełne logi operacji generacji; generation_error_logs dodatkowo zawierać będzie status operacji, kod błędu oraz error message.
Relacje: jeden użytkownik może mieć wiele flashcards; flashcards należą wyłącznie do jednego użytkownika; jeden rekord z generations może generować wiele flashcards; generation_error_logs powiązane są z pojedynczym rekordem generations.
Usuwanie rekordów ma działać kaskadowo – usunięcie użytkownika skutkuje usunięciem powiązanych flashcards, generations oraz generation_error_logs.
Wszystkie tabele powinny stosować UUID jako klucze główne.
Indeksy mają być stworzone na kluczach obcych (user_id, generation_id) oraz na kolumnach używanych w filtracji (status, source).
Zasady bezpieczeństwa RLS będą oparte na kolumnie user_id, zapewniając dostęp użytkownikom tylko do ich własnych danych.
Auditing ograniczy się do automatycznej aktualizacji timestampów, głównie pola updated_at za pomocą triggerów.
</decisions>
<matched_recommendations>
Utworzenie tabel flashcards, generations oraz generation_error_logs z odpowiednimi ograniczeniami (check constraints dla długości tekstu i dozwolonych wartości).
Zastosowanie UUID jako kluczy głównych we wszystkich tabelach dla lepszej skalowalności.
Implementacja kaskadowego usuwania rekordów powiązanych z użytkownikiem.
Dodanie indeksów na kolumnach kluczy obcych i często używanych polach do filtrowania (np. status, source).
Wdrożenie triggerów do automatycznej aktualizacji pola updated_at.
Egzekwowanie zasad bezpieczeństwa na poziomie wierszy (RLS) przy użyciu kolumny user_id.
</matched_recommendations>
<database_planning_summary>
Główne wymagania dotyczące schematu bazy danych obejmują utworzenie tabel dla: users (zarządzanych przez Supabase Auth), flashcards, generations oraz generation_error_logs. Tabela flashcards będzie przechowywać front i back tekst ograniczony odpowiednio do 200 i 500 znaków, status operacji, typ źródła oraz metadane audytu (created_at, updated_at) z opcjonalnym odniesieniem do rekordów z tabeli generations. Tabele generations i generation_error_logs są odpowiedzialne za przechowywanie pełnych logów operacji generacji, przy czym generation_error_logs dodatkowo zawierają status operacji, kod błędu i wiadomość błędu. Relacje są zaprojektowane w modelu jeden-do-wielu (użytkownik-do-flashcards, generation-do-flashcards, generation-do-generation_error_logs). Kluczowymi aspektami są zastosowanie UUID dla kluczy głównych, wdrożenie kaskadowego usuwania rekordów, dodanie indeksów na kluczach obcych i często filtrowanych kolumnach oraz implementacja zasad bezpieczeństwa RLS opartej na user_id. Auditing realizowany jest poprzez automatyczną aktualizację pola updated_at za pomocą triggerów.
</database_planning_summary>
<unresolved_issues>
Brak nierozwiązanych kwestii – wszystkie aspekty MVP zostały doprecyzowane.
</unresolved_issues>
</conversation_summary>
