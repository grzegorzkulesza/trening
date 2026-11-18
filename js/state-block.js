"use strict";
/* ---------- state ---------- */
const S = {profile:defaultProfile(), sessions:{}, reviews:{}, previews:{}, previewing:false, kind:null, view:"home", sheet:null, loaded:false, busy:false, syncErr:null, notice:null, pending:{}, micHint:false, reviewing:null, reviewErr:null};
const slotsOf = g => S.profile.slots.filter(s => s.group === g);
const bbOn = () => eqOk("barbell");
const otherPlan = p => p === "A" ? "B" : "A";
// Which circuit a done session was: stored since circuits A and B, otherwise read from its items (older sessions have neither).
const planOfSession = x => x.plan || ((x.items || []).some(it => it.key === "bb-fs" || it.key === "sq-kb" || it.key === "core") ? "A"
  : (x.items || []).some(it => it.key === "bb-dl" || it.key === "dl-kb" || it.key === "vpull") ? "B" : null);
// Circuit for a Strength session on dateStr: the other one than the last done session before that day; A to begin with.
function nextPlan(dateStr){
  const last = Object.values(S.sessions).filter(x => x.v === 2 && x.kind === "strength" && x.status === "done" && x.date < dateStr && planOfSession(x))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return last ? otherPlan(planOfSession(last)) : "A";
}
// Slots of one circuit, with the barbell lift in place of its KB counterpart.
function circuitFor(dateStr, plan){
  const all = slotsOf("circuit").filter(x => x.plan === (plan || nextPlan(dateStr))), base = all.filter(x => !x.bb);
  if (!bbOn()) return base;
  return base.map(x => all.find(b => b.bb === x.key) || x);
}
// Finisher: EMOM after the circuit, 2 min longer every week, from 4 min up to 10 (or less, if Claude caps it).
function finMin(dateStr){
  const start = S.profile.finStart || dateStr, wk = Math.max(0, Math.floor((parseYmd(dateStr) - parseYmd(start)) / (7 * 86400000)));
  return Math.min(S.profile.finMax || 10, 4 + 2 * wk);
}
function finFor(dateStr){
  const sl = slotByKey("fin"); if (!sl) return null;
  const m = finMin(dateStr); if (m <= 0) return null;
  return eqOk("rower") ? {ex:sl.ex, load:sl.load, reps:sl.reps, min:m} : {ex:"air-squat", load:"bw", reps:15, min:m};
}
const finDose = f => f.ex === "row-cal" ? f.reps + " cal" : "× " + f.reps;
const finRow = f => f ? `<section class="sec"><h2 class="sec-h">Finisher</h2><div class="card"><div class="row"><span class="main"><span class="name">EMOM ${roundsText(f.min)}</span><span class="sub">${esc(exOf(f.ex).name)} ${esc(finDose(f))} co minutę</span></span></div></div></section>` : "";
/* ---------- block: 4 weeks planned day by day (Linchpin, Nov 2026) ----------
   Mon–Fri with no day off in between, so fatigue is spread in the plan: Mon Heavy (legs), Tue Engine, Wed Heavy (upper body),
   Thu easy, Fri medium. Each day: type, planned effort 1–5 (EFF_TXT), estimate in minutes and parts. A part: how it is done (fmt),
   an optional note and items [exercise, load, reps]; "@row" takes the variant from that plan slot. Claude changes loads and reps
   of coming days (S.profile.over) and the variants in the slots; the structure stays. */
