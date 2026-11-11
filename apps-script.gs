// Trening na dziś: synchronizacja aplikacji z tym arkuszem.
// Wklej całość w Rozszerzenia → Apps Script, zapisz i wdróż jako aplikację internetową.

const SESS = "Sesje";
const PLAN = "Plan";
const REVIEWS = "Oceny";
const HEAD = ["id", "data", "rodzaj", "status", "rundy", "plan na trening", "notatka", "zapisano", "json"];
const REVIEW_HEAD = ["id", "data", "ocena", "uzasadnienie", "zmiany w planie", "zapisano"];
// Ocena od Claude: w Ustawieniach projektu → Właściwości skryptu dodaj ANTHROPIC_API_KEY z kluczem z Claude Console.
const MODEL = "claude-sonnet-5-5";
const ALLOWED = {
  shoulder: { "kb-halo": ["kb4", "kb8", "kb16"] },
  vpush: { "kb-clean-press": ["kb8", "kb16", "kb20"], "kb-strict-press": ["kb8", "kb16", "kb20"] },
  hpull: { "ring-row": ["bw"], "ring-row-box": ["bw"], "pullup-negative": ["bw"], "band-pullup": ["bw"], "pullup": ["bw"] },
  hinge: { "kb-swing": ["kb16", "kb20"], "kb-swing-1a": ["kb16", "kb20"] },
  hpush: { "incline-pushup-75": ["bw"], "knee-pushup": ["bw"], "pushup-negative": ["bw"], "pushup": ["bw"], "ring-dip": ["bw"] },
  lunge: { "bss": ["bw", "kb8", "kb16", "kb20", "db15x2", "db225x2"] }
};
const NAMES = { "kb-halo": "KB Halo", "kb-clean-press": "KB Clean & Press", "kb-strict-press": "KB Clean & Strict Press", "ring-row": "Ring Row",
  "ring-row-box": "Ring Row (Feet on box)", "pullup-negative": "Pull-up Negative", "band-pullup": "Band-assisted Pull-up", "pullup": "Pull-up",
  "kb-swing": "KB Swing", "kb-swing-1a": "One-arm KB Swing", "incline-pushup-75": "Incline Push-up (Box 75 cm)", "knee-pushup": "Knee Push-up",
  "pushup-negative": "Push-up Negative", "pushup": "Push-up", "ring-dip": "Ring Dip", "bss": "Bulgarian Split Squat" };
const PER_SIDE = ["kb-halo", "kb-clean-press", "kb-strict-press", "kb-swing-1a", "bss"];
const LOADS = { bw: "Bodyweight", kb4: "4 kg", kb8: "8 kg", kb16: "16 kg", kb20: "20 kg", db15x2: "2 × 15 kg", db225x2: "2 × 22,5 kg" };
function name_(id) { return NAMES[id] || id; }
function dose_(id, load, reps) { return (LOADS[load] || load) + " × " + reps + (PER_SIDE.indexOf(id) >= 0 ? " per side" : ""); }

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (sh && head && sh.getLastRow() > 0) {
    const current = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
    if (current.join("|") !== head.join("|")) { sh.setName(name + " (stare " + Date.now() + ")"); sh = null; }
  }
  if (!sh) sh = ss.insertSheet(name);
  if (head && sh.getLastRow() === 0) {
    sh.getRange("A:B").setNumberFormat("@");
    sh.appendRow(head);
    sh.setFrozenRows(1);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const sh = sheet_(SESS, HEAD);
  const plan = sheet_(PLAN);
  const rv = sheet_(REVIEWS, REVIEW_HEAD);
  const sessions = {};
  const n = sh.getLastRow();
  if (n > 1) {
    sh.getRange(2, HEAD.length, n - 1, 1).getValues().forEach(function (r) {
      try { const s = JSON.parse(r[0]); if (s && s.id) sessions[s.id] = s; } catch (err) {}
    });
  }
  const reviews = readReviews_();
  let profile = null;
  const p = plan.getRange("A1").getValue();
  if (p) { try { profile = JSON.parse(p); } catch (err) {} }
  return out_({ ok: true, profile: profile, sessions: sessions, reviews: reviews });
}

