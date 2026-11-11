// Trening na dziś: magazyn danych aplikacji i pośrednik do Claude.
// Wklej całość w Rozszerzenia → Apps Script, zapisz i wdróż jako aplikację internetową.
// Cała logika ocen i planu jest w aplikacji (GitHub), więc tego skryptu nie trzeba już aktualizować przy zmianach treningu.
// Klucz: Ustawienia projektu → Właściwości skryptu → ANTHROPIC_API_KEY.

const SESS = "Sesje";
const PLAN = "Plan";
const REVIEWS = "Oceny";
const HEAD = ["id", "data", "rodzaj", "status", "rundy", "plan na trening", "notatka", "zapisano", "json"];
const REVIEW_HEAD = ["id", "data", "ocena", "uzasadnienie", "zmiany w planie", "zapisano"];
const MODEL = "claude-sonnet-5-5";

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

// Arkusz potrafi zamienić tekst "2026-11-11" na datę; wtedy porównujemy datę w formacie RRRR-MM-DD.
function idOf_(v) {
  return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(v);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const sh = sheet_(SESS, HEAD);
  const plan = sheet_(PLAN);
  const sessions = {};
  const n = sh.getLastRow();
  if (n > 1) {
    sh.getRange(2, HEAD.length, n - 1, 1).getValues().forEach(function (r) {
      try { const s = JSON.parse(r[0]); if (s && s.id) sessions[s.id] = s; } catch (err) {}
    });
  }
  let profile = null;
  const p = plan.getRange("A1").getValue();
  if (p) { try { profile = JSON.parse(p); } catch (err) {} }
  return out_({ ok: true, profile: profile, sessions: sessions, reviews: readReviews_() });
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
    (body.reviews || []).forEach(upsertReview_);
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
  if (body.claude && body.claude.prompt) {
    let r;
    try { r = callClaude_(String(body.claude.prompt), body.claude.effort, body.claude.model); } catch (err) { r = { error: String(err) }; }
    return out_({ ok: true, claude: r });
  }
  return out_({ ok: true });
}

// Uruchom raz w edytorze (Uruchom → testClaude), żeby nadać uprawnienia i sprawdzić klucz API.
function testClaude() {
  const r = callClaude_("Odpowiedz jednym słowem: działa", "low");
  Logger.log(r.error || r.text);
}

// Sonnet 5.5 zawsze najpierw myśli, a max_tokens obejmuje myślenie i odpowiedź, więc limit musi być duży.
function callClaude_(prompt, effort, model) {
  const key = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!key) return { error: "Brak klucza API w ustawieniach skryptu (ANTHROPIC_API_KEY)." };
  const eff = ["low", "medium", "high"].indexOf(effort) >= 0 ? effort : "medium";
  const mdl = /^claude-[a-z0-9.-]+$/.test(model || "") ? model : MODEL;
  const opts = {
    method: "post", contentType: "application/json", muteHttpExceptions: true,
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    payload: JSON.stringify({ model: mdl, max_tokens: 16000, output_config: { effort: eff }, messages: [{ role: "user", content: prompt }] })
  };
  let res = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", opts);
  if (res.getResponseCode() === 529 || res.getResponseCode() >= 500) { Utilities.sleep(3000); res = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", opts); }
  if (res.getResponseCode() !== 200) return { error: "API Claude odpowiedziało " + res.getResponseCode() + ": " + res.getContentText().slice(0, 200) };
  const body = JSON.parse(res.getContentText());
  return { stop: body.stop_reason, text: (body.content || []).filter(function (c) { return c.type === "text"; }).map(function (c) { return c.text; }).join("") };
}

function upsertRow_(sh, id, row) {
  const n = sh.getLastRow();
  if (n > 1) {
    const ids = sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return idOf_(r[0]); });
    const i = ids.indexOf(String(id));
    if (i >= 0) { sh.getRange(i + 2, 1, 1, row.length).setValues([row]); return; }
  }
  sh.appendRow(row);
}

function upsert_(item) {
  const s = item.session;
  upsertRow_(sheet_(SESS, HEAD), s.id, [
    s.id, s.date, s.kind === "strength" ? "Strength" : s.kind === "cond" ? "Conditioning" : "Mobility", s.status, s.rounds,
    item.items || "", s.note || "", new Date(s.updatedAt || Date.now()), JSON.stringify(s)
  ]);
}

function upsertReview_(r) {
  if (!r || !r.id) return;
  upsertRow_(sheet_(REVIEWS, REVIEW_HEAD), r.id, [r.id, r.date || "", r.title || "", r.text || "", r.changes || "", new Date()]);
}
