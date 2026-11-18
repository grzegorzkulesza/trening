# Trening na dziś

Statyczny PWA bez builda. Otwiera się `index.html`, który ładuje po kolei (wspólny zakres globalny):

- `css/styles.css`: style
- `js/core.js`: helpery, sprzęt i ciężary, ćwiczenia, plan
- `js/state-block.js`: stan i blok 4 tygodni (Linchpin)
- `js/session.js`: sesje, plan vs wykonane (Rx / Modified), wyniki
- `js/storage.js`: zapis w telefonie
- `js/sync-coach.js`: synchronizacja z arkuszem Google, Claude (reguły, prompt, zmiany planu)
- `js/views.js`: ekrany (dzień, notatka, podsumowanie)
- `js/progress.js`: poziomy, progres
- `js/ui.js`: skala wysiłku, arkusze, render, akcje, zdarzenia
- `js/boot.js`: start, blokada ekranu, sprawdzanie nowej wersji

Kolejność skryptów w `index.html` ma znaczenie. Wersja jest w `index.html` (`APP_VERSION` oraz `?v=` przy każdym pliku): przy wydaniu zmień ją wszędzie jednakowo, bo po niej aplikacja rozpoznaje, że jest nowa.