const BLOCK_TITLE = {heavy:"Heavy", hr:"Heavy @ HR", engine:"Engine", cond:"Conditioning", workout:"Workout"};
const BLOCK_SUB = {heavy:"Heavy", hr:"Heavy @ HR", engine:"Engine", cond:"Lekko", workout:"Workout"};
const BLOCK = {id:"b1", start:"2026-11-13", end:"2026-12-13", days:{
  // Start the day after the Row 2000 m test: legs and heart rate rest, upper body and midline work.
  "2026-11-13":{type:"workout", effort:3, min:15, parts:[{fmt:"AMRAP 15 min", items:[["kb-clean-press","kb16",5],["@row","bw",8],["@core","bw",12]]}]},
  "2026-11-16":{type:"heavy", effort:4, min:20, parts:[{fmt:"5-5-5-5-5", items:[["bb-back-squat","bb40",5]]}]},
  "2026-11-17":{type:"engine", effort:4, min:null, parts:[{fmt:"Death by Calories", items:[["row-death","bw",1]]}]},
  "2026-11-18":{type:"heavy", effort:3, min:25, parts:[{fmt:"5-5-5-5-5", items:[["bb-strict-press","bb20",5]]}, {fmt:"Potem EMOM 8 min", items:[["@vpull","bw",3]]}]},
  "2026-11-19":{type:"cond", effort:2, min:30, parts:[{fmt:"5 rounds, not for time", items:[["row-m","bw",750],["air-squat","bw",15],["@core","bw",15]]}]},
  "2026-11-20":{type:"workout", effort:3, min:10, parts:[{fmt:"6 rounds for time, or not", items:[["kb-swing","kb16",10],["@row","bw",8],["@push","bw",6]]}]},
  "2026-11-23":{type:"hr", effort:4, min:15, parts:[{fmt:"3 intervals for time · przerwa 3:00", items:[["bb-dl","bb40",10],["row-m","bw",500]]}]},
  "2026-11-24":{type:"engine", effort:3, min:20, parts:[{fmt:"3 × 1000 m · przerwa 3:00", items:[["row-m","bw",1000]]}]},
  "2026-11-25":{type:"heavy", effort:3, min:25, parts:[{fmt:"5-5-5-5-5", items:[["bb-push-press","bb30",5]]}, {fmt:"Potem EMOM 8 min", items:[["pullup-negative","bw",3]]}]},
  "2026-11-26":{type:"cond", effort:2, min:20, parts:[{fmt:"5 rounds, not for time", items:[["row-m","bw",500],["kb-swing","kb16",12],["@core","bw",12]]}]},
  "2026-11-27":{type:"workout", effort:3, min:15, parts:[{fmt:"AMRAP 15 min", items:[["goblet-sq","kb16",10],["@row","bw",8],["@push","bw",6]]}]},
  "2026-11-30":{type:"heavy", effort:4, min:20, parts:[{fmt:"5-5-5-5-5", items:[["bb-dl","bb50",5]]}]},
  "2026-12-01":{type:"engine", effort:4, min:20, parts:[{fmt:"3 × 800 m · przerwa wg potrzeby", items:[["run-m","bw",800]]}]},
  "2026-12-02":{type:"heavy", effort:3, min:25, parts:[{fmt:"3-3-3-3-3", items:[["bb-strict-press","bb25",3]]}, {fmt:"Potem EMOM 8 min", items:[["@vpull","bw",3]]}]},
  "2026-12-03":{type:"cond", effort:2, min:20, parts:[{fmt:"4 rounds, not for time", items:[["row-m","bw",1000],["kb-swing","kb16",15]]}]},
  "2026-12-04":{type:"workout", effort:3, min:10, parts:[{fmt:"5 rounds for time, or not", items:[["goblet-sq","kb16",10],["@row","bw",8],["@core","bw",12]]}]},
  "2026-12-07":{type:"hr", effort:4, min:10, parts:[{fmt:"Część 1, for time", items:[["bb-front-squat","bb27.5",10],["row-cal","bw",12]]}, {fmt:"Część 2, for time · po 3:00 przerwy", items:[["bb-front-squat","bb27.5",10],["@push","bw",10]]}, {fmt:"Część 3, for time · po 3:00 przerwy", items:[["bb-front-squat","bb27.5",10],["@core","bw",20]]}]},
  "2026-12-08":{type:"engine", effort:3, min:20, parts:[{fmt:"3 × 800 m · przerwa wg potrzeby", items:[["run-m","bw",800]]}]},
  "2026-12-09":{type:"heavy", effort:3, min:25, parts:[{fmt:"3-3-3-3-3", items:[["bb-push-press","bb35",3]]}, {fmt:"Potem EMOM 8 min", items:[["pullup-negative","bw",3]]}]},
  "2026-12-10":{type:"cond", effort:2, min:40, parts:[{fmt:"Steady", items:[["row-steady","bw",40]]}]},
  "2026-12-11":{type:"workout", effort:3, min:20, parts:[{fmt:"AMRAP 20 min", items:[["row-m","bw",250],["goblet-sq","kb16",10],["kb-swing","kb16",10],["@row","bw",8]]}]}
}};
const SLOT_EX = {row:"ring-row", vpull:"band-pullup", push:"pushup", core:"abmat-situp"};
const blockDay = date => BLOCK.days[date] || null;
const blockKind = b => b.type === "engine" || b.type === "cond" ? "cond" : "strength";
const blockFor = (date, kind) => { const b = blockDay(date); return b && blockKind(b) === kind ? b : null; };
const blockInfo = b => ({id:BLOCK.id, type:b.type, effort:b.effort, min:b.min, parts:b.parts.map(p => ({fmt:p.fmt, note:p.note || ""}))});
// What a block format measures. AMRAP, EMOM and Steady last as long as the format says, so their time says nothing
// about the effort: the score is the work done in it. Death by: the score is the last full minute, and minute n is n reps.
// Classic heavy days are scored by load, Not for time by effort alone. b.min is the workout without the warm-up.
function fmtKind(fmt){
  const f = String(fmt || "").trim(); let m;
  if ((m = f.match(/AMRAP\s*(\d+)/i))) return {k:"amrap", min:+m[1]};
  if (/death by/i.test(f)) return {k:"deathby"};
  if ((m = f.match(/EMOM\s*(\d+)/i))) return {k:"emom", min:+m[1]};
  if (/^steady/i.test(f)) return {k:"steady"};
  if (/^\d+(?:-\d+)+$/.test(f)) return {k:"load"};
  if (/not for time/i.test(f)) return {k:"nft"};
  if (/for time, or not/i.test(f)) return {k:"ftornot"};
  if ((m = f.match(/^(\d+)\s*(?:intervals?\b|×)/i))) return {k:"intervals", n:+m[1]};
  if (/^część\s*\d/i.test(f)) return {k:"part"};
  if (/for time/i.test(f)) return {k:"fortime"};
  return {k:"other"};
}
function blockTime(b){
  const ks = b.parts.map(p => fmtKind(p.fmt));
  if (ks.some(k => k.k === "deathby")) return "";
  if (ks.every(k => k.min || k.k === "steady")) return ks.reduce((a, k) => a + (k.min || b.min || 0), 0) + " min";
  return b.min ? "około " + b.min + " min" : "";
}
const blockHead = b => ["Wysiłek " + EFF_TXT[b.effort], blockTime(b)].filter(Boolean).join(" · ");
function scoreType(s){
  if (!s || !s.block) return null;
  const ks = s.block.parts.map(p => fmtKind(p.fmt)), k = ks[0];
  if (ks.length > 1 && ks.every(x => x.k === "part")) return {k:"intervals", n:ks.length};
  return ["amrap", "deathby", "fortime", "ftornot", "intervals", "steady"].includes(k.k) ? k : null;
}
function scoreOk(s){
  const t = scoreType(s), sc = s.score || {};
  if (!t) return true;
  if (t.k === "amrap") return sc.rounds != null;
  if (t.k === "deathby") return sc.rounds != null;
  if (t.k === "fortime") return sc.time != null;
  if (t.k === "ftornot") return !sc.ft || sc.time != null;
  return true;
}
function scoreText(s){
  const t = scoreType(s), sc = s.score || {};
  if (!t) return "";
  if (t.k === "amrap") return sc.rounds != null ? roundsText(sc.rounds) + (sc.reps ? " + " + sc.reps : "") : "";
  if (t.k === "deathby") return sc.rounds != null ? roundsText(sc.rounds) + (sc.reps ? " + " + sc.reps + (/calor/i.test(s.block.parts[0].fmt) ? " cal" : "") : "") : "";
  if (t.k === "fortime" || t.k === "ftornot") return sc.time ? mmss(sc.time) : "";
  if (t.k === "intervals") return [...Array(t.n)].map((_, i) => sc["t" + i]).filter(Boolean).map(mmss).join(" · ");
  if (t.k === "steady") return sc.dist ? sc.dist + " m" : "";
  return "";
}
// The same score in words for Claude.
function scoreBrief(s){
  const t = scoreType(s), sc = s.score || {};
  if (!t) return undefined;
  const none = "nie podał w polu; weź z notatki albo zdjęcia, jeśli tam jest";
  if (t.k === "amrap") return sc.rounds != null ? sc.rounds + " pełnych rund + " + (sc.reps || 0) + " powtórzeń w " + t.min + " min" + partialText(s, sc.reps) : none;
  if (t.k === "deathby"){ if (sc.rounds == null) return none; const n = sc.rounds, x = sc.reps || 0;
    return n + " pełnych rund (runda = minuta, runda n to n powtórzeń)" + (x ? ", w rundzie " + (n + 1) + " zrobił " + x : "") + "; łącznie " + (n * (n + 1) / 2 + x); }
  if (t.k === "fortime" || t.k === "ftornot") return sc.time ? "czas " + mmss(sc.time) + " (bez Warm-up)" : "bez mierzenia czasu";
  if (t.k === "intervals"){ const ts = [...Array(t.n)].map((_, i) => sc["t" + i] ? mmss(sc["t" + i]) : "—"); return ts.some(x => x !== "—") ? "czasy odcinków: " + ts.join(", ") : none; }
  if (t.k === "steady") return sc.dist ? "dystans " + sc.dist + " m" : none;
}
// Where an AMRAP stopped: the movements go in order, so the extra reps say how far into the last round he got.
function partialText(s, reps){
  if (!reps || (s.items || []).some(it => { const e = exOf(it.ex); return e.dist || e.m || e.cal || e.timed; })) return "";
  let left = reps; const out = [];
  for (const it of s.items){ const e = exOf(it.ex), n = it.reps * (e.side ? 2 : 1); if (left <= 0) break; out.push(Math.min(left, n) + "/" + n + " " + e.name); left -= n; }
  return " (niepełna runda: " + out.join(", ") + ")";
}
// The same workout done before (same formats and movements): a benchmark to compare with.
const sigOf = x => x.block ? x.block.parts.map(p => p.fmt).join("|") + "#" + (x.items || []).map(it => it.ex).join(",") : null;
function sameBefore(s){
  const sig = sigOf(s); if (!sig) return [];
  return Object.values(S.sessions).filter(x => x.v === 2 && x.status === "done" && x.id !== s.id && x.date < s.date && sigOf(x) === sig)
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
    .map(x => ({data:x.date, wynik:scoreBrief(x), wysilek:effOf(x) ? effOf(x) + " (" + EFF_TXT[effOf(x)] + ")" : undefined, dawki:(x.items || []).map(it => exOf(it.ex).name + " " + doseText(it.ex, it.load, it.reps)).join(", ")}));
}
// Items of a block day, with Claude's changes for that day and today's variants from the slots.
function blockItems(date){
  const b = blockDay(date); if (!b) return [];
  const over = (S.profile.over || {})[date] || {};
  return b.parts.flatMap((p, pi) => p.items.map(([id, load, reps], i) => {
    const key = "p" + pi + "-" + i, slot = id[0] === "@" ? id.slice(1) : null, o = over[key] || {};
    const ex = o.ex || (slot ? (slotByKey(slot) || {}).ex || SLOT_EX[slot] : id), l = fitLoad(exOf(ex), o.load || load), r = o.reps || reps;
    const it = {key, ex, load:l, reps:r, planEx:ex, planLoad:l, planReps:r, part:pi};
    if (slot) it.slot = slot;
    if (o.at){ it.claudeAt = o.at; it.claudeNote = o.note || ""; }
    return it;
  }));
}
// Next Strength day after today (within a week): its date and plan items.
function nextStrength(){
  const d = parseYmd(today());
  for (let i = 1; i <= 7; i++){ d.setDate(d.getDate() + 1); const date = ymd(d); if (!isStrengthDay(date)) continue;
    const b = blockFor(date, "strength");
    return {date, block:b ? blockInfo(b) : null, items:b ? blockItems(date) : circuitFor(date).map(sl => ({key:sl.key, ex:sl.ex, load:sl.load, reps:sl.reps, planEx:sl.ex, planLoad:sl.load, planReps:sl.reps}))}; }
  return null;
}
// One week, Monday to Sunday (off: weeks from this one). Future Strength days take circuits A and B in turn, as if every session before them gets done.
const mondayOf = (dateStr, off = 0) => { const d = parseYmd(dateStr); d.setDate(d.getDate() - (d.getDay() + 6) % 7 + 7 * off); return d; };
function weekDays(off = 0){
  const t = today(), mon = ymd(mondayOf(t, off)), start = mon < t ? mon : t, d = parseYmd(start), out = [];
  let k = null;
  for (let i = 0; i < 400; i++){
    const date = ymd(d), w = d.getDay();
    if (out.length === 7) break;
    const get = id => { const x = S.sessions[id]; return x && x.v === 2 ? x : null; };
    const st = get(date), cs = get(date + "-cond"), mb = get(date + "-mob");
    let kind = S.profile.schedule.includes(w) ? "strength" : (S.profile.condSchedule || []).includes(w) || (cs && cs.status === "done") ? "cond" : null;
    const x = kind === "strength" ? st : kind === "cond" ? cs : null, done = !!(x && x.status === "done");
    if (kind === "cond" && !done && date < t) kind = null; // Conditioning is optional: a past day without it is not "missed"
    const day = {date, w, kind, done, today:date === t, past:date < t, session:done ? x : null, mob:!!(mb && mb.status === "done"), plan:null, condKey:null};
    if (kind === "strength" && !done && date >= t && !blockDay(date)){ k = k ? otherPlan(k) : nextPlan(date); day.plan = k; }
    if (kind === "cond") day.condKey = done && x.items && x.items[0] ? x.items[0].key : condKey(date);
    if (date >= mon) out.push(day);
    d.setDate(d.getDate() + 1);
  }
  return out;
}
function dayPlanItems(day){
  if (day.session) return day.session.items;
  if (blockFor(day.date, day.kind)) return blockItems(day.date);
  const slots = day.kind === "strength" ? circuitFor(day.date, day.plan) : [slotByKey(day.condKey)].filter(Boolean);
  return slots.map(sl => ({key:sl.key, ex:sl.ex, load:sl.load, reps:sl.reps, planEx:sl.ex, planLoad:sl.load, planReps:sl.reps}));
}
// ISO 8601 week number (weeks start on Monday, week 1 holds the first Thursday of the year).
function isoWeek(d){ const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()); t.setDate(t.getDate() + 3 - (t.getDay() + 6) % 7);
  const w1 = new Date(t.getFullYear(), 0, 4); return 1 + Math.round(((t - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7); }
const LETTERS = ["N", "P", "W", "Ś", "C", "P", "S"];
const WK_MAX = 4;
// The strip is also the history: it goes back to the week of the first done session.
function wkMin(){ const first = Object.values(S.sessions).filter(x => x.v === 2 && x.status === "done").map(x => x.date).sort()[0];
  return first ? Math.min(0, Math.round((mondayOf(first) - mondayOf(today())) / (7 * 86400000))) : 0; }
const selDate = () => S.sel || today();
function weekStripHtml(){
  const off = S.weekOff || 0, days = weekDays(off), sel = selDate(), a = parseYmd(days[0].date), z = parseYmd(days[6].date);
  const label = "Tydzień " + isoWeek(a);
  const cell = d => {
    const dot = d.done ? "done" : d.kind && !d.past ? "plan" : d.kind ? "miss" : "";
    const dt = parseYmd(d.date), name = DAYS[d.w] + ", " + dt.getDate() + " " + MONTHS[dt.getMonth()] + (d.done ? ", zrobione" : d.kind ? ", " + (d.kind === "strength" ? "Strength" : "Conditioning") : "");
    return `<button class="wk-c ${d.date === sel ? "on" : ""} ${d.today ? "today" : ""} ${d.past ? "past" : ""}" role="tab" aria-selected="${d.date === sel}" aria-label="${esc(name)}" data-act="pick-day" data-date="${d.date}"><span class="l">${LETTERS[d.w]}</span><span class="n">${dt.getDate()}${dot ? `<i class="dot ${dot}" aria-hidden="true"></i>` : ""}</span></button>`;
  };
  return `<section class="wk"><div class="wk-nav"><h2 class="sec-h">${esc(label)}</h2><span class="wk-arrows">${off !== 0 || sel !== today() ? `<button class="wk-today" data-act="wk-today" aria-label="Wróć do dziś">${RELOAD}</button>` : ""}
      <button data-act="wk" data-d="-1" aria-label="Poprzedni tydzień" ${off <= wkMin() ? "disabled" : ""}>${BACK}</button>
      <button data-act="wk" data-d="1" aria-label="Następny tydzień" ${off >= WK_MAX ? "disabled" : ""}><span style="display:inline-flex;transform:scaleX(-1)">${BACK}</span></button></span></div>
    <div class="wk-strip" role="tablist" aria-label="${esc(label)}">${days.map(cell).join("")}</div></section>`;
}
function dayFor(date){
  const t = today(), off = Math.round((mondayOf(date) - mondayOf(t)) / (7 * 86400000));
  return weekDays(off).find(x => x.date === date);
}