function readReviews_() {
  const rv = sheet_(REVIEWS, REVIEW_HEAD);
  const out = [];
  const m = rv.getLastRow();
  if (m > 1) {
    rv.getRange(2, 1, m - 1, 5).getDisplayValues().forEach(function (r) {
      if (r[0]) out.push({ id: r[0], date: r[1], title: r[2], text: r[3], changes: r[4] });
    });
  }
  return out;
}

function readSessions_() {
  const sh = sheet_(SESS, HEAD);
  const sessions = {};
  const n = sh.getLastRow();
  if (n > 1) {
    sh.getRange(2, HEAD.length, n - 1, 1).getValues().forEach(function (r) {
      try { const s = JSON.parse(r[0]); if (s && s.id) sessions[s.id] = s; } catch (err) {}
    });
  }
  return sessions;
}

function review_(id, force) {
  const sessions = readSessions_();
  const s = sessions[id];
  if (!s) return { error: "Nie znalazłem sesji w arkuszu." };
  if (s.kind !== "strength" || s.status !== "done") return { error: "Oceniam tylko zakończone treningi siłowe." };
  const allReviews = readReviews_();
  const earlier = allReviews.filter(function (x) { return x.id === s.id; })[0] || null;
  if (earlier && !force) return { review: earlier };
  let profile = null;
  try { profile = JSON.parse(sheet_(PLAN).getRange("A1").getValue()); } catch (err) {}
  if (!profile || !profile.slots) return { error: "Brak planu w arkuszu." };
  const prev = Object.keys(sessions).map(function (k) { return sessions[k]; })
    .filter(function (x) { return x.kind === "strength" && x.status === "done" && x.id !== s.id && x.date <= s.date; })
    .sort(function (a, b) { return b.date < a.date ? -1 : 1; }).slice(0, 4);
  const brief = function (x) {
    return { data: x.date, rundy: x.rounds, notatka: x.note || "", cwiczenia: (x.items || []).map(function (it) {
      return { key: it.key, ex: it.ex, nazwa: name_(it.ex), dawka: dose_(it.ex, it.load, it.reps), zamianaNaDzis: it.swap ? true : undefined }; }) };
  };
  const plan = profile.slots.filter(function (sl) { return sl.group === "circuit"; })
    .map(function (sl) { return { key: sl.key, pattern: sl.pattern, ex: sl.ex, load: sl.load, reps: sl.reps, teraz: name_(sl.ex) + " " + dose_(sl.ex, sl.load, sl.reps) }; });
  const prompt = "Jesteś spokojnym, rzeczowym trenerem siły Grzegorza (47 lat, wraca do treningu po przerwie, trenuje w domu obwodowo w stylu CrossFit z krótkimi przerwami; ten styl zostaje). " +
    "Oceń jego dzisiejszy trening na podstawie notatki (dyktowana, mogą być błędy rozpoznawania mowy: odczytaj sens) i zdecyduj o planie na następny trening.\n" +
    "Zasady: każda seria z zapasem 2–3 powtórzeń, technika kończy serię. Najwyżej jedna zmiana na ćwiczenie i tylko taka, która wynika z notatki. Za łatwe: krok w górę. Trudne, ból albo sypiąca się technika: zostaje albo krok w dół; przy bólu stawu nie podnoś i dodaj w tekście, żeby skonsultował się z fizjoterapeutą, jeśli wraca. " +
    "Jeśli w notatce zrobił już trudniejszy wariant i poszło dobrze, przestaw plan na ten wariant. Ustaw liczbę rund na tyle, ile faktycznie robi, jeśli o tym mówi. Ćwiczeń oznaczonych zamianaNaDzis nie przenoś do planu.\n" +
    "Progresje: KB Halo to przygotowanie barków, najwyżej 8 kg × 8 per side. Clean & Press: najpierw powtórzenia do 8 per side, potem kb-strict-press, potem 20 kg. Przyciąganie: ring-row → ring-row-box → pullup-negative → band-pullup → pullup. " +
    "Pompki: incline-pushup-75 → knee-pushup → pushup-negative → pushup (do 12) → ring-dip. Swing: 20 kg do × 20, potem kb-swing-1a 20 kg; nie proponuj kupowania 24 kg. Bulgarian Split Squat: najpierw powtórzenia do 10 per side, potem ciężar; ogranicza go równowaga w butach barefoot, to zamierzone. " +
    "Nie dodawaj nowych ćwiczeń, nie zmieniaj mobilności, bez głośnych ćwiczeń. Konkretne liczby, bez zakresów. Nazwy ćwiczeń po angielsku, teksty po polsku, bez moralizowania i motywowania.\n" +
    "Dozwolone id i kody ciężaru dla każdego wzorca: " + JSON.stringify(ALLOWED) + "\n" +
    "Plan teraz (rundy: " + profile.rounds + "): " + JSON.stringify(plan) + "\n" +
    "Dzisiaj: " + JSON.stringify(brief(s)) + "\n" +
    "Poprzednie treningi (najnowsze najpierw): " + JSON.stringify(prev.map(brief)) + "\n" +
    "Poprzednie oceny: " + JSON.stringify(allReviews.filter(function (x) { return x.id !== s.id; }).slice(-4)) + "\n" +
    (earlier ? "Ten trening był już oceniony przed poprawką notatki: " + JSON.stringify(earlier) + ". Jego zmiany są już w planie teraz. Nie powtarzaj ich; zmień tylko to, co poprawiona notatka mówi inaczej (możesz cofnąć wcześniejszą zmianę).\n" : "") +
    "Zwróć wyłącznie JSON: {\"title\":\"krótki werdykt\",\"text\":\"2–4 zdania: co z notatki wynika dla każdego ważnego ćwiczenia\",\"rounds\":liczba rund na następny trening,\"changes\":[{\"key\":\"klucz z planu\",\"ex\":\"id\",\"load\":\"kod\",\"reps\":liczba,\"reason\":\"jedno zdanie\"}]}. W changes tylko ćwiczenia, które zmieniasz.";
  const ans = callClaude_(prompt);
  if (ans.error) return { error: ans.error };
  const m = ans.text.match(/\{[\s\S]*\}/);
  if (!m) return { error: "Nieczytelna odpowiedź Claude." };
  const out = JSON.parse(m[0]);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    try { profile = JSON.parse(sheet_(PLAN).getRange("A1").getValue()) || profile; } catch (err) {}
    return apply_(s, profile, out);
  } finally {
    lock.releaseLock();
  }
}

