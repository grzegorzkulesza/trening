"use strict";
/* ---------- sync with Google Sheets (Apps Script web app) ---------- */
const KEY_URL = "trening:sync:url", KEY_Q = "trening:sync:queue", KEY_PR = "trening:pending-review";
/* ---------- Claude coach: rules, prompt and plan changes live in the app, so they update with it ---------- */
const COACH_MODEL = "claude-sonnet-5-5";
const COND_RULES = "To sesja Conditioning (osobna od Strength, wtorek Intervals, czwartek Steady; robi ją nieregularnie). " +
  "Intervals (cond-int, reps = liczba rund): 6 → 8 → 10 → 12; przy 12 łatwych zaproponuj w tekście dłuższy odcinek mocny, nie zmieniaj go sam. Wariant to sprzęt (row-int, run-int, rope-int): ustaw ten, którego używał, jeśli mówi o tym w notatce. " +
  "Steady (cond-steady, reps = minuty): 20 → 25 → 30 → 35 → 40 → 45; wyżej nie. Tempo ma pozwalać mówić pełnymi zdaniami; jeśli pisze, że brakowało tchu, nie podnoś. " +
"Test Row 2000 m (row-2k, cond-test): sprawdzian poziomu; planu na jego podstawie nie zmieniaj, oceń tylko rozłożenie tempa. " +
  "Zmieniaj tylko slot z dzisiejszej sesji. Pole rounds pomiń. Jeśli w notatce albo na zdjęciu jest dystans albo tempo na 500 m, odnieś się do niego i porównaj z poprzednimi (pole pm5). " +
  "Wysiłek (pole wysilek, skala 1–5): Steady powinien wyjść na 2 (Lekko, tempo rozmowy); wyżej znaczy, że tempo było za szybkie. " +
  "Postęp w Steady to więcej metrów w tym samym czasie przy tempie rozmowy (i tym samym albo niższym tętnie, jeśli widać); w Intervals równe albo szybsze odcinki mocne.\n";
const BASE_RULES = "Jesteś spokojnym, rzeczowym trenerem Grzegorza (47 lat, wraca do treningu po przerwie, trenuje w domu obwodowo w stylu CrossFit z krótkimi przerwami; ten styl zostaje). " +
  "Oceń jego dzisiejszy trening na podstawie notatki (dyktowana, mogą być błędy rozpoznawania mowy: odczytaj sens) i zdecyduj o planie na następny trening.\n" +
  "Zasady: każda seria z zapasem 2–3 powtórzeń, technika kończy serię. Najwyżej jedna zmiana na ćwiczenie i tylko taka, która wynika z notatki. Za łatwe: krok w górę. Trudne, ból albo sypiąca się technika: zostaje albo krok w dół; przy bólu stawu nie podnoś i dodaj w tekście, żeby skonsultował się z fizjoterapeutą, jeśli wraca. " +
  "Jeśli w notatce zrobił już trudniejszy wariant i poszło dobrze, przestaw plan na ten wariant. Rundy: nigdy ich nie dodawaj; możesz je tylko zmniejszyć, gdy robi mniej, przy zmęczeniu albo gdy trening nie mieści się w czasie. Progresja wyłącznie ciężarem, powtórzeniami albo trudniejszym wariantem. Ćwiczeń oznaczonych zamianaNaDzis nie przenoś do planu.\n" +
  "Strength ma dwa obwody na zmianę (pole plan): A, przysiad i pchanie (Front Squat, Bulgarian Split Squat, KB Clean & Press, Push-up, AbMat Sit-up), i B, hinge i przyciąganie (Deadlift, KB Swing, Band-assisted Pull-up, Ring Row, Suitcase Carry). Zmieniaj tylko obwód z dzisiejszej sesji. " +
  "Progresje: Clean & Press: najpierw powtórzenia do 16 (8 na rękę), potem kb-strict-press, potem 20 kg. Pull: key row: ring-row → pullup-negative → band-pullup → pullup; Ring Row zawsze z ringami na wysokości bioder, nigdy ring-row-box, archer-ring-row ani sa-ring-row; gdy Ring Row jest za łatwy, następny krok to skalowane podciąganie, nie trudniejszy Ring Row; key vpull: band-pullup → pullup-negative → pullup. AbMat Sit-up: powtórzenia do 25, potem hollow-rock. " +
  "Push: incline-pushup-75 → knee-pushup → pushup-negative → pushup (do 12) → ring-dip. Swing: 20 kg do × 20, potem kb-swing-1a 20 kg; nie proponuj kupowania 24 kg. Bulgarian Split Squat: najpierw powtórzenia do 20 (10 na nogę), potem ciężar; ogranicza go równowaga w butach barefoot, to zamierzone. " +
  "Suitcase Carry (reps to metry łącznie, na obie ręce): 40 → 60 → 80 m, potem 20 kg od 40 m, potem farmer-carry 2 × 15 kg. " +
  "Sztanga (gryf 20 kg, bumpery, stojaki; kody ciężaru bb + kg, np. bb62.5, od bb20 do bb127.5 co 2,5 kg): w obwodzie A Front Squat (key bb-fs), w B Deadlift (key bb-dl). " +
  "Na sztangę zawsze 5 reps na rundę. Za łatwo: Deadlift +5 kg, Front Squat +2,5 kg. Trudno, sypiąca się technika, okrągłe plecy albo ból: ten sam ciężar albo −5 kg. Nie dokładaj szybciej, niż wynika z notatki; technika ważniejsza niż kilogramy. " +
"Budżet: cały trening Strength najwyżej 45 min, razem z Warm-up; cel około 35–40 min. Finisher (EMOM na końcu, pole finisher) rośnie sam co tydzień o 2 min, od 4 do 10 min. Gdy czas zbliża się do 45 min, progresja tylko ciężarem albo trudniejszym wariantem, nie powtórzeniami; gdy go przekracza, ustaw pole fin (najdłuższy finisher w minutach, 0–10) niżej. " +
  "Czas treningu (pole czas: cały trening, od początku Warm-up do końca ostatniej rundy, razem z seriami rozgrzewkowymi na sztandze) to druga miara obok ciężaru: mówi, jak szybko regeneruje się między ćwiczeniami i rundami. " +
  "Porównuj go z poprzednimi treningami o tym samym składzie (ten sam obwód, A albo B, wraca co drugi trening) i z szacunkiem aplikacji (pole szacunek). " +
  "Ten sam plan w krótszym czasie i bez trudności w notatce: podnieś ciężar albo trudność, nie skracaj czasu dalej. Czas rośnie przy tym samym planie albo notatka mówi o zmęczeniu: nie podnoś. Bez czasu oceniaj jak dotąd. " +
  "Wysiłek (pole wysilek): jego ocena całej sesji w jednej skali 1–5: 1 bardzo lekko, 2 lekko (zapas 3 i więcej powtórzeń, swobodna rozmowa), 3 w sam raz (zapas około 2), 4 ciężko (zapas 0–1, urywany oddech), 5 maksymalnie. Porównuj z poprzednimi sesjami: ten sam plan przy niższym wysiłku to gotowość do progresji; wysiłek 5 albo ciągle 4 przy słabszych wynikach: nie podnoś. Notatka mówi więcej o szczegółach, wysiłek o całości. " +
  "Zmieniaj tylko key z dzisiejszej sesji. Nie dodawaj nowych ćwiczeń, nie zmieniaj Mobility, bez głośnych ćwiczeń. Konkretne liczby, bez zakresów. Nazwy ćwiczeń, wzorców i rodzajów sesji zawsze po angielsku (np. Strength, Conditioning, Mobility, rounds, reps, Push-up zamiast pompki), reszta tekstu po polsku, bez moralizowania i motywowania.\n";
