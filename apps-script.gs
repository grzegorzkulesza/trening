// Trening na dziś: synchronizacja aplikacji z tym arkuszem.
// Wklej całość w Rozszerzenia → Apps Script, zapisz i wdróż jako aplikację internetową.

const SESS = "Sesje";
const PLAN = "Plan";
const HEAD = ["id", "data", "rodzaj", "status", "rundy", "odczucie", "uwagi", "notatka", "ćwiczenia", "ocena", "zmiany na następny raz", "zapisano", "json"];

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
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
  return out_({ ok: true, profile: profile, sessions: sessions });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.profile) {
      const plan = sheet_(PLAN);
      plan.getRange("A1").setValue(JSON.stringify(body.profile));
      plan.getRange("A2").setValue("Plan zapisany przez aplikację: " + new Date().toLocaleString("pl-PL"));
      const rows = (body.planText || []).map(function (r) { return [r[0], r[1]]; });
      plan.getRange(4, 1, Math.max(plan.getMaxRows() - 3, 1), 2).clearContent();
      if (rows.length) { plan.getRange(3, 1, 1, 2).setValues([["Ćwiczenie", "Dawka"]]); plan.getRange(4, 1, rows.length, 2).setValues(rows); }
    }
    (body.sessions || []).forEach(upsert_);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function upsert_(item) {
  const s = item.session;
  const sh = sheet_(SESS, HEAD);
  const row = [
    s.id, s.date, s.kind === "strength" ? "siła" : "mobilność", s.status, s.rounds,
    item.feel || "", item.flags || "", s.note || "", item.items || "",
    s.assessment ? s.assessment.title + " " + s.assessment.text : "", item.changes || "", new Date(s.updatedAt || Date.now()), JSON.stringify(s)
  ];
  const n = sh.getLastRow();
  if (n > 1) {
    const ids = sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return String(r[0]); });
    const i = ids.indexOf(String(s.id));
    if (i >= 0) { sh.getRange(i + 2, 1, 1, row.length).setValues([row]); return; }
  }
  sh.appendRow(row);
}
