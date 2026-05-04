# ScaDispatchListTV

## Cel projektu

ScaDispatchListTV to aplikacja ASP.NET Core MVC wyświetlana na ekranie TV w magazynie. Dashboard pokazuje dzienne pozycje wysyłkowe/magazynowe oraz ich aktualny status gotowości.

Aplikacja jest zoptymalizowana pod czytelność z większej odległości: duża tabela, prosty ciemny wygląd, statusy kolorystyczne i automatyczne przewijanie listy.

## Technologie

- ASP.NET Core MVC
- .NET 6 / `net6.0`
- SQL Server
- IIS + ASP.NET Core Hosting Bundle

Uwaga: `net6.0` jest już poza okresem wsparcia. Migrację do wspieranej wersji .NET LTS należy potraktować jako osobne przyszłe zadanie, niezależne od bieżących poprawek dashboardu.

## Źródło danych SQL

Poprawny widok SQL używany przez aplikację:

```text
SmayDB.dbo.ExScaDispatchListTV_WMS
```

Nie używać starych lub błędnych źródeł:

```text
SmayDB.dbo.ExScaDispatchListWMS_TEMP
SmayDB.dbo.ExScaDispatchListWMS
```

`ExScaDispatchListWMS_TEMP` był historycznym/błędnie nazwanym obiektem. Gdy brakowało go w bazie, aplikacja mogła kończyć się błędem `Invalid object name`.

## Aktualne zapytanie SQL

Metoda `HomeController.FetchData()` używa obecnie:

```sql
SELECT TOP (100)
    Klient,
    Zamówienie,
    Nazwa,
    [Il.zam],
    ISNULL(Got, 0) AS Got,
    [Data wys]
FROM SmayDB.dbo.ExScaDispatchListTV_WMS
WHERE [Data wys] = CAST(GETDATE() AS date)
ORDER BY Klient, Zamówienie
```

Ważne: wiersze z `Got = 100` muszą pozostać widoczne. Nie dodawać filtra typu:

```sql
AND ISNULL(Got, 0) < 100
```

## Reguły biznesowe i prezentacja danych

- Pokazywane są pozycje dla dzisiejszej daty `[Data wys]`.
- Wyświetlane jest maksymalnie `TOP (100)` wierszy.
- Pozycje zakończone, czyli `Got = 100`, nadal są wyświetlane.
- Gotowość jest pokazana jako badge:
  - `0%` - czerwony
  - `1-99%` - pomarańczowy/żółty
  - `100%` - zielony

## Zachowanie dashboardu TV

- Strona odświeża się automatycznie co `300` sekund, czyli co 5 minut.
- Lista przewija się automatycznie.
- Auto-scroll przewija dedykowany kontener tabeli, a nie całe okno przeglądarki.
- Ręczne przewijanie przez użytkownika zatrzymuje auto-scroll.
- Auto-scroll wznawia się po czasie bezczynności.
- Pasek postępu pokazuje aktualną pozycję przewinięcia listy.
- Nagłówek pokazuje datę, czas ostatniego renderowania/odświeżenia oraz liczbę aktualnie wyświetlanych wierszy.

## Formatowanie UI

- `[Il.zam]` jest wyświetlane bez nadmiarowych miejsc po przecinku.
- `Got` jest wyświetlane jako procent.
- `[Data wys]` jest wyświetlane w formacie `dd.MM.yyyy`.
- Długie teksty mogą być ucinane wielokropkiem, aby zachować czytelność na ekranie TV.
- Interfejs jest projektowany pod ekran magazynowy, nie jako klasyczny panel administracyjny.

## Publikacja i wdrożenie

Praktyczna sekwencja publikacji:

1. W razie potrzeby zatrzymać lokalnie uruchomioną aplikację przed buildem.
2. Wykonać Build/Rebuild.
3. Opublikować aplikację w konfiguracji Release.
4. Na IIS zatrzymać stronę lub Application Pool.
5. Wykonać kopię zapasową aktualnego folderu produkcyjnego.
6. Skopiować opublikowane pliki.
7. Uruchomić stronę lub Application Pool.
8. Zweryfikować działanie w przeglądarce.

Przykład kopii zapasowej PowerShell:

```powershell
Compress-Archive C:\inetpub\wwwroot\ScaDispatchListTV C:\backup\ScaDispatchListTV_before_publish.zip
```

Nie umieszczać w repozytorium haseł, connection stringów ani innych danych wrażliwych.

## Częsty problem przy buildzie

Możliwy błąd:

```text
Could not copy apphost.exe to ScaDispatchListTV.exe
The file is locked by: "ScaDispatchListTV (PID)"
```

Oznacza to, że działający proces aplikacji blokuje plik `.exe`. Należy zatrzymać uruchomiony proces, a potem ponowić build.

Polecenia pomocnicze:

```powershell
Get-Process ScaDispatchListTV -ErrorAction SilentlyContinue | Stop-Process -Force
```

Albo dla konkretnego PID:

```powershell
Stop-Process -Id <PID> -Force
```

## Znane ostrzeżenia

- `NETSDK1138` - `net6.0` jest poza wsparciem.
- Mogą występować ostrzeżenia nullable w `HomeController.cs`.
- Może występować ostrzeżenie `CA2200` związane z `throw ex`.

Te ostrzeżenia nie blokują bieżącej publikacji, ale powinny zostać obsłużone w ramach przyszłych prac utrzymaniowych.

## Ważne pliki

- `ScaDispatchListTV/Controllers/HomeController.cs` - pobieranie danych z SQL Server.
- `ScaDispatchListTV/Views/Home/Index.cshtml` - widok dashboardu TV i formatowanie wartości.
- `ScaDispatchListTV/wwwroot/css/site.css` - układ TV, kolory, tabela, badge i czytelność.
- `ScaDispatchListTV/wwwroot/js/site.js` - automatyczne przewijanie, pauza po interakcji i pasek postępu.
- `ScaDispatchListTV/appsettings.json` - konfiguracja aplikacji, w tym ustawienia połączeń.
- `ScaDispatchListTV/ScaDispatchListTV.csproj` - konfiguracja projektu .NET.
- `ScaDispatchListTV.sln` - rozwiązanie Visual Studio.
- `web.config` - używany przez IIS w opublikowanym folderze aplikacji; może być generowany podczas publish.