function apply_(s, profile, out) {
  const now = Date.now();
  const changes = [];
  (out.changes || []).forEach(function (c) {
    const sl = profile.slots.filter(function (x) { return x.key === c.key && x.group === "circuit"; })[0];
    if (!sl) return;
    const allowed = (ALLOWED[sl.pattern] || {})[c.ex];
    if (!allowed) return;
    const load = allowed.indexOf(c.load) >= 0 ? c.load : (allowed.indexOf(sl.load) >= 0 ? sl.load : allowed[0]);
    const reps = Math.max(1, Math.min(60, parseInt(c.reps, 10) || sl.reps));
    if (c.ex === sl.ex && load === sl.load && reps === sl.reps) return;
    changes.push(name_(sl.ex) + ": " + dose_(sl.ex, sl.load, sl.reps) + " → " + (c.ex !== sl.ex ? name_(c.ex) + " " : "") + dose_(c.ex, load, reps));
    sl.ex = c.ex; sl.load = load; sl.reps = reps; sl.claudeNote = String(c.reason || "").slice(0, 200); sl.claudeAt = now;
  });
  const r = parseInt(out.rounds, 10);
  if (r >= 1 && r <= 5 && r !== profile.rounds) { changes.push("Rundy: " + profile.rounds + " → " + r); profile.rounds = r; }
  if (changes.length) {
    profile.updatedAt = now;
    const plan = sheet_(PLAN);
    plan.getRange("A1").setValue(JSON.stringify(profile));
    plan.getRange("A2").setValue("Plan zmieniony przez Claude: " + new Date().toLocaleString("pl-PL"));
  }
  const review = { id: s.id, date: s.date, title: String(out.title || "Sesja zapisana.").slice(0, 120), text: String(out.text || "").slice(0, 1500), changes: changes.join("; ") || "bez zmian" };
  const rv = sheet_(REVIEWS, REVIEW_HEAD);
  const row = [review.id, review.date, review.title, review.text, review.changes, new Date()];
  const n = rv.getLastRow();
  const ids = n > 1 ? rv.getRange(2, 1, n - 1, 1).getValues().map(function (x) { return String(x[0]); }) : [];
  const i = ids.indexOf(String(review.id));
  if (i >= 0) rv.getRange(i + 2, 1, 1, row.length).setValues([row]); else rv.appendRow(row);
  return { review: review, profile: changes.length ? profile : null };
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: "zły format" }); }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    if (body.profile) {
      const plan = sheet_(PLAN);
      plan.getRange("A1").setValue(JSON.stringify(body.profile));
      plan.getRange("A2").setValue("Plan zapisany przez aplikację: " + new Date().toLocaleString("pl-PL"));
      const rows = (body.planText || []).map(function (r) { return [r[0], r[1]]; });
      plan.getRange(3, 1, Math.max(plan.getMaxRows() - 2, 1), 2).clearContent();
      if (rows.length) { plan.getRange(3, 1, 1, 2).setValues([["Ćwiczenie", "Dawka"]]); plan.getRange(4, 1, rows.length, 2).setValues(rows); }
    }
    (body.sessions || []).forEach(upsert_);
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
  if (!body.review) return out_({ ok: true });
  let r;
  try { r = review_(String(body.review), !!body.force); } catch (err) { r = { error: String(err) }; }
  return out_({ ok: true, review: r.review || null, profile: r.profile || null, reviewError: r.error || null });
}