const BLOCK_RULES = "Jesteś spokojnym, rzeczowym trenerem Grzegorza (47 lat, wraca do treningu po przerwie, trenuje w domu; CrossFit zna od 2016). " +
  "Programujesz metodą Linchpin (Pat Sherwood, How to Program Workouts): bloki po 4 tygodnie zaplanowane dzień po dniu; każdy element ma cel, nic zbędnego; ciężko to mało powtórzeń i mała objętość, średnio to średnio, lekko to dużo; serie na tyle małe, żeby nie stał przy sprzęcie; trening, nie test, więc bez maksów; patrzysz wstecz i do przodu. " +
  "Tydzień Pn–Pt bez dnia wolnego w środku, więc zmęczenie rozkłada program: Pn Heavy na nogi (klasycznie albo Heavy @ HR, tylko w poniedziałek), Wt Engine, Śr Heavy na górę z przyciąganiem, Cz lekko i długo, Pt średnio. Ani żadna część ciała, ani tętno nie są ciężko dwa dni z rzędu; piątek nigdy nie jest ciężki. Każdy dzień ma planowany wysiłek (pole planowanyWysilek, ta sama skala 1–10 co pole wysilek).\n" +
  "Oceń dzisiejszy trening z notatki (dyktowana, mogą być błędy rozpoznawania mowy: odczytaj sens), wyniku (pole wynik), wysiłku i zdjęcia, a potem dopasuj najbliższe dni bloku. Struktury dni nie zmieniasz (formaty, rundy, kolejność, ćwiczenia zostają); zmieniasz tylko ciężar i powtórzenia pozycji z listy nadchodzących dni oraz warianty gimnastyczne (pole variants). Najwyżej jedna zmiana na pozycję i tylko taka, która wynika z dzisiejszego treningu.\n" +
  "Zasady: każda seria z zapasem 2–3 powtórzeń, technika kończy serię. Klasyczny ciężki dzień (format jak 5-5-5-5-5 albo 3-3-3-3-3, ciężar w planie to pierwsza seria robocza): w polu done podaj najcięższą serię, którą zrobił; następny ciężki dzień tego samego boju zacznij wyżej, gdy dziś ostatnia seria była łatwa, a niżej albo tak samo, gdy technika się sypała. Heavy @ HR: ciężar ma być ciężki, ale do zrobienia seriami; gdy rozbijał na pojedyncze powtórzenia albo długo stał, niżej. " +
  "Wysiłek porównuj z planowanym (też 1–5). Skala jest gruba, więc o jeden stopień w górę to normalny rozrzut: bez zmian w planie. Wyższy o 2 i więcej albo wyraźne zmęczenie w notatce: odciąż tylko najbliższe 2 dni treningowe i tylko pozycje, które obciążają te same części ciała co dziś (weekend to odpoczynek, więc po piątku zwykle nic). Niższy o 1 przy dobrej technice i zapasie z notatki: możesz podnieść jedną pozycję o jeden krok; niższy o 2 i więcej: wyraźniej. Liczy się zapas powtórzeń z notatki bardziej niż sama liczba. W AMRAP-ie i for time wysiłek zależy od rozłożenia tempa: gdy pracował bez przerw i wyszło za ciężko, napisz, jak rozbijać serie, zamiast obniżać plan. Rozbijanie serii w ostatnich rundach to zwykłe zmęczenie, nie powód do łatwiejszego wariantu ani mniejszej liczby powtórzeń; w dół tylko wtedy, gdy sypała się technika albo nie dał rady zrobić powtórzeń. Nie zmieniaj ćwiczeń, których dziś nie było, z powodu dzisiejszego wysiłku. W klasycznym ciężkim dniu (5-5-5-5-5, 3-3-3-3-3) powtórzenia są częścią formatu: zmieniasz tylko ciężar. Miara zależy od formatu (pole format), nie od czasu trwania. AMRAP trwa tyle, ile mówi format, więc miarą jest wykonana praca: pełne rundy i powtórzenia; porównuj je z poprzednimi AMRAP-ami. EMOM też ma stały czas i stałą liczbę powtórzeń na początku każdej minuty: liczy się, czy każda minuta była zrobiona i ile odpoczynku zostawało (z notatki); gdy nie zdążał, mniej powtórzeń albo łatwiejszy wariant. Death by: wynikiem jest ostatnia pełna minuta N; w minucie n robi n powtórzeń, więc praca rośnie z każdą minutą (łącznie N(N+1)/2), a późne minuty ważą wielokrotnie więcej niż pierwsze; porównuj N i dokładkę, nie czas. For time: wynikiem jest czas samego treningu bez Warm-up. For time, or not: czas tylko wtedy, gdy go mierzył. Not for time: bez wyniku, oceniasz wysiłek (ma być niski) i notatkę. Interwały i części for time: liczą się czasy odcinków (przerwy nie), ich równość i spadek tempa. Steady: stały czas, miarą jest dystans i średnie tempo na 500 m przy niskim wysiłku. Klasyczny ciężki dzień: miarą są ciężary serii, czas nie ma znaczenia. Pole czasTrwania to długość samego treningu: stała z formatu albo szacunek; 45 min to sufit, nie cel. Gdy jest lista „Ten sam trening wcześniej”, porównaj wynik z nią (benchmark) i uwzględnij różnice w ciężarze i wariancie. " +
  "Warianty (variants): przy łatwych seriach krok w górę po drabince danego slotu, w dół tylko z powodów opisanych wyżej. Wariant i powtórzenia tego samego slotu to dwie zmiany tej samej pozycji: wybierz jedną. Przy bólu stawu nie podnoś i dodaj w tekście, żeby skonsultował się z fizjoterapeutą, jeśli wraca. Bez głośnych ćwiczeń. Konkretne liczby, bez zakresów. " +
  "Ćwiczenia jednorącz, na jedną nogę i na stronę zapisujesz łącznie, nigdy per side: 5 na każdą rękę to × 10; pola reps w danych i w odpowiedzi też są łączne. Sztanga: gryf 20 kg, bumpery, kody ciężaru bb + kg, od bb20 do bb127.5 co 2,5 kg; Deadlift zmieniaj co 5 kg, przysiady i wyciskania co 2,5 kg. Nazwy ćwiczeń i rodzajów sesji po angielsku (Strength, Conditioning, Heavy, Engine, rounds, reps), reszta po polsku, bez moralizowania i motywowania.\n";
