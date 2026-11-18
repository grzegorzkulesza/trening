"use strict";
/* ---------- planned vs performed (Rx / Modified) ---------- */
// What a part of the plan counts in: rounds (EMOM too: one round per minute). Performed value lives in s.pfmt[part index].
function partCount(fmt){
  let m;
  if ((m = fmt.match(/^(\d+) rounds?/))) return {n:+m[1], label:"Rundy", unit:""};
  if ((m = fmt.match(/^(\d+(?:-\d+)+)$/))) return {n:m[1].split("-").length, label:"Rundy", unit:""};
  if ((m = fmt.match(/EMOM (\d+) min/))) return {n:+m[1], label:"Rundy", unit:"", emom:true};
  return null;
}
const partDone = (s, pi) => { const c = partCount(s.block.parts[pi].fmt); return c ? (s.pfmt && s.pfmt[pi] != null ? s.pfmt[pi] : c.n) : null; };
const partMod = (s, pi) => { const c = s.block && s.block.parts[pi] ? partCount(s.block.parts[pi].fmt) : null; return !!c && partDone(s, pi) !== c.n; };
const partsMod = s => s.block ? s.block.parts.some((p, pi) => partMod(s, pi)) : false;
function partRow(s, pi, p){
  const c = partCount(p.fmt); if (!c) return "";
  return `<div class="row pf-row ${partMod(s, pi) ? "chg" : ""}" data-pfrowp="${pi}"><span class="main"><span class="name">${c.label}</span><span class="plan">${c.n}${c.unit ? " " + c.unit : ""}</span></span><span class="pf-in"><label class="pf"><input data-pfp="${pi}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="${c.label}" value="${partDone(s, pi)}">${c.unit ? `<span>${c.unit}</span>` : ""}</label></span></div>`;
}
const modsKey = s => JSON.stringify([s.rx, s.pfmt || {}, (s.items || []).map(i => [i.ex, i.load, i.reps])]);
const itemMod = it => it.ex !== it.planEx || it.load !== it.planLoad || it.reps !== it.planReps;
const sessionMod = s => s.rx === false || (s.items || []).some(itemMod) || partsMod(s);
const partLines = s => !s.block ? [] : s.block.parts.map((p, pi) => { const c = partCount(p.fmt); return c && partMod(s, pi) ? c.label + ": " + partDone(s, pi) + (c.unit ? " " + c.unit : "") + " (plan: " + c.n + (c.unit ? " " + c.unit : "") + "; " + fmtParts(p.fmt).main + ")" : null; }).filter(Boolean);
const itemLine = it => exOf(it.ex).name + " " + doseText(it.ex, it.load, it.reps) + " (plan: " + exOf(it.planEx).name + " " + doseText(it.planEx, it.planLoad, it.planReps) + ")";
const modLines = s => partLines(s).concat((s.items || []).filter(itemMod).map(itemLine));
function perfRow(it, i){
  const ex = exOf(it.ex), ls = loadsOf(ex), unit = ex.timed ? "s" : ex.dist ? "m" : ex.minutes ? "min" : ex.cal ? "cal" : "";
  const ld = ex.bb ? `<label class="pf"><input data-pf="load" data-key="${it.key}" inputmode="decimal" autocomplete="off" aria-label="Ciężar w kg" value="${LOADS[it.load] && LOADS[it.load].bb != null ? plKg(LOADS[it.load].bb) : ""}" style="width:4ch"><span>kg</span></label>`
    : ls.length > 1 ? `<select class="pf" data-pf="load" data-key="${it.key}" aria-label="Ciężar">${ls.map(l => `<option value="${l}" ${l === it.load ? "selected" : ""}>${esc(LOADS[l].label)}</option>`).join("")}</select>` : "";
  const rp = ex.test || ex.deathby ? "" : `<label class="pf"><span>×</span><input data-pf="reps" data-key="${it.key}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Powtórzenia" value="${shownReps(ex, it.reps)}">${unit ? `<span>${unit}</span>` : ""}</label>`;
  return `<div class="row pf-row ${itemMod(it) ? "chg" : ""}" data-pfrow="${it.key}">${i != null ? `<span class="num">${i + 1}</span>` : ""}<span class="main"><span class="name">${esc(ex.name)}</span><span class="plan">${esc((it.planEx === it.ex ? "" : exOf(it.planEx).name + " ") + doseText(it.planEx, it.planLoad, it.planReps))}</span></span>${it.part != null || it.key ? `<button class="swp" data-act="pf-swap" data-key="${it.key}" aria-label="Zamień ćwiczenie"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h11l-3-3M16 13H5l3 3"/></svg></button>` : ""}<span class="pf-in">${ld}${rp}</span></div>`;
}
function rxHtml(s){
  if (s.kind === "mobility") return "";
  const mod = s.rx === false;
  return `<section class="sec"><h2 class="sec-h">Jak wykonałeś?</h2><div class="choices" style="grid-template-columns:1fr 1fr"><button class="choice ${s.rx === true ? "on" : ""}" data-act="rx" data-v="1" aria-pressed="${s.rx === true}"><b>Rx</b><small>Jak w planie</small></button><button class="choice ${mod ? "on" : ""}" data-act="rx" data-v="0" aria-pressed="${mod}"><b>Modified</b><small>Coś zmieniłem</small></button></div></section>`
    + (mod ? (s.block ? blockSections(s.block, s.items || [], perfRow, "Wykonane", (pi, p) => partRow(s, pi, p)) : `<section class="sec"><h2 class="sec-h">Wykonane</h2><div class="card">${(s.items || []).map((it, i) => perfRow(it, s.kind === "strength" ? i : null)).join("")}</div></section>`) : "");
}
const doneRow = (it, i) => `<div class="row">${i != null ? `<span class="num">${i + 1}</span>` : ""}<span class="main"><span class="name">${esc(exOf(it.ex).name)}</span><span class="sub">${dotHtml(it.load)}${esc(doseText(it.ex, it.load, it.reps))}</span></span>${itemMod(it) ? `<span class="struck">${esc((it.planEx === it.ex ? "" : exOf(it.planEx).name + " ") + doseText(it.planEx, it.planLoad, it.planReps))}</span>` : ""}</div>`;
// Estimated duration in minutes. Rough seconds per rep, carries ~1.2 s per metre, a short change between exercises,
// at most 20 s between rounds, 5 min Warm-up, 2 min barbell warm-up sets. Intervals: 5 min easy before, 4 min after.
function estSec(it){
  const ex = exOf(it.ex), sides = ex.side ? 2 : 1;
  if (ex.minutes) return it.reps * 60;
  if (ex.timed) return it.reps * sides;
  if (ex.dist) return it.reps * sides * 1.2;
  return it.reps * sides * ((ex.bb ? 4 : ex.pattern === "hinge" ? 2 : 3) + (parseInt(ex.hold) || 0)) + (ex.bb ? 10 : 0);
}
function estMin(kind, items, rounds, fin){
  if (!items.length) return 0;
  let min;
  if (kind === "cond"){ const it = items[0], ex = exOf(it.ex); min = ex.test ? 24 : ex.interval ? it.reps * (it.ex === "rope-int" ? 1 : 2) + 9 : it.reps; }
  else {
    const trans = kind === "mobility" ? 30 : 15, r = kind === "strength" ? (rounds || 1) : 1;
    let sec = r * items.reduce((a, it) => a + estSec(it) + trans, 0);
    if (kind === "strength") sec += (r - 1) * 20 + 300 + (items.some(it => exOf(it.ex).bb) ? 120 : 0) + (fin ? fin.min * 60 : 0);
    min = sec / 60;
  }
  return Math.max(1, min < 15 ? Math.round(min) : Math.round(min / 5) * 5);
}
const estText = (kind, items, rounds, fin) => "około " + estMin(kind, items, rounds, fin) + " min";
const sessOf = id => { const x = S.sessions[id]; return x && x.v === 2 ? x : null; };
const isDone = x => !!(x && x.status === "done");
function doneSub(x){
  const p = Sync.pendingReview();
  if (x.kind === "mobility") return "Zrobione.";
  return S.reviewing === x.id ? "Claude ocenia trening…" : reviewFor(x.id) ? "Ocena od Claude jest gotowa." : p && p.id === x.id ? "Ocena przyjdzie, gdy uda się połączyć z arkuszem." : x.note ? "Notatka zapisana." : "Zapisane.";
}
// The same cards for every day: today they open the plan, a done session opens its details, a future day its plan.
function dayCardsHtml(date){
  const t = today(), isToday = date === t, past = date < t, w = parseYmd(date).getDay(), day = dayFor(date);
  const st = sessOf(date), cs = sessOf(date + "-cond"), mb = sessOf(date + "-mob");
  const strengthDay = S.profile.schedule.includes(w), condDay = (S.profile.condSchedule || []).includes(w);
  const card = (kind, title, sub, x, missed, optional) => {
    const done = isDone(x), off = past && !done;
    // Every card shows its state the same way, as a chip next to the title; a missed one only has nothing to open.
    const chip = done ? `<span class="status done">✓ Zrobione</span>` : missed || off ? `<span class="status">Pominięte</span>` : `<span class="status">${optional ? "Opcjonalnie" : isToday ? "Do zrobienia" : "Zaplanowane"}</span>`;
    const inner = `<span class="day-main"><span class="day-top"><span class="day-title">${title}</span>${chip}</span>${sub ? `<span class="day-sub">${esc(sub)}</span>` : ""}</span>`;
    const act = done ? `data-act="detail" data-id="${esc(x.id)}"` : isToday ? `data-act="open" data-kind="${kind}"` : !past ? `data-act="plan-detail" data-date="${date}" data-kind="${kind}"` : "";
    return act ? `<button class="day-card" ${act}>${inner}${CHEV}</button>` : `<div class="day-card off">${inner}<span style="width:16px;flex:none" aria-hidden="true"></span></div>`;
  };
  const out = [];
  if (strengthDay || isDone(st)){
    let sub;
    if (isDone(st)) sub = doneSub(st);
    else if (past) sub = "";
    else if (blockFor(date, "strength")){ const b = blockFor(date, "strength"); sub = [BLOCK_SUB[b.type], blockTime(b)].filter(Boolean).join(" · "); }
    else if (isToday && st && st.status === "prep") sub = estText("strength", st.items, st.rounds, st.fin);
    else sub = estText("strength", dayPlanItems(day && day.kind === "strength" ? day : {date, kind:"strength", plan:null}), S.profile.rounds, finFor(date));
    out.push(card("strength", "Strength", sub, st, past && !isDone(st)));
  }
  if (isDone(cs) || (!past && condDay && !strengthDay)){
    const ck = condKey(date), sl = slotByKey(ck);
    const cb = blockFor(date, "cond"), sub = isDone(cs) ? doneSub(cs) : cb ? [BLOCK_SUB[cb.type], blockTime(cb)].filter(Boolean).join(" · ") : sl ? estText("cond", [sl]) : "";
    out.push(card("cond", "Conditioning", sub, cs, false, !condDay && !isDone(cs)));
  }
  out.push(card("mobility", "Mobility", isDone(mb) ? "Zrobione." : past ? "" : estText("mobility", slotsOf("mobility")), mb, false));
  return `<div class="day-list">${out.join("")}</div>`;
}
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return ymd(d); };
// Row 2000 m test: not a plan slot. It takes the place of a Conditioning session when a test is due (none yet, or 8 weeks since the last).
const TEST_SLOT = {key:"c-test", group:"cond", pattern:"cond-test", ex:"row-2k", load:"bw", reps:2000};
const slotByKey = k => k === "c-test" ? TEST_SLOT : S.profile.slots.find(s => s.key === k);
// The test comes back 8 weeks after the last result, on the first Conditioning day from then on.
const TEST_EVERY = 56;
function testDue(){
  const last = Object.values(S.sessions).filter(x => x.v === 2 && x.bench && x.bench.row2000).map(x => x.date).sort().pop();
  if (!last) return today();
  const d = parseYmd(last); d.setDate(d.getDate() + TEST_EVERY); return ymd(d);
}
function testDate(){
  if (!eqOk("rower")) return null;
  const due = testDue(), d = parseYmd(due > today() ? due : today());
  for (let i = 0; i < 8; i++){ const w = d.getDay(); if ((S.profile.condSchedule || []).includes(w) && !S.profile.schedule.includes(w)) return ymd(d); d.setDate(d.getDate() + 1); }
  return null;
}
const today = () => ymd(new Date());
const isStrengthDay = dateStr => S.profile.schedule.includes(parseYmd(dateStr).getDay());
const sessionId = kind => kind === "strength" ? today() : today() + (kind === "cond" ? "-cond" : "-mob");
const isCondDay = dateStr => (S.profile.condSchedule || []).includes(parseYmd(dateStr).getDay());
// Wtorek: interwały, czwartek: spokojnie. W inny dzień: to, czego dawniej nie było. Gdy przypada test Row 2000 m: test.
function condKey(dateStr){
  const td = testDate(); if (td && (dateStr === td || (dateStr === today() && testDue() <= today()))) return "c-test";
  const sc = (S.profile.condSchedule || []).slice().sort(), d = parseYmd(dateStr).getDay();
  if (sc.includes(d)) return sc.indexOf(d) % 2 === 0 ? "c-int" : "c-steady";
  const last = Object.values(S.sessions).filter(x => x.v === 2 && x.kind === "cond" && x.status === "done" && x.date < dateStr).sort((a, b) => b.date.localeCompare(a.date))[0];
  return last && last.items && last.items[0] && last.items[0].key === "c-int" ? "c-steady" : "c-int";
}
function nextStrengthLabel(fromToday = false){
  const d = new Date();
  for (let i = fromToday ? 0 : 1; i <= 7; i++){ const n = new Date(d); n.setDate(d.getDate()+i); if (S.profile.schedule.includes(n.getDay())) return DAYS[n.getDay()] + ", " + n.getDate() + " " + MONTHS[n.getMonth()]; }
  return "brak w planie";
}
function fitLoad(ex, load){ const ls = loadsOf(ex); return ls.includes(load) ? load : (ls.includes(ex.def[0]) ? ex.def[0] : ls[0] || "bw"); }
function buildSession(kind){
  const b = blockFor(today(), kind);
  if (b) return {v:2, id:sessionId(kind), date:today(), kind, status:"prep", touched:false, rounds:1, plan:null, fin:null, block:blockInfo(b), finishedAt:null, note:"",
    items:blockItems(today()).map(it => ({...it, swap:null, done:0}))};
  const group = kind === "strength" ? "circuit" : kind === "cond" ? "cond" : "mobility";
  const slots = kind === "cond" ? [slotByKey(condKey(today()))].filter(Boolean) : kind === "strength" ? circuitFor(today()) : slotsOf(group);
  const plan = kind === "strength" ? nextPlan(today()) : null;
  return {v:2, id:sessionId(kind), date:today(), kind, status:"prep", touched:false, rounds: kind === "strength" ? S.profile.rounds : 1, plan, fin:kind === "strength" ? finFor(today()) : null,
    finishedAt:null, note:"",
    items: slots.map(s => { const ex = exOf(s.ex), load = fitLoad(ex, s.load);
      return {key:s.key, ex:s.ex, load, reps:s.reps, planEx:s.ex, planLoad:load, planReps:s.reps, swap:null, done:0}; })};
}
function current(){
  if (S.editId && S.sessions[S.editId]) return S.sessions[S.editId];
  const kind = S.kind || (isStrengthDay(today()) ? "strength" : "mobility");
  const id = sessionId(kind);
  let s = S.sessions[id];
  if (!s || s.v !== 2){ s = buildSession(kind); S.sessions[id] = s; }
  else if (s.status === "prep" && !s.touched){ const fresh = buildSession(kind); Object.assign(s, {items:fresh.items, rounds:fresh.rounds, plan:fresh.plan, fin:fresh.fin, block:fresh.block}); if (!fresh.block) delete s.block; }
  return s;
}