// Uruchom raz w edytorze (Uruchom → testClaude), żeby nadać uprawnienia i sprawdzić klucz API.
function testClaude() {
  const r = callClaude_("Odpowiedz jednym słowem: działa");
  Logger.log(r.error || r.text);
}

function callClaude_(prompt) {
  const key = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!key) return { error: "Brak klucza API w ustawieniach skryptu (ANTHROPIC_API_KEY)." };
  const opts = {
    method: "post", contentType: "application/json", muteHttpExceptions: true,
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    payload: JSON.stringify({ model: MODEL, max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
  };
  let res = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", opts);
  if (res.getResponseCode() === 529 || res.getResponseCode() >= 500) { Utilities.sleep(3000); res = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", opts); }
  if (res.getResponseCode() !== 200) return { error: "API Claude odpowiedziało " + res.getResponseCode() + ": " + res.getContentText().slice(0, 200) };
  const body = JSON.parse(res.getContentText());
  return { text: (body.content || []).filter(function (c) { return c.type === "text"; }).map(function (c) { return c.text; }).join("") };
}

function upsert_(item) {
  const s = item.session;
  const sh = sheet_(SESS, HEAD);
  const row = [
    s.id, s.date, s.kind === "strength" ? "siła" : "mobilność", s.status, s.rounds,
    item.items || "", s.note || "", new Date(s.updatedAt || Date.now()), JSON.stringify(s)
  ];
  const n = sh.getLastRow();
  if (n > 1) {
    const ids = sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return String(r[0]); });
    const i = ids.indexOf(String(s.id));
    if (i >= 0) { sh.getRange(i + 2, 1, 1, row.length).setValues([row]); return; }
  }
  sh.appendRow(row);
}