const VAR_SLOTS = ["row", "vpull", "push", "core"];
// Ladders of the gymnastics slots used by the block (row and vpull share a pattern, so they need their own).
const VAR_LADDER = {row:["ring-row", "pullup-negative", "band-pullup", "pullup"], vpull:["band-pullup", "pullup-negative", "pullup"],
  push:["incline-pushup-75", "knee-pushup", "pushup-negative", "pushup", "ring-dip"], core:["abmat-situp", "hollow-rock"]};
const varLadder = k => { const sl = slotByKey(k); return (VAR_LADDER[k] || []).filter(id => EX[id] && (sl && id === sl.ex || exAvailable(EX[id]))); };
const addDays = (dateStr, n) => { const d = parseYmd(dateStr); d.setDate(d.getDate() + n); return ymd(d); };
const loadsText = ids => JSON.stringify(ids, (k, v) => Array.isArray(v) && v.length > 8 && v.every(x => LOADS[x] && LOADS[x].bb) ? v[0] + " … " + v[v.length - 1] + " (co 2,5 kg)" : v);
// PM5 numbers as Claude read them from the photo: times "m:ss(.d)" to seconds, the rest to whole numbers within sane ranges.
function cleanPm5(p){
  if (!p || typeof p !== "object") return null;
  const t = v => { const m = String(v || "").match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,]\d)?$/); return m ? (+(m[1] || 0)) * 3600 + +m[2] * 60 + +m[3] : null; };
  const n = (v, lo, hi) => { const x = Math.round(+v); return x >= lo && x <= hi ? x : null; };
  const one = q => q && typeof q === "object" ? {time:t(q.time), dist:n(q.dist, 1, 100000), split:t(q.split), spm:n(q.spm, 10, 60), hr:n(q.hr, 40, 220)} : null;
  const r = one(p); if (!r || !(r.time || r.dist)) return null;
  r.parts = (Array.isArray(p.parts) ? p.parts : []).slice(0, 30).map(one).filter(x => x && (x.time || x.dist));
  return r;
}
// Score that was only in the note or on the PM5 photo goes into the empty fields; what he typed stays.
function fillScore(s, w, pm){
  const t = scoreType(s); if (!t) return false;
  const sc = s.score || (s.score = {}), sec = v => { const m = String(v || "").match(/^(\d{1,2}):(\d{2})/); return m && +m[2] < 60 ? +m[1] * 60 + +m[2] : null; };
  const int = (v, hi) => { const n = parseInt(v, 10); return n >= 0 && n <= hi ? n : null; };
  let ch = false; const set = (k, v) => { if (v != null && sc[k] == null){ sc[k] = v; ch = true; } };
  w = w && typeof w === "object" ? w : {};
  if (t.k === "amrap" || t.k === "deathby"){ set("rounds", int(w.rounds, 99)); if (w.rounds != null) set("reps", int(w.reps, 999) || 0); }
  if (t.k === "fortime" || t.k === "ftornot"){ const v = sec(w.time); if (v){ set("time", v); if (t.k === "ftornot" && sc.time === v) sc.ft = true; } }
  if (t.k === "intervals"){ const ts = Array.isArray(w.times) ? w.times.map(sec) : [], cardio = (s.items || []).every(it => /^cond-/.test(exOf(it.ex).pattern));
    const parts = cardio && pm && pm.parts && pm.parts.length === t.n ? pm.parts.map(p => p.time) : [];
    for (let i = 0; i < t.n; i++) set("t" + i, ts[i] || parts[i] || null); }
  if (t.k === "steady") set("dist", int(w.dist, 30000) || (pm && pm.dist) || null);
  return ch;
}
// Does the note give this number, as digits ("42,5", "60") or in words ("sześćdziesiąt", "czterdzieści dwa i pół")?
const PL_UNITS = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"];
const PL_TEENS = ["dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
const PL_TENS = ["", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
function plWords(n){
  if (n >= 100) return "sto" + (n % 100 ? " " + plWords(n % 100) : "");
  if (n < 10) return PL_UNITS[n]; if (n < 20) return PL_TEENS[n - 10];
  return PL_TENS[Math.floor(n / 10)] + (n % 10 ? " " + PL_UNITS[n % 10] : "");
}
function noteHasNumber(note, n){
  const t = String(note || "").toLowerCase().replace(/\s+/g, " "), whole = Math.floor(n), half = n - whole >= 0.5;
  const digits = half ? whole + "[.,]5" : String(whole);
  if (new RegExp("(^|[^0-9])" + digits + "(?![0-9])").test(t)) return true;
  if (whole < 1 || whole > 199) return false;
  const w = plWords(whole) + (half ? " i pół" : "");
  return t.includes(w);
}
const Coach = {
  group: s => s.block ? "block" : s.kind === "cond" ? "cond" : "circuit",
  allowed(group){
    const out = {};
    slotsOf(group).forEach(sl => {
      const ids = ladderOf(sl).filter(id => EX[id] && (id === sl.ex || exAvailable(EX[id])));
      if (!ids.includes(sl.ex) && EX[sl.ex]) ids.unshift(sl.ex);
      out[sl.key] = Object.fromEntries(ids.map(id => [id, loadsOf(EX[id])]));
    });
    return out;
  },
  // Barbell load lists are long: one line instead of 44 codes.
  allowedText(group){ return JSON.stringify(this.allowed(group), (k, v) => Array.isArray(v) && v.length > 8 && v.every(x => LOADS[x] && LOADS[x].bb) ? v[0] + " … " + v[v.length - 1] + " (co 2,5 kg)" : v); },
  brief: x => ({data:x.date, rodzaj:kindLabel(x.kind), typ:x.block ? BLOCK_TITLE[x.block.type] : undefined, format:x.block ? x.block.parts.map(p => p.fmt).join(" | ") : undefined, planowanyWysilek:x.block ? x.block.effort + " (" + EFF_TXT[x.block.effort] + ")" : undefined,
    plan:x.kind === "strength" && !x.block ? planOfSession(x) || undefined : undefined, rundy:x.block ? undefined : x.rounds, finisher:x.fin ? "EMOM " + x.fin.min + " rund: " + exOf(x.fin.ex).name + " " + finDose(x.fin) : undefined, wykonanie:x.kind !== "mobility" ? (sessionMod(x) ? "Modified" : "Rx") : undefined, zmianyWzgledemPlanu:x.kind !== "mobility" && modLines(x).length ? modLines(x) : undefined, notatka:x.note || "", wynik:x.block ? scoreBrief(x) : undefined, czas:!x.block && x.dur ? mmss(x.dur) : !x.block && x.timed === false && x.kind === "strength" ? "nie mierzony" : undefined, wysilek:effOf(x) ? effOf(x) + " (" + EFF_TXT[effOf(x)] + ")" : undefined, czasTrwania:x.block ? blockTime(x.block) || "do pierwszej niezrobionej minuty" : undefined, szacunek:!x.block && x.kind === "strength" ? estMin("strength", x.items || [], x.rounds, x.fin) + " min" : undefined,
    pm5:x.pm5 ? pm5Text(x.pm5) + (x.pm5.parts && x.pm5.parts.length ? " | odcinki: " + x.pm5.parts.map(pm5Text).join("; ") : "") : undefined, cwiczenia:(x.items || []).map(it => ({key:it.key, ex:it.ex, nazwa:exOf(it.ex).name, dawka:doseText(it.ex, it.load, it.reps), plan:it.planEx && (it.planEx !== it.ex || it.planLoad !== it.load || it.planReps !== it.reps) ? exOf(it.planEx).name + " " + doseText(it.planEx, it.planLoad, it.planReps) : undefined, zamianaNaDzis:it.swap ? true : undefined}))}),
  upcoming(s){
    const out = [];
    for (let i = 1; i <= 14; i++){ const date = addDays(s.date, i), b = blockDay(date); if (!b) continue;
      out.push({data:date, dzien:DAYS[parseYmd(date).getDay()], rodzaj:kindLabel(blockKind(b)), typ:BLOCK_TITLE[b.type], planowanyWysilek:b.effort + " (" + EFF_TXT[b.effort] + ")", format:b.parts.map(p => p.fmt).join(" | "),
        pozycje:blockItems(date).map(it => ({key:it.key, ex:it.ex, nazwa:exOf(it.ex).name, load:it.load, reps:shownReps(exOf(it.ex), it.reps), dawka:doseText(it.ex, it.load, it.reps), slot:it.slot}))}); }
    return out;
  },
  promptBlock(s, earlier, photo){
    const prev = Object.values(S.sessions).filter(x => x.v === 2 && x.kind !== "mobility" && x.status === "done" && x.id !== s.id && x.date <= s.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    const revs = Object.values(S.reviews || {}).filter(r => r.id !== s.id).sort((a, b) => String(a.date + a.id).localeCompare(String(b.date + b.id))).slice(-4);
    const up = this.upcoming(s), loads = {};
    up.forEach(d => d.pozycje.forEach(p => { if (!loads[p.ex]) loads[p.ex] = loadsOf(exOf(p.ex)); }));
    const vars = Object.fromEntries(VAR_SLOTS.map(k => { const sl = slotByKey(k); return sl ? [k, {teraz:sl.ex, drabinka:varLadder(k)}] : null; }).filter(Boolean));
    return (photo ? "Do wiadomości dołączono zdjęcie zrobione po dzisiejszej sesji (może to być np. wyświetlacz Concept2 PM5, tablica z rozpisanym treningiem albo licznik czasu). Odczytaj z niego wszystko, co dotyczy tej sesji, i uwzględnij w ocenie i w polu done; tylko to, co widać, nieczytelne pomiń.\n" : "") +
      BLOCK_RULES +
      "Dzisiaj: " + JSON.stringify(this.brief(s)) + "\n" +
      (sameBefore(s).length ? "Ten sam trening wcześniej (benchmark, najnowsze najpierw): " + JSON.stringify(sameBefore(s)) + "\n" : "") +
      "Nadchodzące dni bloku (do 14 dni): " + JSON.stringify(up) + "\n" +
      "Dozwolone kody ciężaru dla ćwiczeń: " + loadsText(loads) + "\n" +
      "Warianty w slotach (pozycje ze slot biorą wariant ze slotu): " + JSON.stringify(vars) + "\n" +
      "Poprzednie treningi (najnowsze najpierw): " + JSON.stringify(prev.map(x => this.brief(x))) + "\n" +
      "Poprzednie oceny: " + JSON.stringify(revs) + "\n" +
      (earlier ? "Ten trening był już oceniony, a potem Grzegorz poprawił notatkę. Poprzednia ocena: " + JSON.stringify(earlier) + ". Wszystkie zmiany z tamtej oceny są już cofnięte: plan i dawki w danych są takie, jak przed nią. Oceń trening od nowa na podstawie całej notatki. Dopisek (zwykle na końcu, np. po „Edit”) ma pierwszeństwo i często wskazuje błąd poprzedniej oceny: czytaj go jako sprostowanie tamtej oceny.\n" : "") +
      "Pole wykonanie to twarde dane z aplikacji: Rx = wszystko dokładnie jak w planie, Modified = Grzegorz coś zmienił (ćwiczenie, ciężar, powtórzenia); zmianyWzgledemPlanu i pole plan przy ćwiczeniu pokazują, co dokładnie. Opieraj ocenę na różnicy plan / wykonane, a notatkę traktuj jako uzupełnienie. EMOM i Death by liczymy w rundach: jedna runda trwa minutę (EMOM 8 min = 8 rund), a odchylenie to mniej lub więcej rund, nie minut. Wynik w Modified nie jest porównywalny z Rx, więc nie oceniaj go tak, jakby plan wykonano, i nie wyciągaj wniosków o postępie z zamienionego ćwiczenia. " +
      'Styl odpowiedzi: jesteś trenerem, który właśnie wysłuchał Grzegorza. Title to werdykt w kilku słowach: czy intencja dnia została spełniona i czy coś zmieniamy (np. „Intencja trafiona, ciężar w górę"). Text to 1–2 krótkie zdania, które dodają to, czego on nie powiedział: wniosek, przyczyna, na co uważać następnym razem. Nie powtarzaj notatki, wyniku ani liczb, które sam podał, i nie opisuj, co zrobił. Bez ogólników i pochwał. Gdy nic nie zmieniasz, powiedz to w title i jednym zdaniem dlaczego. Radę dawaj tylko wtedy, gdy wynika z tego, co zrobił, powiedział albo z mechaniki formatu; nie wymyślaj ogólnych porad o tempie czy sile. Gdy notatka nie daje podstaw do rady, text ogranicz do decyzji planu albo zostaw pusty. Znaj mechanikę ćwiczenia, które oceniasz: w Death by w minucie n robi n kalorii (powtórzeń) tak szybko, jak się da, a reszta minuty to odpoczynek, który z każdą minutą maleje; koniec jest wtedy, gdy nie zdąży w minucie, więc komentarz dotyczy tego, ile odpoczynku zostawało w końcowych minutach i jaką minutę ma za cel, a nie tempa („nie spiesz się" nie ma tu sensu). Zwróć wyłącznie JSON: {"title":"krótki werdykt","text":"1–2 zdania trenera, wg stylu","next":[{"date":"RRRR-MM-DD","key":"klucz pozycji","load":"kod","reps":liczba,"reason":"jedno zdanie"}],"variants":[{"slot":"row|vpull|push|core","ex":"id z drabinki","reason":"jedno zdanie"}],"done":[{"key":"klucz z dzisiejszej sesji","ex":"id","load":"kod","reps":liczba}]}. W next i variants tylko to, co zmieniasz. Pole dawka to to, co zrobił, chyba że notatka albo zdjęcie mówi inaczej. W done tylko to, co notatka albo zdjęcie podaje wprost liczbą i co różni się od dawki; brak liczby w notatce znaczy, że zrobił dokładnie zapisaną dawkę. Nigdy nie zgaduj ciężaru ani powtórzeń. Jeśli notatka albo zdjęcie podaje czas testu Row 2000 m na maksa, dodaj pole "row2000":"m:ss". Jeśli pole wynik mówi, że go nie podał, a notatka albo zdjęcie go podaje, dodaj pole "wynik": AMRAP i Death by {"rounds":liczba,"reps":liczba}, for time {"time":"m:ss"}, interwały {"times":["m:ss",…]}, Steady {"dist":metry}; bez zgadywania.' +
      (photo ? ' Jeśli na zdjęciu jest wyświetlacz PM5, dodaj pole "pm5":{"time":"m:ss","dist":metry,"split":"m:ss" (średnio na 500 m),"spm":średnia kadencja,"hr":tętno albo null,"parts":[{"time","dist","split","spm"}] dla odcinków i interwałów albo []}.' : "");
  },
  prompt(s, earlier, photo){
    if (s.block) return this.promptBlock(s, earlier, photo);
    const g = this.group(s);
    const pl = s.kind === "strength" ? planOfSession(s) : null;
    const plan = slotsOf(g).filter(sl => (!sl.bb || bbOn()) && (!pl || sl.plan === pl) && !(bbOn() && slotsOf(g).some(b => b.bb === sl.key))).map(sl => ({key:sl.key, plan:sl.plan, pattern:sl.pattern, ex:sl.ex, load:sl.load, reps:shownReps(exOf(sl.ex), sl.reps), teraz:exOf(sl.ex).name + " " + doseText(sl.ex, sl.load, sl.reps)}));
    const prev = Object.values(S.sessions).filter(x => x.v === 2 && x.kind === s.kind && x.status === "done" && x.id !== s.id && x.date <= s.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    const revs = Object.values(S.reviews || {}).filter(r => r.id !== s.id).sort((a, b) => String(a.date + a.id).localeCompare(String(b.date + b.id))).slice(-4);
    return (photo ? "Do wiadomości dołączono zdjęcie zrobione po dzisiejszej sesji (może to być np. wyświetlacz Concept2 PM5, tablica z rozpisanym treningiem albo licznik czasu). Odczytaj z niego wszystko, co dotyczy tej sesji, i uwzględnij w ocenie i w polu done; tylko to, co widać, nieczytelne pomiń.\n" : "") +
      (s.kind === "cond" ? COND_RULES : "") + BASE_RULES +
      "Dozwolone id i kody ciężaru dla każdego key: " + this.allowedText(g) + "\n" +
      "Plan teraz" + (g === "circuit" ? " (rundy: " + S.profile.rounds + ")" : "") + ": " + JSON.stringify(plan) + "\n" +
      "Dzisiaj: " + JSON.stringify(this.brief(s)) + "\n" +
      "Poprzednie treningi (najnowsze najpierw): " + JSON.stringify(prev.map(x => this.brief(x))) + "\n" +
      "Poprzednie oceny: " + JSON.stringify(revs) + "\n" +
      (earlier ? "Ten trening był już oceniony przed poprawką notatki: " + JSON.stringify(earlier) + ". Jego zmiany są już w planie teraz. Nie powtarzaj ich; zmień tylko to, co poprawiona notatka mówi inaczej (możesz cofnąć wcześniejszą zmianę).\n" : "") +
      "Pole wykonanie to twarde dane z aplikacji: Rx = wszystko dokładnie jak w planie, Modified = Grzegorz coś zmienił (ćwiczenie, ciężar, powtórzenia); zmianyWzgledemPlanu i pole plan przy ćwiczeniu pokazują, co dokładnie. Opieraj ocenę na różnicy plan / wykonane, a notatkę traktuj jako uzupełnienie. EMOM i Death by liczymy w rundach: jedna runda trwa minutę (EMOM 8 min = 8 rund), a odchylenie to mniej lub więcej rund, nie minut. Wynik w Modified nie jest porównywalny z Rx, więc nie oceniaj go tak, jakby plan wykonano, i nie wyciągaj wniosków o postępie z zamienionego ćwiczenia. " +
      'Styl odpowiedzi: jesteś trenerem, który właśnie wysłuchał Grzegorza. Title to werdykt w kilku słowach: czy intencja dnia została spełniona i czy coś zmieniamy (np. „Intencja trafiona, ciężar w górę"). Text to 1–2 krótkie zdania, które dodają to, czego on nie powiedział: wniosek, przyczyna, na co uważać następnym razem. Nie powtarzaj notatki, wyniku ani liczb, które sam podał, i nie opisuj, co zrobił. Bez ogólników i pochwał. Gdy nic nie zmieniasz, powiedz to w title i jednym zdaniem dlaczego. Radę dawaj tylko wtedy, gdy wynika z tego, co zrobił, powiedział albo z mechaniki formatu; nie wymyślaj ogólnych porad o tempie czy sile. Gdy notatka nie daje podstaw do rady, text ogranicz do decyzji planu albo zostaw pusty. Znaj mechanikę ćwiczenia, które oceniasz: w Death by w minucie n robi n kalorii (powtórzeń) tak szybko, jak się da, a reszta minuty to odpoczynek, który z każdą minutą maleje; koniec jest wtedy, gdy nie zdąży w minucie, więc komentarz dotyczy tego, ile odpoczynku zostawało w końcowych minutach i jaką minutę ma za cel, a nie tempa („nie spiesz się" nie ma tu sensu). Zwróć wyłącznie JSON: {"title":"krótki werdykt","text":"1–2 zdania trenera, wg stylu","rounds":liczba rund na następny trening (taka sama albo mniejsza niż teraz),"fin":najdłuższy finisher w minutach (tylko gdy go skracasz),"changes":[{"key":"klucz z planu","ex":"id","load":"kod","reps":liczba,"reason":"jedno zdanie"}],"done":[{"key":"klucz z dzisiejszej sesji","ex":"id","load":"kod","reps":liczba}]}. W changes tylko ćwiczenia, które zmieniasz. W done tylko ćwiczenia, przy których notatka mówi, że zrobił co innego niż w dzisiejszym planie (inny wariant, ciężar albo liczbę powtórzeń, np. w drugiej rundzie pełne Push-up zamiast Knee Push-up): podaj najlepszą serię, którą faktycznie zrobił; bez zgadywania. Jeśli notatka albo zdjęcie podaje czas testu Row 2000 m na maksa, dodaj pole "row2000":"m:ss".' +
      (photo ? ' Jeśli na zdjęciu jest wyświetlacz PM5, dodaj pole "pm5":{"time":"m:ss","dist":metry,"split":"m:ss" (średnio na 500 m),"spm":średnia kadencja,"hr":tętno albo null,"parts":[{"time","dist","split","spm"}] dla odcinków i interwałów albo []}.' : "");
  },
  parse(text){ const m = String(text || "").match(/\{[\s\S]*\}/); if (!m) return null; try { return JSON.parse(m[0]); } catch(e){ return null; } },
  // A corrected note gets a fresh review: first everything the previous review changed goes back.
  undo(s){
    const u = s.undo; if (!u) return;
    (u.over || []).slice().reverse().forEach(x => { const o = S.profile.over || (S.profile.over = {}), d = o[x.date] || (o[x.date] = {});
      if (x.prev) d[x.key] = x.prev; else { delete d[x.key]; if (!Object.keys(d).length) delete o[x.date]; } });
    (u.slots || []).slice().reverse().forEach(x => { const sl = slotByKey(x.key); if (sl) Object.assign(sl, x.prev); });
    (u.items || []).slice().reverse().forEach(x => { const it = (s.items || []).find(y => y.key === x.key); if (it) Object.assign(it, x.prev); });
    delete s.undo; commitSession(s); commitProfile();
  },
  applyBlock(s, out){
    const now = Date.now(), changes = [], lim = addDays(s.date, 14), undo = {over:[], slots:[], items:[]};
    const varied = new Set();
    (Array.isArray(out.variants) ? out.variants : []).forEach(c => {
      if (!VAR_SLOTS.includes(c.slot)) return; const sl = slotByKey(c.slot); if (!sl || c.ex === sl.ex) return;
      if (!varLadder(c.slot).includes(c.ex)) return;
      undo.slots.push({key:c.slot, prev:{ex:sl.ex, load:sl.load, claudeNote:sl.claudeNote, claudeAt:sl.claudeAt}});
      varied.add(c.slot); changes.push(exOf(sl.ex).name + (exOf(sl.ex).tag ? " (" + exOf(sl.ex).tag + ")" : "") + " → " + exOf(c.ex).name + (EX[c.ex].tag ? " (" + EX[c.ex].tag + ")" : ""));
      Object.assign(sl, {ex:c.ex, load:fitLoad(EX[c.ex], sl.load), claudeNote:String(c.reason || "").slice(0, 200), claudeAt:now});
    });
    (Array.isArray(out.next) ? out.next : []).forEach(c => {
      const date = String(c.date || ""); if (!(date > s.date && date <= lim) || !blockDay(date)) return;
      const it = blockItems(date).find(x => x.key === c.key); if (!it || (it.slot && varied.has(it.slot))) return;
      const part = blockDay(date).parts[it.part || 0], classic = part && fmtKind(part.fmt).k === "load";
      const ex = exOf(it.ex), loads = loadsOf(ex), load = loads.includes(c.load) ? c.load : it.load;
      const reps = classic ? it.reps : storedReps(ex, Math.max(1, Math.min(ex.minutes ? 45 : ex.m ? 10000 : 60, parseInt(c.reps, 10) || shownReps(ex, it.reps))));
      if (load === it.load && reps === it.reps) return;
      const o = S.profile.over || (S.profile.over = {}), d = o[date] || (o[date] = {});
      undo.over.push({date, key:c.key, prev:d[c.key] ? {...d[c.key]} : null});
      d[c.key] = {...(d[c.key] || {}), load, reps, note:String(c.reason || "").slice(0, 200), at:now};
      changes.push(ddmm(date) + " " + ex.name + ": " + doseText(it.ex, it.load, it.reps) + " → " + doseText(it.ex, load, reps));
    });
    let fixed = false;
    (Array.isArray(out.done) ? out.done : []).forEach(c => {
      const it = (s.items || []).find(x => x.key === c.key); if (!it || !EX[c.ex] || exOf(it.ex).test) return;
      if (c.ex !== it.ex && exOf(c.ex).pattern !== exOf(it.ex).pattern) return;
      const loads = loadsOf(EX[c.ex]), load = loads.includes(c.load) ? c.load : it.load, reps = storedReps(EX[c.ex], Math.max(1, Math.min(120, parseInt(c.reps, 10) || shownReps(EX[c.ex], it.reps))));
      if (!loads.includes(load) || (c.ex === it.ex && load === it.load && reps === it.reps)) return;
      if (load !== it.load && LOADS[load] && LOADS[load].bb && !noteHasNumber(s.note, LOADS[load].bb)) return;
      if (reps !== it.reps && !noteHasNumber(s.note, shownReps(EX[c.ex], reps))) return;
      undo.items.push({key:it.key, prev:{ex:it.ex, load:it.load, reps:it.reps, fromNote:it.fromNote}});
      Object.assign(it, {ex:c.ex, load, reps, fromNote:true}); fixed = true;
    });
    s.undo = undo; commitSession(s);
    if (changes.length) commitProfile();
    const pm = cleanPm5(out.pm5);
    if (pm){ s.pm5 = pm; commitSession(s); }
    const m = String(out.row2000 || "").match(/^(\d{1,2}):(\d{2})(?:[.,]\d)?$/);
    if (m){ const sec = +m[1] * 60 + +m[2]; if (sec >= 300 && sec <= 900){ s.bench = {...(s.bench || {}), row2000:sec}; commitSession(s); } }
    if (fillScore(s, out.wynik, pm)) commitSession(s);
    return {id:s.id, date:s.date, title:String(out.title || "Sesja zapisana.").slice(0, 120), text:String(out.text || "").slice(0, 1500), changes:changes.join("; ") || "bez zmian"};
  },
  apply(s, out){
    if (s.block) return this.applyBlock(s, out);
    const g = this.group(s), allowed = this.allowed(g), now = Date.now(), changes = [];
    (Array.isArray(out.changes) ? out.changes : []).forEach(c => {
      const sl = slotsOf(g).find(x => x.key === c.key); if (!sl || !(s.items || []).some(it => it.key === c.key)) return;
      const loads = (allowed[sl.key] || {})[c.ex]; if (!loads) return;
      const load = loads.includes(c.load) ? c.load : (loads.includes(sl.load) ? sl.load : loads[0]);
      const ex = EX[c.ex], max = ex.minutes ? 45 : ex.interval ? 16 : 60;
      const reps = storedReps(ex, Math.max(1, Math.min(max * 2, parseInt(c.reps, 10) || shownReps(ex, sl.reps))));
      if (c.ex === sl.ex && load === sl.load && reps === sl.reps) return;
      changes.push(exOf(sl.ex).name + ": " + doseText(sl.ex, sl.load, sl.reps) + " → " + (c.ex !== sl.ex ? exOf(c.ex).name + " " : "") + doseText(c.ex, load, reps));
      Object.assign(sl, {ex:c.ex, load, reps, claudeNote:String(c.reason || "").slice(0, 200), claudeAt:now});
    });
    // What was actually done, when the note says it differs from the day's plan: the record (and the levels) follow the note.
    let fixed = false;
    (Array.isArray(out.done) ? out.done : []).forEach(c => {
      const it = (s.items || []).find(x => x.key === c.key); if (!it || !EX[c.ex] || exOf(it.ex).test) return;
      const loads = ((allowed[c.key] || {})[c.ex]) || (c.ex === it.ex ? loadsOf(EX[c.ex]) : null); if (!loads) return;
      const load = loads.includes(c.load) ? c.load : it.load, reps = storedReps(EX[c.ex], Math.max(1, Math.min(120, parseInt(c.reps, 10) || shownReps(EX[c.ex], it.reps))));
      if (!loads.includes(load) || (c.ex === it.ex && load === it.load && reps === it.reps)) return;
      Object.assign(it, {ex:c.ex, load, reps, fromNote:true}); fixed = true;
    });
    if (fixed) commitSession(s);
    const r = parseInt(out.rounds, 10);
    if (g === "circuit" && r >= 1 && r < S.profile.rounds){ changes.push("Rounds: " + S.profile.rounds + " → " + r); S.profile.rounds = r; }
    const fm = Math.round(+out.fin);
    if (g === "circuit" && out.fin != null && fm >= 0 && fm < (S.profile.finMax || 10)){ changes.push("Finisher: najwyżej " + fm + " min"); S.profile.finMax = fm; }
    if (changes.length) commitProfile();
    const pm = cleanPm5(out.pm5);
    if (pm){ s.pm5 = pm; if (s.items.some(it => exOf(it.ex).test) && pm.time && (!pm.dist || Math.abs(pm.dist - 2000) <= 5) && !out.row2000) out.row2000 = mmss(pm.time); commitSession(s); }
    const m = String(out.row2000 || "").match(/^(\d{1,2}):(\d{2})(?:[.,]\d)?$/);
    if (m){ const sec = +m[1] * 60 + +m[2]; if (sec >= 300 && sec <= 900){ s.bench = {...(s.bench || {}), row2000:sec}; commitSession(s); } }
    return {id:s.id, date:s.date, title:String(out.title || "Sesja zapisana.").slice(0, 120), text:String(out.text || "").slice(0, 1500), changes:changes.join("; ") || "bez zmian"};
  }
};

const Sync = {
  url:null, q:new Set(), timer:null, busy:false, last:null, err:null,
  init(){
    try { this.url = localStorage.getItem(KEY_URL) || null; (JSON.parse(localStorage.getItem(KEY_Q) || "[]")).forEach(x => this.q.add(x)); } catch(e){}
    window.addEventListener("online", () => this.flush());
    document.addEventListener("visibilitychange", () => { if (!document.hidden){ this.flush(); this.retryReview(); } });
  },
  saveQ(){ try { localStorage.setItem(KEY_Q, JSON.stringify([...this.q])); } catch(e){} },
  queue(id){ if (!this.url) return; this.q.add(id); this.saveQ(); clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 1500); },
  row(x){
    return {session:x, items:(x.items || []).map(it => exOf(it.ex).name + " " + doseText(it.ex, it.load, it.reps) + (it.swap ? " [zamiast " + exOf(it.swap.from).name + "]" : "")).join("; ")};
  },
  async flush(){
    if (!this.url || this.busy || !this.q.size || !navigator.onLine) return;
    this.busy = true;
    const ids = [...this.q];
    const body = {sessions: ids.filter(id => id !== "profile" && S.sessions[id] && S.sessions[id].touched).map(id => this.row(S.sessions[id])),
      reviews: ids.filter(id => id.startsWith("rv:")).map(id => S.reviews[id.slice(3)]).filter(Boolean)};
    if (ids.includes("profile")){ body.profile = S.profile; body.planText = this.planText(); }
    try {
      const res = await fetch(this.url, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(body)});
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "błąd arkusza");
      ids.forEach(id => this.q.delete(id)); this.saveQ(); this.last = Date.now(); this.err = null;
    } catch(e){ this.err = "Nie udało się wysłać do arkusza. Spróbuję ponownie."; }
    this.busy = false;
    if (S.view === "settings") render();
    if (this.q.size && !this.err) this.flush();
  },
  async pull(){
    if (!this.url || !navigator.onLine) return false;
    try {
      const res = await fetch(this.url, {method:"GET"});
      const j = await res.json();
      if (!j.ok) throw new Error("bad");
      let changed = false;
      for (const [id, r] of Object.entries(j.sessions || {})){
        const l = S.sessions[id];
        if (!l || (r.updatedAt || 0) > (l.updatedAt || 0)){ S.sessions[id] = r; changed = true; }
      }
      for (const [id, l] of Object.entries(S.sessions)){
        const r = (j.sessions || {})[id];
        if (l.v === 2 && l.touched && (!r || (l.updatedAt || 0) > (r.updatedAt || 0))) this.q.add(id);
      }
      if (Array.isArray(j.reviews)){
        const rv = {}; j.reviews.forEach(r => { if (r && r.id) rv[r.id] = r; });
        for (const k of this.q) if (k.startsWith("rv:") && S.reviews[k.slice(3)]) rv[k.slice(3)] = S.reviews[k.slice(3)];
        if (JSON.stringify(rv) !== JSON.stringify(S.reviews)){ S.reviews = rv; changed = true; try { localStorage.setItem("trening:reviews", JSON.stringify(rv)); } catch(e){} }
      }
      if (j.profile && (j.profile.updatedAt || 0) > (S.profile.updatedAt || 0)){ S.profile = mergeProfile(j.profile); changed = true; this.q.add("profile"); }
      else if (!j.profile || (S.profile.updatedAt || 0) > (j.profile.updatedAt || 0)) this.q.add("profile");
      this.saveQ();
      if (changed) Store.replaceAll(S.profile, S.sessions);
      this.last = Date.now(); this.err = null;
      this.flush();
      this.retryReview();
      return changed;
    } catch(e){ this.err = "Nie mogę połączyć się z arkuszem. Sprawdź adres i internet."; return false; }
  },
  async connect(url){
    this.url = url; try { localStorage.setItem(KEY_URL, url); } catch(e){}
    const before = this.err; await this.pull();
    if (!this.err){ Object.keys(S.sessions).forEach(id => { if (S.sessions[id].touched) this.q.add(id); }); this.q.add("profile"); this.saveQ(); this.flush(); }
    return !this.err;
  },
  pendingReview(){ try { return JSON.parse(localStorage.getItem(KEY_PR) || "null"); } catch(e){ return null; } },
  setPendingReview(p){ try { p ? localStorage.setItem(KEY_PR, JSON.stringify(p)) : localStorage.removeItem(KEY_PR); } catch(e){} },
  retryReview(){
    const p = this.pendingReview();
    if (!p || !this.url || S.reviewing) return;
    const r = S.reviews[p.id], s = S.sessions[p.id];
    if (!s || s.status !== "done" || (r && (r.title + r.text) !== p.prev)){ this.setPendingReview(null); return; }
    this.review(p.id, p.force);
  },
  async review(id, force){
    const s = S.sessions[id];
    if (!this.url || !s || S.reviewing) return;
    const redraw = () => { if (["home", "prep", "detail"].includes(S.view)) render(); };
    if (!navigator.onLine){ S.reviewErr = "Brak internetu. Ocena przyjdzie, gdy telefon złapie sieć."; redraw(); return; }
    S.reviewing = id; S.reviewErr = null; redraw();
    for (let i = 0; i < 60 && this.busy; i++) await sleep(250);
    this.busy = true; clearTimeout(this.timer);
    if (force && s.block) Coach.undo(s);
    const photo = photoOf(id);
    const body = {sessions:[this.row(s)], review:id, force:!!force, claude:{prompt:Coach.prompt(s, force ? reviewFor(id) : null, !!photo), effort:"medium", model:COACH_MODEL}};
    if (photo) body.claude.images = [{media_type:"image/jpeg", data:photo.split(",")[1]}];
    let got = false, relay = false;
    if (this.q.has("profile")){ body.profile = S.profile; body.planText = this.planText(); }
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 150000);
    try {
      const res = await fetch(this.url, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(body), signal:ctrl.signal});
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "błąd arkusza");
      this.q.delete(id); if (body.profile) this.q.delete("profile");
      if (j.claude){
        relay = true;
        const out = j.claude.error ? null : Coach.parse(j.claude.text);
        // An older sheet script drops the photo: keep it, and say so on the session.
        if (photo){ if (j.claude.img) { setPhoto(id, null); delete s.photoLost; } else s.photoLost = true; }
        if (out){
          const rv = Coach.apply(s, out); got = true; S.reviews[rv.id] = rv; this.q.add("rv:" + rv.id); this.setPendingReview(null);
          try { localStorage.setItem("trening:reviews", JSON.stringify(S.reviews)); if (S.view === "prep") localStorage.setItem("trening:seen-review", rv.id); } catch(e){}
        } else S.reviewErr = j.claude.error || "Nieczytelna odpowiedź Claude (" + (j.claude.stop || "?") + ").";
        this.saveQ();
      } else {
      if (j.profile){ S.profile = mergeProfile(j.profile); Store.saveProfile(); this.q.add("profile"); }
      this.saveQ();
      if (j.review){
        got = true; S.reviews[j.review.id] = j.review; this.setPendingReview(null);
        try { localStorage.setItem("trening:reviews", JSON.stringify(S.reviews)); if (S.view === "prep") localStorage.setItem("trening:seen-review", j.review.id); } catch(e){}
      } else S.reviewErr = j.reviewError || "Claude nie odpowiedział.";
      }
      this.last = Date.now(); this.err = null;
    } catch(e){
      S.reviewErr = e.name === "AbortError" ? "Ocena trwa dłużej niż zwykle. Sprawdzę ją przy następnym otwarciu aplikacji." : "Nie udało się połączyć z arkuszem. Spróbuję ponownie przy następnym otwarciu aplikacji.";
    }
    clearTimeout(timer); this.busy = false; S.reviewing = null; redraw();
    if (got && !relay) { await this.pull(); redraw(); }
    else if (this.q.size) await this.flush();
  },
  // Preview: the current prompt run on an already reviewed session. Nothing is applied, saved or synced.
  async preview(id){
    const s = S.sessions[id]; if (!this.url || !s) return;
    const photo = photoOf(id);
    const body = {sessions:[this.row(s)], review:id, force:true, claude:{prompt:Coach.prompt(s, null, !!photo), effort:"medium", model:COACH_MODEL}};
    if (photo) body.claude.images = [{media_type:"image/jpeg", data:photo.split(",")[1]}];
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 150000);
    try {
      const res = await fetch(this.url, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(body), signal:ctrl.signal});
      const j = await res.json(); if (!j.ok || !j.claude || j.claude.error) throw new Error((j.claude && j.claude.error) || j.error || "brak odpowiedzi");
      const out = Coach.parse(j.claude.text); if (!out) throw new Error("nieczytelna odpowiedź");
      const ch = [].concat((out.next || []).map(c => ddmm(String(c.date)) + " " + c.key + " " + c.load + " × " + c.reps), (out.variants || []).map(c => c.slot + " → " + c.ex));
      S.previews[id] = {title:String(out.title || ""), text:String(out.text || ""), changes:ch.join("; ")};
    } catch(e){ S.previews[id] = {title:"Błąd", text:String(e.message || e), changes:""}; }
    clearTimeout(timer);
  },
  async previewAll(){
    if (S.previewing) return; S.previewing = true; S.previews = {}; render();
    const ids = Object.values(S.sessions).filter(x => x.v === 2 && x.status === "done" && x.kind !== "mobility" && S.reviews[x.id]).sort((a, b) => a.date.localeCompare(b.date)).map(x => x.id);
    for (const id of ids){ await this.preview(id); render(); }
    S.previewing = false; render();
  },
  planText(){ const blk = [];
    for (let i = 0; i < 14; i++){ const date = addDays(today(), i), b = blockDay(date); if (b) blk.push(["Blok " + ddmm(date) + ": " + BLOCK_TITLE[b.type] + " · " + b.parts.map(p => p.fmt).join(" | "), blockItems(date).map(it => exOf(it.ex).name + " " + doseText(it.ex, it.load, it.reps)).join("; ")]); }
    return blk.concat(this.planText0()); },
  planText0(){ return S.profile.slots.filter(sl => sl.bb ? bbOn() : !(bbOn() && S.profile.slots.some(b => b.bb === sl.key))).map(sl => [(sl.group === "circuit" ? "Circuit " + sl.plan + ": " : sl.group === "fin" ? "Finisher (EMOM, co minutę): " : sl.group === "cond" ? "Conditioning: " : "Mobility: ") + exOf(sl.ex).name, doseText(sl.ex, sl.load, sl.reps)]); },
  disconnect(){ this.url = null; this.q.clear(); this.err = null; try { localStorage.removeItem(KEY_URL); localStorage.removeItem(KEY_Q); } catch(e){} }
};

