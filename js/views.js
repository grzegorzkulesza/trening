"use strict";
/* ---------- views ---------- */
const CLAUDE_TAG_DAYS = 7;
// Plan slot behind an item; a block item gets one made from its own plan, so edits stay with today's session.
const slotOfItem = it => it.part != null ? {key:it.key, pattern:exOf(it.planEx).pattern, ex:it.planEx, load:it.planLoad, reps:it.planReps, block:true} : slotByKey(it.key);
function itemRow(it, i, tappable){
  const ex = exOf(it.ex), sl = it.part != null ? null : slotByKey(it.key);
  const changed = it.ex !== it.planEx || it.load !== it.planLoad || it.reps !== it.planReps;
  const byClaude = it.claudeAt ? Date.now() - it.claudeAt < CLAUDE_TAG_DAYS * 86400000 && !changed : sl && sl.claudeAt && Date.now() - sl.claudeAt < CLAUDE_TAG_DAYS * 86400000 && sl.ex === it.ex && sl.load === it.load && sl.reps === it.reps;
  const tag = it.swap ? `<span class="tag">zamiana na dziś</span>` : changed ? `<span class="tag">zmienione</span>` : byClaude ? `<span class="tag up">od Claude</span>` : "";
  const b = boardDose(it.ex, it.load, it.reps);
  const inner = `${boardRow(b.r, ex.name, b.rest, dotHtml(it.load))}${tag}${tappable ? CHEV : ""}`;
  return tappable ? `<button class="row" data-act="edit" data-key="${it.key}">${inner}</button>` : `<div class="row">${inner}</div>`;
}
// Format of a part split for its header: the count in bold ("6 rounds", "5 × 5", "EMOM 8 rounds"), the rest after it,
// and what comes between it and the part before ("potem", "przerwa 3:00"), shown between the two cards.
function fmtParts(f){
  let m;
  if ((m = f.match(/^(\d+) rounds?,? ?(.*)$/))) return {main:m[1] + " rounds", rest:m[2]};
  if ((m = f.match(/^AMRAP (\d+) min,? ?(.*)$/))) return {main:"AMRAP " + m[1] + " min", rest:m[2]};
  if ((m = f.match(/^(Potem )?EMOM (\d+) min(.*)$/))) return {main:"EMOM " + roundsText(+m[2]), rest:"", before:m[1] ? "potem" : ""};
  if ((m = f.match(/^(\d+) intervals? (for time)?(?: · )?(.*)$/))) return {main:m[1] + " intervals", rest:[m[2], m[3]].filter(Boolean).join(" · ")};
  if ((m = f.match(/^(\d+(?:-\d+)+)$/))){ const a = m[1].split("-"); return {main:a.every(x => x === a[0]) ? roundsText(a.length) : m[1], rest:""}; }
  if ((m = f.match(/^(\d+ × [^·]+?)(?: · (.*))?$/))) return {main:m[1], rest:m[2] || ""};
  if ((m = f.match(/^(Część \d+)(?:, )?(.*?)(?: · po (\d+:\d+) przerwy)?$/))) return {main:m[1], rest:m[2], before:m[3] ? "przerwa " + m[3] : ""};
  return {main:f, rest:""};
}
// A block day as cards, one per part: its format as the first row, then the items. rowFn draws one item.
function blockSections(b, items, rowFn, head = "Workout", partFn = null, headFn = null){
  return b.parts.map((p, pi) => { const its = items.filter(it => (it.part || 0) === pi), many = its.length > 1, f = fmtParts(p.fmt);
    return `${f.before && pi ? `<p class="fmt-sep"><i></i>${esc(f.before)}<i></i></p>` : ""}<section class="sec">${pi === 0 && head ? `<h2 class="sec-h">${esc(head)}</h2>` : ""}<div class="card"><div class="fmt-h">${headFn ? headFn(pi, p, f) : `<b>${esc(f.main)}</b>${f.rest ? `<span>${esc(f.rest)}</span>` : ""}`}</div>${partFn ? partFn(pi, p) : ""}${its.map((it, i) => rowFn(it, many ? i : null)).join("")}</div></section>`; }).join("");
}
// Every training screen: title = the name on the day list (Strength / Conditioning / Mobility); date, type and status in the line above.
const kickerOf = (kind, date, b, extra) => [dayLabel(parseYmd(date)), b && BLOCK_TITLE[b.type] !== kindLabel(kind) ? BLOCK_TITLE[b.type] : null, ...(extra || [])].filter(Boolean).join(" · ");
const blockHeader = (kind, date, b) => `<header class="head"><div><p class="kicker">${kickerOf(kind, date, b)}</p><h1 class="title">${kindLabel(kind)}</h1><p class="lead">${esc(blockHead(b))}</p></div></header>`;
const planItems = group => (group === "circuit" ? circuitFor(tomorrow()) : slotsOf(group)).map(sl => ({key:sl.key, ex:sl.ex, load:sl.load, reps:sl.reps, planEx:sl.ex, planLoad:sl.load, planReps:sl.reps}));
function sessionFor(kind){ const x = S.sessions[sessionId(kind)]; return x && x.v === 2 ? x : null; }
const reviewFor = id => (S.reviews || {})[id] || null;
function latestReview(){ return Object.values(S.reviews || {}).sort((a, b) => String(b.date + b.id).localeCompare(String(a.date + a.id)))[0] || null; }
function seenReview(){ try { return localStorage.getItem("trening:seen-review") || ""; } catch(e){ return ""; } }
function reviewHtml(r, withOk){
  return `<section class="verdict"><p class="kicker" style="margin:0">Ocena od Claude · ${esc(shortDate(String(r.date).slice(0, 10)))}</p><p class="t">${esc(r.title || "Ocena")}</p>
    ${r.changes && !/^bez zmian/.test(r.changes) ? `<p style="margin:10px 0 0;color:var(--ink)"><strong>Zmiany w planie</strong><br>${esc(r.changes).split("; ").join("<br>")}</p>` : ""}${r.text ? `<p>${esc(r.text)}</p>` : ""}
    ${withOk ? `<button class="btn outline" style="height:52px;font-size:16px" data-act="seen" data-id="${esc(r.id)}">OK</button>` : ""}</section>`;
}
function summaryLine(s){
  if (s.kind === "strength") return roundsText(s.rounds) + " · " + s.items.length + " " + plural(s.items.length, "ćwiczenie", "ćwiczenia", "ćwiczeń");
  return s.items.length + " " + plural(s.items.length, "ćwiczenie", "ćwiczenia", "ćwiczeń");
}
// What belongs to one day under the week strip; swiping days moves only this.
function dayPageHtml(sel){
  const r = latestReview(), isToday = sel === today();
  return `${dayCardsHtml(sel)}
    ${isToday && r && r.id !== seenReview() ? reviewHtml(r, true) : ""}
    ${isToday && !Sync.url ? `<button class="linkbtn" data-act="go" data-v="settings">Połącz arkusz Google, żeby Claude oceniał treningi i zmieniał plan.</button>` : ""}`;
}
function renderHome(){
  const d = new Date(), r = latestReview(), sel = selDate();
  // Overall level as a small ring gauge (tap: Progres) and a gear (tap: Sprzęt i plan) instead of a menu.
  const O = overallSeries(levelHistory()), ov = O.length ? O[O.length - 1].level : null, C = 2 * Math.PI * 19;
  const g = groupOf(ov);
  const gauge = `<button class="icon-btn lvl-badge" data-act="go" data-v="progress" aria-label="${ov == null ? "Progres" : g.name + ", poziom ogólny " + ov + " na 100. Progres"}">${badge(g, 44, ov == null)}</button>`;
  const menuBtn = `<span class="head-btns">${gauge}<button class="icon-btn" data-act="go" data-v="settings" aria-label="Sprzęt i plan">${GEAR}</button></span>`;
  // One compact line: the week strip below already shows where you are.
  const sd2 = parseYmd(sel), yest = ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  const when = sel === today() ? "Dziś" : sel === tomorrow() ? "Jutro" : sel === yest ? "Wczoraj" : cap(DAYS[sd2.getDay()]);
  // Three lengths; fitDayTitle() keeps the longest that fits on one line (e.g. "Poniedziałek, 26 października" on a narrow phone).
  const rel = ["Dziś", "Jutro", "Wczoraj"].includes(when), wShort = rel ? when : cap(DAYS_SHORT[sd2.getDay()]) + ".";
  const fits = [when + ", " + sd2.getDate() + " " + MONTHS[sd2.getMonth()], wShort + ", " + sd2.getDate() + " " + MONTHS[sd2.getMonth()], wShort + ", " + sd2.getDate() + "." + (sd2.getMonth() + 1)];
  const head = `<header class="head home-head"><h1 class="title day-h" aria-label="${esc(dayLabel(sd2))}" data-fits="${esc(JSON.stringify(fits))}">${esc(fits[0])}</h1>${menuBtn}</header>`;
  const isToday = sel === today();
  return `<section class="screen">${head}
    ${S.syncErr ? `<p class="banner">${esc(S.syncErr)}</p>` : ""}
    ${weekStripHtml()}
    <div class="day-body"><div class="day-track"><div class="day-page">${dayPageHtml(sel)}</div></div></div></section>`;
}
function reviewBlock(s, r){
  if (S.reviewing === s.id) return `<section class="verdict"><div class="wait"><i></i><p class="t" style="margin:0">Claude ocenia trening…</p></div><p>Czyta notatkę i sprawdza plan. Zwykle trwa to do minuty.</p></section>`;
  const p = Sync.pendingReview();
  if (p && p.id === s.id && S.reviewErr) return `<section class="verdict"><p class="t" style="margin:0">Oceny jeszcze nie ma</p><p>${esc(S.reviewErr)}</p><button class="btn outline" style="height:52px;font-size:16px" data-act="review">Spróbuj teraz</button></section>`;
  if (r) return reviewHtml(r, false);
  return `<p class="note">${Sync.url ? "Ocena pojawi się tutaj, gdy uda się połączyć z arkuszem." : "Połącz arkusz Google w ustawieniach, żeby Claude oceniał treningi zaraz po zapisaniu."}</p>`;
}
function renderPrep(){
  const s = current(), strength = s.kind === "strength", cond = s.kind === "cond";
  const head = title => `<div class="topbar"><button class="icon-btn" data-act="home" aria-label="Wróć do dnia">${BACK}</button></div><header class="head"><div><p class="kicker">${kickerOf(s.kind, today(), null)}</p><h1 class="title">${kindLabel(s.kind)}</h1></div></header>`;
  if (s.status === "done") return doneScreen(s);
  if (s.block){
    return `<section class="screen"><div class="topbar"><button class="icon-btn" data-act="home" aria-label="Wróć do dnia">${BACK}</button></div>${blockHeader(s.kind, s.date, s.block)}
      ${warmCard(s.items)}
      ${blockSections(s.block, s.items, (it, i) => itemRow(it, i, true))}
      <div class="push"><button class="btn" data-act="note">Po treningu: notatka</button></div></section>`;
  }
  if (strength){
    return `<section class="screen">${head("Plan na dziś")}
      ${warmCard(s.items)}
      <section class="sec"><div class="sec-row"><h2 class="sec-h">Circuit${s.plan ? " " + s.plan : ""}</h2>
        <div class="stepper" role="group" aria-label="Liczba rund"><button class="round-btn" data-act="rounds" data-d="-1" aria-label="Mniej rund" ${s.rounds <= 1 ? "disabled" : ""}>−</button><span class="val">${roundsText(s.rounds)}</span><button class="round-btn" data-act="rounds" data-d="1" aria-label="Więcej rund" ${s.rounds >= 5 ? "disabled" : ""}>+</button></div></div>
        <div class="card">${s.items.map((it, i) => itemRow(it, i, true)).join("")}</div>
        ${bbWarmNote(s.items)}</section>
      ${finRow(s.fin)}
      <div class="push"><button class="btn" data-act="note">Po treningu: notatka</button></div></section>`;
  }
  if (cond){
    const it = s.items[0], intervals = it && exOf(it.ex).interval, test = it && exOf(it.ex).test;
    return `<section class="screen">${head(test ? "Test" : intervals ? "Intervals" : "Steady")}
      <section class="sec"><h2 class="sec-h">${cap(estText("cond", s.items))}${intervals || test ? "" : " · tempo rozmowy"}</h2><div class="card">${s.items.map(x => itemRow(x, null, !test)).join("")}</div>
        <p class="note">${test ? "Najpierw 5 minut spokojnie." : intervals ? "Najpierw 5 minut spokojnie, na koniec 4 minuty spokojnie." : "Masz więcej czasu? Wydłuż do 45 minut."}</p></section>
      <div class="push"><button class="btn" data-act="note">Po treningu: notatka</button></div></section>`;
  }
  return `<section class="screen">${head("Plan na dziś")}
    <section class="sec"><h2 class="sec-h">${cap(estText("mobility", s.items))}</h2><div class="card">${s.items.map(it => itemRow(it, null, true)).join("")}</div></section>
    <div class="push"><button class="btn" data-act="note">Zrobione</button></div></section>`;
}
// Details of a done session: what was done, the note and Claude's review. Same screen for today and for past days.
const pm5Text = p => [p.dist ? p.dist + " m" : "", p.time ? mmss(p.time) : "", p.split ? mmss(p.split) + " /500 m" : "", p.spm ? p.spm + " s/m" : "", p.hr ? p.hr + " bpm" : ""].filter(Boolean).join(" · ");
// Header of a part on a done session: what was done, with the plan struck through when it differs.
function doneHead(s){
  return (pi, p, f) => {
    const c = partCount(p.fmt); if (!c || !partMod(s, pi)) return `<b>${esc(f.main)}</b>${f.rest ? `<span>${esc(f.rest)}</span>` : ""}`;
    const n = partDone(s, pi), main = c.emom ? "EMOM " + roundsText(n) : /^\d+ rounds?/.test(p.fmt) ? n + " rounds" : roundsText(n);
    return `<b>${esc(main)}</b><span class="struck">${esc(f.main)}</span>`;
  };
}
function doneScreen(s){
  const strength = s.kind === "strength", cond = s.kind === "cond", isToday = s.date === today(), r = reviewFor(s.id), tr = strength || cond;
  const head = `<div class="topbar"><button class="icon-btn" data-act="home" aria-label="Wróć do dnia">${BACK}</button></div><header class="head"><div><p class="kicker">${kickerOf(s.kind, s.date, s.block)}</p><h1 class="title">${kindLabel(s.kind)}</h1><div class="head-chips"><span class="status done">✓ Zrobione</span>${tr ? `<span class="status">${sessionMod(s) ? "Modified" : "Rx"}</span>` : ""}</div></div></header>`;
  const eff = effOf(s) ? " · wysiłek " + EFF_TXT[effOf(s)] : "";
  const scoreRow = pi => pi === 0 && scoreText(s) ? `<div class="row"><span class="main"><span class="name">Wynik</span></span><b style="font-size:20px;font-variant-numeric:tabular-nums">${esc(scoreText(s))}</b></div>` : "";
  const pm5 = s.pm5 ? `<div class="row"><span class="main"><span class="name">PM5</span><span class="sub">${esc(pm5Text(s.pm5))}</span></span></div>` : "";
  const done = s.block
    ? `<section class="sec"><h2 class="sec-h">${esc(cap([(scoreText(s) ? "" : s.dur ? mmss(s.dur) : ""), eff.replace(/^ · /, "")].filter(Boolean).join(" · ") || "Wykonane"))}</h2></section>${blockSections(s.block, s.items || [], doneRow, null, (pi) => scoreRow(pi), doneHead(s))}${pm5 ? `<section class="sec"><div class="card">${pm5}</div></section>` : ""}`
    : `<section class="sec"><h2 class="sec-h">${(strength ? "Circuit" + (planOfSession(s) ? " " + planOfSession(s) : "") + " · " + roundsText(s.rounds) + (s.dur ? " · " + mmss(s.dur) : "") : cond ? "Conditioning" : "Mobility") + eff}</h2><div class="card">${(s.items || []).map((it, i) => doneRow(it, strength ? i : null)).join("")}${pm5}</div></section>${strength && s.fin ? finRow(s.fin) : ""}`;
  return `<section class="screen">${head}
    ${done}
    ${s.note ? `<section class="sec"><h2 class="sec-h">Twoja notatka</h2><div class="verdict"><p>${esc(s.note)}</p></div></section>` : ""}
    ${tr ? (isToday || S.reviewing === s.id || (Sync.pendingReview() || {}).id === s.id ? reviewBlock(s, r) : r ? reviewHtml(r, false) : "") : ""}
    ${s.photoLost && photoOf(s.id) ? `<p class="note">Zdjęcie nie dotarło do Claude. Zaktualizuj skrypt w arkuszu i zapisz notatkę jeszcze raz.</p>` : ""}
    <div class="push"><button class="btn plain" data-act="edit-done" data-id="${esc(s.id)}">Popraw</button></div></section>`;
}
// Plan of the next Strength day, on the screen of a done session.
function nextPlanHtml(){
  const n = nextStrength(); if (!n) return "";
  const label = DAYS[parseYmd(n.date).getDay()] + ", " + parseYmd(n.date).getDate() + " " + MONTHS[parseYmd(n.date).getMonth()];
  if (n.block) return `<section class="sec"><h2 class="sec-h">Następny trening · ${esc(label)} · ${esc(BLOCK_TITLE[n.block.type])}</h2></section>${blockSections(n.block, n.items, (it, i) => itemRow(it, i, false), null)}`;
  return `<section class="sec"><h2 class="sec-h">Plan na następny trening · ${esc(label)}</h2><div class="card">${n.items.map((it, i) => itemRow(it, i, false)).join("")}</div></section>`;
}
// Plan of a future day, read-only.
// Warm-up written out in full, as it goes on the whiteboard: the same on today's plan and on any other day.
// Warm-up sets for the barbell lift of the day, before the first round.
function bbWarmNote(items, word = "rundą"){
  const b = (items || []).find(it => LOADS[it.load] && LOADS[it.load].bb && LOADS[it.load].bb > BAR); if (!b) return "";
  const half = Math.round(LOADS[b.load].bb / 2 / 2.5) * 2.5;
  return `<p class="note">${esc(exOf(b.ex).name)} przed pierwszą ${word}: 5 × pusty gryf${half > BAR ? ", 3 × " + plKg(half) + " kg" : ""}.</p>`;
}
const warmCard = items => !warmupFor(items).length ? "" : `<section class="sec"><h2 class="sec-h">Warm-up</h2><div class="card">${warmupFor(items).map(w => { const b = boardText(w.dose); return `<div class="row">${boardRow(b.r, w.name, b.rest)}</div>`; }).join("")}</div></section>`;
function planScreen(date, kind){
  const b = blockFor(date, kind);
  if (b){ const its = blockItems(date);
    return `<section class="screen"><div class="topbar"><button class="icon-btn" data-act="home" aria-label="Wróć do dnia">${BACK}</button></div>${blockHeader(kind, date, b)}
      ${warmCard(its)}${blockSections(blockInfo(b), its, (it, i) => itemRow(it, i, false))}</section>`; }
  const day = dayFor(date) || {date, kind}, strength = kind === "strength";
  const its = strength ? dayPlanItems(day.kind === "strength" ? day : {date, kind:"strength", plan:null})
    : (kind === "cond" ? [slotByKey(condKey(date))].filter(Boolean) : slotsOf("mobility")).map(sl => ({key:sl.key, ex:sl.ex, load:sl.load, reps:sl.reps, planEx:sl.ex, planLoad:sl.load, planReps:sl.reps}));
  const head = `<div class="topbar"><button class="icon-btn" data-act="home" aria-label="Wróć do dnia">${BACK}</button></div><header class="head"><div><p class="kicker">${kickerOf(kind, date, null)}</p><h1 class="title">${kindLabel(kind)}</h1></div></header>`;
  return `<section class="screen">${head}${strength ? warmCard(its) : ""}
    <section class="sec"><h2 class="sec-h">${strength ? "Circuit " + (day.plan || nextPlan(date)) + " · " + roundsText(S.profile.rounds) : kind === "cond" ? condLabel(condKey(date)) : "Mobility"} · ${estText(kind, its, S.profile.rounds, strength ? finFor(date) : null)}</h2>
      <div class="card">${its.map((it, i) => itemRow(it, strength ? i : null, false)).join("")}</div>
      ${strength ? bbWarmNote(its) : ""}</section>${strength ? finRow(finFor(date)) : ""}</section>`;
}
const condLabel = k => k === "c-int" ? "Intervals" : k === "c-test" ? "Test" : "Steady";
const kindLabel = k => k === "strength" ? "Strength" : k === "cond" ? "Conditioning" : "Mobility";
function renderNote(){
  const s = current(), strength = s.kind === "strength", cond = s.kind === "cond";
  if (s.rx == null && s.kind !== "mobility"){ s.rx = sessionMod(s) ? false : (s.status === "done" ? true : null); if (s.rx != null) commitSession(s, true); }
  return `<section class="screen"><div class="topbar"><button class="icon-btn" data-act="back-prep" aria-label="Wróć do planu">${BACK}</button></div>
    <header class="head"><div><p class="kicker">${kindLabel(s.kind)}</p><h1 class="title">Jak poszło?</h1>
      ${cond ? "" : `<p class="lead">${strength ? (s.block ? "Opowiedz o treningu: ciężary w seriach, co było łatwe, co trudne, co zmieniłeś. Claude dopasuje kolejne dni bloku." : "Opowiedz o całym treningu: ile rund, co było łatwe, co trudne, co zmieniłeś w trakcie. Claude rozbierze to na ćwiczenia i w razie potrzeby zmieni plan.") : "Krótko, jeśli coś było inaczej. Możesz zostawić puste."}</p>`}</div></header>
    ${rxHtml(s)}
    ${s.block ? scoreCard(s) : strength ? timeCard(s) : ""}
    ${s.kind !== "mobility" ? effHtml(effOf(s), "note", s.block ? EFF_TXT[s.block.effort] : null) : ""}
    <div class="field note-field"><textarea id="sessionNote" data-note="1" placeholder="Podyktuj lub napisz">${esc(s.note)}</textarea></div>
    ${s.kind !== "mobility" ? (photoOf(s.id) ? `<div class="photo"><img src="${photoOf(s.id)}" alt="Zdjęcie po treningu"><span>Zdjęcie</span><button data-act="photo-del">Usuń</button></div>`
      : `<label class="photo-btn"><input type="file" id="pm5File" accept="image/*" capture="environment" hidden>Zdjęcie</label>`) : ""}
    <div class="push"><button class="btn" data-act="finish" ${noteOk(s) ? "" : "disabled"}>Zapisz i zakończ</button></div></section>`;
}
// Session time: switched off = not measured; switched on = minutes (and seconds) must be filled before saving.
const TM = {};
function tmOf(s){ if (!TM[s.id]) TM[s.id] = s.dur ? {m:String(Math.floor(s.dur / 60)), s:String(s.dur % 60).padStart(2, "0")} : {m:"", s:""}; return TM[s.id]; }
function tmSecs(t){ if (t.m === "") return null; const mm = +t.m, ss = t.s === "" ? 0 : +t.s; return ss < 60 && mm <= 90 && mm * 60 + ss > 0 ? mm * 60 + ss : null; }
const tmBad = s => { const t = tmOf(s); return (t.m !== "" || t.s !== "") && tmSecs(t) == null; };
const timeOk = s => s.kind !== "strength" || !s.timed || tmSecs(tmOf(s)) != null;
const noteOk = s => (s.block ? scoreOk(s) : timeOk(s)) && (s.kind === "mobility" || (effOf(s) != null && s.rx != null));
// Score fields by format: rounds + reps, last full minute, time, interval times or distance. Times are typed as digits ("358" = 3:58).
function scoreCard(s){
  const t = scoreType(s); if (!t) return "";
  const sc = s.score || {};
  const num = (k, lab, w) => `<label><input data-sc="${k}" inputmode="numeric" pattern="[0-9]*" maxlength="${w}" autocomplete="off" placeholder="0" value="${sc[k] ?? ""}" aria-label="${lab}">${lab}</label>`;
  // Time as two fields, minutes and seconds, like the workout time; n = interval number shown before the fields.
  const tim = (k, n) => { const v = sc[k], m = v ? String(Math.floor(v / 60)) : "", sx = v ? String(v % 60).padStart(2, "0") : "";
    const f = (p, val, ph, lab, w) => `<label><input data-sc="${k}" data-tp="${p}" inputmode="numeric" pattern="[0-9]*" maxlength="${w}" autocomplete="off" placeholder="${ph}" value="${val}" aria-label="${lab}${n ? " " + n : ""}">${lab}</label>`;
    return `<div class="lab-ms" data-tg="${k}">${n ? `<span class="lab-n">${n}</span>` : ""}${f("m", m, "0", "min", 2)}<b>:</b>${f("s", sx, "00", "s", 2)}</div>`; };
  const head = (a, b) => `<div class="lab-row"><span>${a}${b ? `<small>${b}</small>` : ""}</span></div>`;
  let body;
  if (t.k === "amrap") body = head("Wynik", "AMRAP " + t.min + " min") + `<div class="lab-ms">${num("rounds", "rounds", 2)}<b>+</b>${num("reps", "reps", 3)}</div>`;
  else if (t.k === "deathby") body = head("Wynik", esc(s.block.parts[0].fmt)) + `<div class="lab-ms">${num("rounds", "rounds", 2)}<b>+</b>${num("reps", /calor/i.test(s.block.parts[0].fmt) ? "cal" : "reps", 2)}</div>`;
  else if (t.k === "fortime") body = head("Czas", "Bez Warm-up") + tim("time");
  else if (t.k === "ftornot") body = `<label class="lab-row"><span>Na czas<small>Bez Warm-up</small></span><input type="checkbox" class="sw" data-scft="1" ${sc.ft ? "checked" : ""} aria-label="Na czas"></label>` + (sc.ft ? tim("time") : "");
  else if (t.k === "intervals") body = head("Czasy odcinków") + [...Array(t.n)].map((_, i) => tim("t" + i, String(i + 1))).join("");
  else if (t.k === "steady") body = head("Dystans") + `<div class="lab-ms">${num("dist", "m", 5)}</div>`;
  return body ? `<div class="card">${body}</div>` : "";
}
function timeCard(s){
  const t = tmOf(s);
  return `<div class="card"><label class="lab-row"><span>Czas treningu<small>Z Warm-up</small></span><input type="checkbox" class="sw" data-timed="1" ${s.timed ? "checked" : ""} aria-label="Podaj czas treningu"></label>
    ${s.timed ? `<div class="lab-ms ${tmBad(s) ? "bad" : ""}"><label><input id="durM" data-tm="m" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="0" value="${t.m}" aria-label="Minuty">min</label><b>:</b><label><input id="durS" data-tm="s" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="00" value="${t.s}" aria-label="Sekundy">s</label></div>` : ""}</div>`;
}
const backHead = title => `<header class="head"><div style="flex-direction:row;align-items:center;gap:12px"><button class="icon-btn" data-act="home" aria-label="Wróć">${BACK}</button><h1 class="title" style="font-size:28px">${title}</h1></div></header>`;
function doneSessions(){ return Object.values(S.sessions).filter(s => s.v === 2 && s.status === "done").sort((a, b) => (b.date + b.kind).localeCompare(a.date + a.kind)); }
