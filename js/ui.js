"use strict";
/* ---------- effort: one 5-step scale for every session, tap or drag ---------- */
// Old sessions stored 1–10 (rpe); 1–2 → 1, 3–4 → 2 … 9–10 → 5.
const EFF_TXT = ["", "Bardzo lekko", "Lekko", "W sam raz", "Ciężko", "Maksymalnie"];
const EFF_HINT = ["", "ruch, rozgrzewka, zero zmęczenia", "swobodna rozmowa, zapas 3 i więcej powtórzeń", "oddech w zdaniach, zapas około 2 powtórzeń", "oddech urywany, zapas 0–1 powtórzenia", "do granicy, nie dałbym więcej"];
const effOf = x => x && (x.eff || (x.rpe ? Math.ceil(x.rpe / 2) : null)) || null;
const effHead = n => n ? `<b>${EFF_TXT[n]}</b>${EFF_HINT[n]}` : `<b>–</b>`;
function effHtml(n, key, plan){
  return `<section class="sec eff"><div class="eff-h"><h2 class="sec-h">Wysiłek${plan ? " · plan " + esc(plan) : ""}</h2></div><p class="eff-v">${effHead(n)}</p>
    <div class="eff-bar" data-eff="${key}" role="slider" aria-label="Wysiłek od 1 do 5" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${n || ""}">${[1,2,3,4,5].map(k => `<span class="${n >= k ? "on" : ""}" style="height:${40 + k * 12}%"></span>`).join("")}</div></section>`;
}
function paintEff(el, n){ [...el.children].forEach((x, i) => x.classList.toggle("on", n >= i + 1)); el.setAttribute("aria-valuenow", n); const v = el.closest(".eff").querySelector(".eff-v"); if (v) v.innerHTML = effHead(n); }
// What a new value does, per place the bar is used.
const EFF_SET = {
  note(n, el){ const s = current(); if (effOf(s) === n) return; s.eff = n; delete s.rpe; commitSession(s, true); paintEff(el, n); const b = $("[data-act=finish]"); if (b) b.disabled = !noteOk(s); },
};
// Pointer events update the bar in place, so a drag is not cut short by a re-render.
function bindEff(){
  document.querySelectorAll(".eff-bar[data-eff]").forEach(el => {
    if (el.dataset.bound) return; el.dataset.bound = "1"; let on = false;
    const set = e => { const r = el.getBoundingClientRect(), t = Math.min(.9999, Math.max(0, (e.clientX - r.left) / r.width)), f = EFF_SET[el.dataset.eff]; if (f) f(Math.floor(t * 5) + 1, el); };
    el.addEventListener("pointerdown", e => { on = true; try { el.setPointerCapture(e.pointerId); } catch(_){} set(e); });
    el.addEventListener("pointermove", e => { if (on) set(e); });
    ["pointerup", "pointercancel"].forEach(k => el.addEventListener(k, () => { on = false; }));
  });
}
/* ---------- sheets ---------- */
function sheetHtml(){
  const sh = S.sheet; if (!sh) return "";
  const s = current();
  if (sh.type === "edit"){
    const it = s.items.find(i => i.key === sh.key), ex = exOf(it.ex), idx = s.items.indexOf(it), slot = slotOfItem(it);
    const loads = loadsOf(ex), step = ex.timed ? 15 : ex.dist || ex.minutes ? 5 : 1;
    const variants = it.swap ? [] : ladderOf(slot).filter(id => EX[id] && exAvailable(EX[id]));
    const diff = it.load !== it.planLoad || it.ex !== it.planEx ? "inaczej niż w planie" : it.reps === it.planReps ? "jak w planie" : (it.reps > it.planReps ? "+" : "−") + (ex.side ? Math.abs(it.reps - it.planReps) : shownReps(ex, Math.abs(it.reps - it.planReps))) + (ex.timed ? " s" : ex.dist ? " m" : ex.minutes ? " min" : "") + (ex.side ? " na stronę" : "") + " względem planu";
    const cols = Math.min(3, loads.length);
    return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Zmiana ćwiczenia">${SHEET_X}
      <header><h2>${esc(ex.name)}</h2><p class="sub">${s.block ? BLOCK_TITLE[s.block.type] : s.kind === "strength" ? "Circuit, " + (idx+1) + "/" + s.items.length : kindLabel(s.kind)} · w planie ${esc(exOf(it.planEx).name + " " + doseText(it.planEx, it.planLoad, it.planReps))}</p>
        ${(slot && slot.claudeNote || it.claudeNote) && !it.swap ? `<p class="sub">Od Claude: ${esc(slot && slot.claudeNote || it.claudeNote)}</p>` : ""}</header>
      ${variants.length > 1 ? `<section class="sec"><h3 class="sec-h">Variant</h3><div class="chips">${variants.map(id => { const v = EX[id];
        return `<button class="pill ${it.ex === id ? "on" : ""}" data-act="set-variant" data-ex="${id}" aria-pressed="${it.ex === id}">${esc(v.name + (v.tag ? " (" + v.tag + ")" : ""))}</button>`; }).join("")}</div></section>` : ""}
      ${ex.bb ? (() => { const kg = LOADS[it.load] ? LOADS[it.load].bb : BAR, i = BB_LOADS.indexOf(it.load);
        return `<section class="sec"><h3 class="sec-h">Load</h3><div class="big-step"><button data-act="bbload" data-d="-1" aria-label="Lżej o 2,5 kg" ${i <= 0 ? "disabled" : ""}>−</button><span class="v"><b>${plKg(kg)} kg</b></span><button data-act="bbload" data-d="1" aria-label="Ciężej o 2,5 kg" ${i >= BB_LOADS.length - 1 ? "disabled" : ""}>+</button></div></section>`; })()
      : loads.length > 1 ? `<section class="sec"><h3 class="sec-h">Load</h3><div class="choices" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${loads.map(l =>
        `<button class="choice ${it.load === l ? "on" : ""}" style="flex-direction:row;gap:8px" data-act="set-load" data-l="${l}" aria-pressed="${it.load === l}">${dotHtml(l)}${esc(LOADS[l].label)}</button>`).join("")}</div></section>` : ""}
      <section class="sec"><h3 class="sec-h">${ex.timed ? "Time" : ex.dist ? "Distance" : ex.minutes ? "Time" : ex.interval ? "Rounds" : "Reps"}${s.kind === "strength" && !s.block ? " per round" : ""}</h3>
        <div class="big-step"><button data-act="reps" data-d="-${step}" aria-label="Mniej" ${it.reps - step < 1 ? "disabled" : ""}>−</button><span class="v"><b>${repTxt(ex, it.reps)}${ex.timed ? " s" : ex.dist ? " m" : ex.minutes ? " min" : ""}</b><span>${esc(diff)}</span></span><button data-act="reps" data-d="${step}" aria-label="Więcej">+</button></div></section>
      <p class="note">${it.swap || s.block ? "Zmiana tylko na dziś. Plan się nie zmienia." : "Zmiana zostaje w planie na następne treningi."}</p>
      <div class="card"><button class="row" data-act="swap" style="min-height:56px"><span class="main"><span class="name" style="font-weight:400">${it.swap ? "Wróć do planu albo zamień na inne" : s.kind === "mobility" ? "Zamień na inne ćwiczenie" : "Zamień na inne ćwiczenie (tylko dziś)"}</span></span>${CHEV}</button></div>
      <button class="btn" data-act="close">Gotowe</button></div>`;
  }
  if (sh.type === "swap"){
    const it = s.items.find(i => i.key === sh.key), slot = slotOfItem(it);
    const lad = ladderOf(slot), slotBb = !!exOf(slot.ex).bb;
    const order = {"łatwiej":1, "podobnie":2, "trudniej":3};
    const opts = Object.values(EX).filter(e => e.pattern === slot.pattern && e.id !== it.ex && exAvailable(e) && (e.id === slot.ex || !lad.includes(e.id)))
      .sort((a, b) => (a.id === slot.ex ? -1 : a.alt ? order[a.rel] || 4 : 0) - (b.id === slot.ex ? -1 : b.alt ? order[b.rel] || 4 : 0));
    const optRow = e => { const load = e.id === slot.ex ? fitLoad(e, slot.load) : fitLoad(e, e.def[0]), reps = e.id === slot.ex ? slot.reps : e.def[1];
      return `<button class="row swap-row" data-act="pick" data-ex="${esc(e.id)}"><span class="main"><span class="name">${esc(e.name)}</span><span class="sub">${dotHtml(load)}${esc(doseText(e.id, load, reps))}</span></span><span class="tag">${e.id === slot.ex ? "z planu" : e.alt ? esc(e.rel || "zamiennik") : !!e.bb !== slotBb ? (e.bb ? "sztanga" : "bez sztangi") : "wariant"}</span></button>`; };
    return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Zamiana ćwiczenia">${SHEET_X}
      <header class="head"><div><h2>Zamień</h2><p class="sub">${esc(exOf(it.ex).name)} · ${esc(PATTERNS[slot.pattern] || "")}</p></div></header>
      <div class="card">${opts.map(optRow).join("") || `<div class="row"><span class="main"><span class="sub">Brak zamienników dla włączonego sprzętu.</span></span></div>`}</div></div>`;
  }
  if (sh.type === "confirm"){
    return `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(sh.title)}">${SHEET_X}
      <header><h2>${esc(sh.title)}</h2><p class="sub">${esc(sh.text)}</p></header>
      <div class="push" style="margin-top:0"><button class="btn" data-act="${sh.act}">${esc(sh.yes)}</button><button class="btn plain" data-act="close">${esc(sh.no)}</button></div></div>`;
  }
  return "";
}
const SHEET_X = `<button class="icon-btn sheet-x" data-act="close" aria-label="Zamknij"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
function renderSheet(){
  const w = $("#sheet");
  if (!S.sheet){ w.hidden = true; w.innerHTML = ""; return; }
  w.innerHTML = sheetHtml(); w.hidden = false;
}

/* ---------- render ---------- */
function render(){
  const v = S.view;
  const html = !S.loaded || v === "home" ? renderHome() : v === "note" ? renderNote() : v === "detail" ? (S.sessions[S.detail?.id] ? doneScreen(S.sessions[S.detail.id]) : renderHome()) : v === "plan" ? planScreen(S.detail.date, S.detail.kind) : v === "progress" ? renderProgress() : v === "cat" ? renderCat() : v === "coverage" ? renderCoverage()
    : v === "settings" ? renderSettings() : renderPrep();
  $("#app").innerHTML = html;
  S.shownDay = today();
  fitDayTitle();
  renderSheet();
  bindEff();
}
function fitDayTitle(){
  const h = $(".day-h"); if (!h) return;
  let fits; try { fits = JSON.parse(h.dataset.fits); } catch(e){ return; }
  for (const t of fits){ h.textContent = t; if (h.scrollWidth <= h.clientWidth + 1) return; }
}
window.addEventListener("resize", fitDayTitle);
// Screens have a depth; going deeper slides the new screen in from the right over the old one, going back slides the old one away (like the back swipe).
const DEPTH = {home:0, prep:1, detail:1, plan:1, settings:1, progress:1, note:2, cat:2};
let noAnim = false;
function go(view){
  const from = S.view, d = (DEPTH[view] ?? 1) - (DEPTH[from] ?? 1);
  const anim = !noAnim && d !== 0 && from !== view && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const snap = anim ? snapLayer() : null;
  if (view !== "note") S.editId = null; S.view = view; S.sheet = null; render(); window.scrollTo(0, 0);
  if (snap) slide(snap, d > 0 ? "push" : "pop");
}
// Snapshot of the screen as it is now, fixed in place.
function snapLayer(){
  const app = $("#app"), layer = document.createElement("div"); layer.className = "swp-layer";
  const inner = app.cloneNode(true); inner.style.transform = `translateY(${-scrollY}px)`; layer.appendChild(inner);
  const shade = document.createElement("div"); shade.className = "swp-shade";
  return {layer, shade};
}
function slide({layer, shade}, kind){
  const app = $("#app"), w = innerWidth, ms = 280, ease = `transform ${ms}ms cubic-bezier(.2,.8,.2,1), opacity ${ms}ms`;
  if (kind === "push"){
    // Old screen underneath, drifting left and darkening; new screen on top, coming from the right.
    Object.assign(layer.style, {zIndex:"38", boxShadow:"none"}); shade.style.zIndex = "39"; shade.style.opacity = "0";
    document.body.append(layer, shade);
    Object.assign(app.style, {position:"relative", zIndex:"40", background:"var(--bg)", boxShadow:"-8px 0 24px rgba(0,0,0,.25)", transform:`translateX(${w}px)`});
    app.getBoundingClientRect();
    [app, layer, shade].forEach(el => el.style.transition = ease);
    app.style.transform = "translateX(0)"; layer.style.transform = `translateX(${-w * 0.3}px)`; shade.style.opacity = "0.35";
  } else {
    // Old screen on top, sliding right; the screen we return to waits underneath.
    document.body.append(shade, layer);
    app.style.transform = `translateX(${-w * 0.3}px)`; app.getBoundingClientRect();
    [app, layer, shade].forEach(el => el.style.transition = ease);
    layer.style.transform = `translateX(${w}px)`; app.style.transform = "translateX(0)"; shade.style.opacity = "0";
  }
  setTimeout(() => { layer.remove(); shade.remove(); ["transition", "transform", "position", "zIndex", "background", "boxShadow"].forEach(k => app.style[k] = ""); }, ms + 30);
}
// Opening the app shows today: always after the date changed, and after a break of 30 min or more unless a workout or its note is open.
let hiddenAt = 0;
function backToToday(force){
  if (!force && (S.view === "prep" || S.view === "note")) return;
  Object.assign(S, {view:"home", sel:null, weekOff:0, sheet:null, kind:null}); render(); window.scrollTo(0, 0);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden){ hiddenAt = Date.now(); return; }
  if (!S.loaded) return;
  if (S.shownDay && S.shownDay !== today()) backToToday(true);
  else if (hiddenAt && Date.now() - hiddenAt >= 30 * 60000) backToToday(false);
});
setInterval(() => { if (S.loaded && !document.hidden && S.shownDay && S.shownDay !== today()) backToToday(true); }, 60000);

/* ---------- actions ---------- */
function setItem(s, it, patch, variant = false){
  Object.assign(it, patch);
  const sl = it.part != null ? null : slotByKey(it.key);
  if (sl && !it.swap){
    if (variant) sl.ex = it.ex;
    if (sl.ex === it.ex){ sl.load = it.load; sl.reps = it.reps; commitProfile(); }
  }
  commitSession(s);
}
function finishSession(){
  const s = current(), past = !!S.editId;
  clearTimeout(debouncers[s.id]);
  const t = $("#sessionNote"); if (t) s.note = t.value;
  s.status = "done"; s.finishedAt = Date.now();
  s.items.forEach(it => it.done = s.rounds);
  // Row 2000 m time straight from the note ("8:45", "8 min 45 s"), so the level shows up even before Claude's review.
  if (s.items.some(it => exOf(it.ex).test)){ const n = s.note || "", m = n.match(/(\d{1,2})\s*[:.]\s*(\d{2})\b/) || n.match(/(\d{1,2})\s*min\w*\s*(?:i\s*)?(\d{1,2})\s*s/i);
    const sec = m ? +m[1] * 60 + +m[2] : 0; if (sec >= 300 && sec <= 900) s.bench = {...(s.bench || {}), row2000:sec}; }
  S.micHint = false;
  const had = reviewFor(s.id);
  if (!noteOk(s)) return;
  if (s.kind === "strength") s.dur = s.timed ? tmSecs(tmOf(s)) : null;
  const legacy = () => (s.note || "") !== (s.reviewedNote || "") || (s.dur || 0) !== (s.reviewedDur || 0) || JSON.stringify(s.score || {}) !== (s.reviewedScore || "{}") || modsKey(s) !== (s.reviewedMods || modsKey(s));
  const changed = !had || photoOf(s.id) || (s.reviewedKey ? reviewKey(s) !== s.reviewedKey : legacy() || past);
  if (s.kind !== "mobility" && Sync.url && changed){
    s.reviewedDur = s.dur || 0; s.reviewedScore = JSON.stringify(s.score || {}); s.reviewedMods = modsKey(s); s.reviewedKey = reviewKey(s);
    s.reviewedNote = s.note || "";
    commitSession(s);
    Sync.setPendingReview({id:s.id, force:!!had, prev:had ? had.title + had.text : ""});
    if (past){ S.detail = {id:s.id}; go("detail"); } else go("prep");
    Sync.review(s.id, !!had);
  } else { commitSession(s); if (past){ S.detail = {id:s.id}; go("detail"); } else go(s.kind !== "mobility" && Sync.url ? "prep" : "home"); }
}

async function backup(btn){
  const data = JSON.stringify({app:"trening", v:2, exportedAt:new Date().toISOString(), profile:S.profile, sessions:S.sessions}, null, 1);
  const name = "trening-kopia-" + today() + ".json";
  try {
    const file = new File([data], name, {type:"application/json"});
    if (navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:"Kopia zapasowa: trening"}); markBackup(); btn.textContent = "Kopia zapisana"; return; }
  } catch(e){ if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], {type:"application/json"})); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  markBackup(); btn.textContent = "Kopia zapisana";
}
function markBackup(){ S.profile.lastBackup = today(); commitProfile(); }
function backupAgeDays(){ if (!S.profile.lastBackup) return null; return Math.round((parseYmd(today()) - parseYmd(S.profile.lastBackup)) / 86400000); }
function importBackup(file){
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || d.app !== "trening" || !d.profile || typeof d.sessions !== "object") throw 0;
      S.profile = mergeProfile(d.profile); S.sessions = d.sessions; Store.replaceAll(S.profile, S.sessions);
      S.notice = "Kopia wczytana: " + Object.keys(d.sessions).length + " sesji.";
    } catch(e){ S.notice = "To nie jest kopia zapasowa z tej aplikacji."; }
    render();
  };
  r.readAsText(file);
}


/* ---------- events ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (!b){ if (e.target.id === "sheet" && S.sheet && S.sheet.type !== "confirm"){ S.sheet = null; renderSheet(); } return; }
  if (!S.loaded) return;
  const act = b.dataset.act, s = current();
  const editIt = () => s.items.find(i => i.key === S.sheet?.key);
  switch (act){
    case "go": go(b.dataset.v); break;
    case "cat": S.cat = b.dataset.c; S.catGroup = null; go("cat"); break;
    case "home": go("home"); break;
    case "open": S.kind = b.dataset.kind; go("prep"); break;
    case "detail": S.detail = {id:b.dataset.id}; go("detail"); break;
    case "plan-detail": S.detail = {date:b.dataset.date, kind:b.dataset.kind}; go("plan"); break;
    case "cat-g": S.catGroup = b.dataset.g; render(); break;
    case "pick-day": S.sel = b.dataset.date === today() ? null : b.dataset.date; render(); break;
    case "wk": { const off = Math.max(wkMin(), Math.min(WK_MAX, (S.weekOff || 0) + Number(b.dataset.d))); if (off === (S.weekOff || 0)) break; S.weekOff = off;
      const w = parseYmd(selDate()).getDay(), m = mondayOf(today(), off); m.setDate(m.getDate() + (w + 6) % 7); const nd = off === 0 ? today() : ymd(m); S.sel = nd === today() ? null : nd; render(); break; }
    case "wk-today": S.weekOff = 0; S.sel = null; render(); break;
    case "theme": try { if (b.dataset.v === "auto") localStorage.removeItem(KEY_THEME); else localStorage.setItem(KEY_THEME, b.dataset.v); } catch(e2){} applyTheme(); render(); break;
    case "back-prep": if (S.editId){ S.detail = {id:S.editId}; S.editId = null; go("detail"); } else go("prep"); break;
    case "edit-done": S.editId = b.dataset.id; go("note"); break;
    case "note": go("note"); break;
    case "photo-del": setPhoto(current().id, null); render(); break;
    case "finish": finishSession(); break;
    case "review": Sync.retryReview(); break;
    case "preview-all": Sync.previewAll(); break;
    case "seen": try { localStorage.setItem("trening:seen-review", b.dataset.id); } catch(e2){} render(); break;
    case "edit": if (s.status !== "prep") return; S.sheet = {type:"edit", key:b.dataset.key || S.sheet?.key}; renderSheet(); break;
    case "set-variant": { const it = editIt(); if (!it) return; const ex = EX[b.dataset.ex]; if (!ex || ex.id === it.ex) return;
      setItem(s, it, {ex:ex.id, load:fitLoad(ex, loadsOf(ex).includes(it.load) ? it.load : ex.def[0]), reps:ex.def[1]}, true); renderSheet(); render(); break; }
    case "bbload": { const it = editIt(); if (!it) return; const i = BB_LOADS.indexOf(it.load) + Number(b.dataset.d); if (i < 0 || i >= BB_LOADS.length) return; setItem(s, it, {load:BB_LOADS[i]}); renderSheet(); render(); break; }
    case "set-load": { const it = editIt(); if (!it) return; setItem(s, it, {load:b.dataset.l}); renderSheet(); render(); break; }
    case "reps": { const it = editIt(); if (!it) return; const r = it.reps + Number(b.dataset.d); if (r < 1) return; setItem(s, it, {reps:r}); renderSheet(); render(); break; }
    case "swap": S.sheet = {type:"swap", key:S.sheet.key}; renderSheet(); break;
    case "rx": { s.rx = b.dataset.v === "1"; if (s.rx){ s.items.forEach(it => Object.assign(it, {ex:it.planEx, load:it.planLoad, reps:it.planReps, swap:null})); s.pfmt = {}; } commitSession(s, true); render(); break; }
    case "pf-swap": S.sheet = {type:"swap", key:b.dataset.key, perf:true}; renderSheet(); break;
    case "pick": {
      const it = editIt(); if (!it) return;
      const id = b.dataset.ex, ex = exOf(id), sl = slotOfItem(it);
      if (sl && id === sl.ex) setItem(s, it, {ex:id, load:fitLoad(ex, sl.load), reps:sl.reps, swap:null});
      else if (s.kind === "mobility") setItem(s, it, {ex:id, load:fitLoad(ex, ex.def[0]), reps:ex.def[1], swap:null}, true);
      else { Object.assign(it, {ex:id, load:fitLoad(ex, ex.def[0]), reps:ex.def[1], swap:{from:it.swap ? it.swap.from : it.ex}}); commitSession(s); }
      S.sheet = S.sheet && S.sheet.perf ? null : {type:"edit", key:it.key}; renderSheet(); render(); break;
    }
    case "rounds": { const r = Math.max(1, Math.min(5, s.rounds + Number(b.dataset.d))); s.rounds = r; S.profile.rounds = r; commitProfile(); commitSession(s); render(); break; }
    case "mic": { S.micHint = true; render(); const t = $("#sessionNote"); if (t) t.focus(); break; }
    case "mday": { const d = Number(b.dataset.d), sc = S.profile.mobSchedule || [0,1,2,3,4,5,6]; S.profile.mobSchedule = sc.includes(d) ? sc.filter(x => x !== d) : [...sc, d].sort(); commitProfile(); render(); break; }
    case "cday": { const d = Number(b.dataset.d), sc = S.profile.condSchedule || []; S.profile.condSchedule = sc.includes(d) ? sc.filter(x => x !== d) : [...sc, d].sort(); commitProfile(); render(); break; }
    case "day": { const d = Number(b.dataset.d), sc = S.profile.schedule; S.profile.schedule = sc.includes(d) ? sc.filter(x => x !== d) : [...sc, d].sort(); commitProfile(); render(); break; }
    case "backup": backup(b); break;
    case "sync-on": {
      const url = ($("#syncUrl")?.value || "").trim();
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)){ Sync.err = "To nie wygląda na adres z Apps Script. Powinien zaczynać się od https://script.google.com/macros/s/ i kończyć na /exec."; render(); break; }
      S.busy = true; Sync.err = null; render();
      Sync.connect(url).then(ok => { S.busy = false; if (!ok){ Sync.disconnect(); Sync.err = "Nie udało się połączyć. Sprawdź, czy wdrożenie ma dostęp „Każdy”, i spróbuj jeszcze raz."; } render(); });
      break;
    }
    case "sync-now": Sync.pull().then(() => render()); break;
    case "sync-off": S.sheet = {type:"confirm", title:"Odłączyć arkusz?", text:"Dane w arkuszu zostaną. Nowe sesje będą zapisywać się tylko w telefonie.", act:"sync-off-yes", yes:"Odłącz", no:"Anuluj"}; renderSheet(); break;
    case "sync-off-yes": Sync.disconnect(); S.sheet = null; render(); break;
    case "reset": S.sheet = {type:"confirm", title:"Przywrócić plan startowy?", text:"Ćwiczenia, ciężary i powtórzenia wrócą do planu startowego. Historia zostaje.", act:"reset-yes", yes:"Przywróć", no:"Anuluj"}; renderSheet(); break;
    case "reset-yes": S.profile.slots = DEFAULT_SLOTS.map(x => ({...x})); S.profile.rounds = 3; S.profile.over = {}; commitProfile(); S.sheet = null; render(); break;
    case "close": S.sheet = null; renderSheet(); break;
  }
});
document.addEventListener("input", e => {
  if (e.target.dataset.sc){ const s = current(), sc = s.score || (s.score = {}), k = e.target.dataset.sc, el = e.target;
    let d = el.value.replace(/\D/g, "");
    if (el.dataset.tp){ d = d.slice(0, 2); el.value = d;
      const g = el.closest("[data-tg]"), mi = g.querySelector("[data-tp=m]"), si = g.querySelector("[data-tp=s]");
      const mv = mi.value, sv = si.value, v = (+mv || 0) * 60 + (+sv || 0);
      sc[k] = (mv || sv) && (+sv || 0) < 60 && v > 0 ? v : null; g.classList.toggle("bad", (mv !== "" || sv !== "") && sc[k] == null);
      if (el === mi && d.length === 2) si.focus(); }
    else { d = d.slice(0, +el.maxLength || 3); el.value = d; sc[k] = d === "" ? null : +d; }
    commitSession(s, true); const b = $("[data-act=finish]"); if (b) b.disabled = !noteOk(s); }
  if (e.target.dataset.note){ const s = current(); s.note = e.target.value; commitSession(s, true); }
  if (e.target.dataset.tm){ const s = current(), t = tmOf(s), k = e.target.dataset.tm; t[k] = e.target.value.replace(/\D/g, "").slice(0, 2); e.target.value = t[k];
    if (k === "m" && t.m.length === 2) $("#durS").focus();
    s.dur = tmSecs(t); commitSession(s, true);
    const b = $("[data-act=finish]"); if (b) b.disabled = !noteOk(s); const ms = $("#durM") && $("#durM").closest(".lab-ms"); if (ms) ms.classList.toggle("bad", tmBad(s)); }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.pfp != null){ const s = current(), pi = +t.dataset.pfp, n = parseInt(t.value, 10), c = partCount(s.block.parts[pi].fmt);
    if (!(n > 0)){ t.value = partDone(s, pi); return; }
    (s.pfmt || (s.pfmt = {}))[pi] = n; t.value = n; s.rx = false; commitSession(s, true);
    const row = t.closest("[data-pfrowp]"); if (row) row.classList.toggle("chg", partMod(s, pi)); return; }
  if (t.dataset.pf){ const s = current(), it = s.items.find(i => i.key === t.dataset.key); if (!it) return; const ex = exOf(it.ex);
    if (t.dataset.pf === "load"){
      if (ex.bb){ const kg = parseFloat(String(t.value).replace(",", ".")); if (!(kg > 0)){ t.value = plKg(LOADS[it.load].bb); return; }
        it.load = BB_LOADS.reduce((a, l) => Math.abs(LOADS[l].bb - kg) < Math.abs(LOADS[a].bb - kg) ? l : a); t.value = plKg(LOADS[it.load].bb); }
      else it.load = t.value; }
    else { const n = parseInt(t.value, 10), show = () => ex.side ? it.reps : shownReps(ex, it.reps); if (!(n > 0)){ t.value = show(); return; } it.reps = ex.side ? n : storedReps(ex, n); t.value = show(); }
    s.rx = false; commitSession(s, true);
    const row = t.closest("[data-pfrow]"); if (row) row.classList.toggle("chg", itemMod(it)); return; }
  if (t.dataset.eq){ S.profile.equip[t.dataset.eq] = t.checked; commitProfile(); render(); }
  if (t.id === "importFile" && t.files && t.files[0]) importBackup(t.files[0]);
  if (t.id === "pm5File" && t.files && t.files[0]) takePhoto(t.files[0]);
  if (t.dataset.scft){ const s = current(), sc = s.score || (s.score = {}); sc.ft = t.checked; if (!t.checked) sc.time = null; commitSession(s); render(); const i = $("[data-sc=time]"); if (i) i.focus(); }
  if (t.dataset.timed){ const s = current(); s.timed = t.checked; s.dur = s.timed ? tmSecs(tmOf(s)) : null; commitSession(s); render(); if (s.timed) $("#durM").focus(); }
});
// Swipes, like native iOS:
// - any screen with a back arrow, drag right: the screen slides away and the previous one shows underneath (same as the arrow);
// - day screen, drag left/right: the next / previous day slides in;
// - week strip left/right: previous / next week (quick swipe);
// - open sheet, swipe down from its top: close.
// The target screen is rendered for real under a snapshot of the current one; a cancelled drag restores the state.
let swp = null;
const noSwipe = el => el.closest("input, textarea, select, .eff-bar, [data-noswipe]");
const backBtn = () => document.querySelector('#app .topbar .icon-btn, #app .head .icon-btn[aria-label^="Wróć"]');
const SNAP_KEYS = ["view", "sel", "weekOff", "detail", "editId", "kind", "sheet"];
// Day swipe: only the day's content moves, the next day's page sits right next to it; header and week strip update after the swipe.
function dayDragStart(g, dir){
  const body = $(".day-body"), track = body && $(".day-track"); if (!track){ g.dead = true; return false; }
  const nd = addDays(selDate(), dir < 0 ? 1 : -1), gap = 32, pw = body.offsetWidth + gap;
  const page = document.createElement("div"); page.className = "day-page day-next"; page.style.transform = `translateX(${-dir * pw}px)`; page.innerHTML = dayPageHtml(nd);
  track.appendChild(page); Object.assign(g, {nd, track, w:pw, dir}); track.style.willChange = "transform"; return true;
}
function dayDragEnd(g, dx, v){
  const done = Math.abs(dx) > g.w * 0.3 || (Math.abs(v) > 0.5 && Math.sign(v) === g.dir), ms = 220;
  g.track.style.transition = `transform ${ms}ms cubic-bezier(.2,.8,.2,1)`;
  requestAnimationFrame(() => { g.track.style.transform = `translateX(${done ? g.dir * g.w : 0}px)`; });
  setTimeout(() => {
    if (done){ const off = Math.round((mondayOf(g.nd) - mondayOf(today())) / (7 * 86400000)); S.weekOff = off; S.sel = g.nd === today() ? null : g.nd; render(); }
    else { g.track.style.transition = g.track.style.transform = g.track.style.willChange = ""; const n = $(".day-next"); if (n) n.remove(); }
  }, ms + 20);
}
// Back swipe: snapshot of the leaving screen above the real previous screen, which waits underneath with a slight parallax and shade.
function dragStart(g, dir){
  const w = innerWidth, y = scrollY, app = $("#app");
  const layer = document.createElement("div"); layer.className = "swp-layer";
  const inner = app.cloneNode(true); inner.style.transform = `translateY(${-y}px)`; layer.appendChild(inner);
  const shade = document.createElement("div"); shade.className = "swp-shade";
  document.body.append(shade, layer);
  g.snap = Object.fromEntries(SNAP_KEYS.map(k => [k, S[k]])); g.scroll = y; g.layer = layer; g.shade = shade; g.dir = dir; g.w = w;
  noAnim = true; try { backBtn().click(); } finally { noAnim = false; }
  app.style.willChange = "transform";
}
function dragMove(g, dx){
  if (g.mode === "day"){ g.track.style.transform = `translateX(${dx}px)`; return; }
  const p = Math.max(0, Math.min(1, Math.abs(dx) / g.w));
  g.layer.style.transform = `translateX(${dx}px)`;
  $("#app").style.transform = `translateX(${-(1 - p) * g.w * 0.3}px)`;
  g.shade.style.opacity = String(0.35 * (1 - p));
}
function dragEnd(g, dx, v){
  if (g.mode === "day") return dayDragEnd(g, dx, v);
  const done = Math.abs(dx) > g.w * 0.3 || (Math.abs(v) > 0.5 && Math.sign(v) === g.dir);
  const app = $("#app"), ms = 220, ease = `transform ${ms}ms cubic-bezier(.2,.8,.2,1), opacity ${ms}ms`;
  [g.layer, app, g.shade].forEach(el => el.style.transition = ease);
  requestAnimationFrame(() => {
    g.layer.style.transform = `translateX(${done ? g.w : 0}px)`;
    app.style.transform = done ? "translateX(0)" : `translateX(${-g.w * 0.3}px)`;
    g.shade.style.opacity = done ? "0" : "0.35";
  });
  setTimeout(() => {
    g.layer.remove(); g.shade.remove(); app.style.transition = app.style.transform = app.style.willChange = "";
    if (!done){ Object.assign(S, g.snap); render(); window.scrollTo(0, g.scroll); }
  }, ms + 20);
}
// Move/end listeners sit on the touched element itself: the drag re-renders #app, and a detached element no longer bubbles its touch events to document.
document.addEventListener("touchstart", e => {
  const t = e.touches[0]; swp = e.touches.length === 1 && !noSwipe(e.target) ? {x:t.clientX, y:t.clientY, t:Date.now(), strip:!!e.target.closest(".wk-strip"), sheet:e.target.closest(".sheet")} : null;
  if (!swp) return; const el = e.target, off = () => { el.removeEventListener("touchmove", swpMove); el.removeEventListener("touchend", swpEnd); el.removeEventListener("touchcancel", swpCancel); };
  swp.off = off; el.addEventListener("touchmove", swpMove, {passive:false}); el.addEventListener("touchend", swpEnd, {passive:true}); el.addEventListener("touchcancel", swpCancel, {passive:true});
}, {passive:true});
function swpMove(e){
  const g = swp; if (!g || g.dead || S.sheet || g.strip) return;
  const t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
  if (!g.mode){
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) < 1.2 * Math.abs(dy)){ g.dead = true; return; }
    if (S.view === "home"){ const nd = addDays(selDate(), dx < 0 ? 1 : -1), off = Math.round((mondayOf(nd) - mondayOf(today())) / (7 * 86400000));
      if (off < wkMin() || off > WK_MAX){ g.dead = true; return; } g.mode = "day"; }
    else if (dx > 0 && backBtn()) g.mode = "back";
    else { g.dead = true; return; }
    if (g.mode === "day"){ if (!dayDragStart(g, dx > 0 ? 1 : -1)) return; } else dragStart(g, 1);
  }
  if (e.cancelable) e.preventDefault();
  g.lastX = t.clientX; g.lastT = e.timeStamp; g.vx = g.prevX != null ? (t.clientX - g.prevX) / Math.max(1, g.lastT - g.prevT) : 0; g.prevX = t.clientX; g.prevT = g.lastT;
  dragMove(g, g.dir > 0 ? Math.max(0, dx) : Math.min(0, dx));
}
function swpEnd(e){
  const g = swp; swp = null; if (!g) return; g.off();
  const t = e.changedTouches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
  if (g.mode){ dragEnd(g, g.dir > 0 ? Math.max(0, dx) : Math.min(0, dx), g.vx || 0); return; }
  if (S.sheet){ if (g.sheet && dy > 80 && Math.abs(dy) > 1.5 * Math.abs(dx) && g.sheet.scrollTop <= 0){ S.sheet = null; renderSheet(); } return; }
  if (g.strip && Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)){ const btn = document.querySelector(`[data-act=wk][data-d="${dx < 0 ? 1 : -1}"]`); if (btn && !btn.disabled) btn.click(); }
}
function swpCancel(){ const g = swp; swp = null; if (!g) return; g.off(); if (g.mode) dragEnd(g, 0, 0); }
document.addEventListener("keydown", e => { if (e.key === "Escape" && S.sheet){ S.sheet = null; renderSheet(); } });

// Number fields: the whole value is selected on tap, so typing replaces it and one Backspace clears it.
// A second tap on a field that already has focus places the cursor normally, for changing one digit.
document.addEventListener("focusin", e => {
  const el = e.target;
  if (!(el instanceof HTMLInputElement) || !(el.dataset.pf || el.dataset.pfp != null || el.dataset.sc || el.dataset.tm)) return;
  setTimeout(() => { if (document.activeElement === el && el.value) try { el.setSelectionRange(0, el.value.length); } catch(err){ el.select(); } }, 0);
});
