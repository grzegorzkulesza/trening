"use strict";
/* ---------- groups: animals for level ranges, like the old BTWB badges ----------
   Thresholds on the level scale, where 100 is Advanced (see LV_SCALE). */
const ANIMAL = {
  hedgehog: c => {
    const pts = []; const cx = 29, cy = 45;
    for (let i = 0; i <= 18; i++){ const a = Math.PI + i * Math.PI / 18 * 1.0, r = i % 2 ? 24 : 18; pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1)); }
    return `<polygon points="${pts.join(" ")}" fill="#fff"/><path d="M40 45 L41 33 Q47 34 54 42 Q55 45 52 46 Z" fill="#fff"/><circle cx="54.5" cy="43.2" r="2.2" fill="${c}"/><rect x="12" y="45" width="42" height="2.4" rx="1.2" fill="#fff"/><circle cx="46" cy="38.5" r="1.7" fill="${c}"/>`;
  },
  hare: c => `<ellipse cx="25" cy="21" rx="4.6" ry="13" transform="rotate(-14 25 21)" fill="#fff"/><ellipse cx="39" cy="21" rx="4.6" ry="13" transform="rotate(14 39 21)" fill="#fff"/>
    <ellipse cx="25" cy="21" rx="1.8" ry="8.5" transform="rotate(-14 25 21)" fill="${c}" opacity=".35"/><ellipse cx="39" cy="21" rx="1.8" ry="8.5" transform="rotate(14 39 21)" fill="${c}" opacity=".35"/>
    <ellipse cx="32" cy="40" rx="13" ry="12" fill="#fff"/><circle cx="27" cy="38" r="1.8" fill="${c}"/><circle cx="37" cy="38" r="1.8" fill="${c}"/><path d="M30 43 h4 l-2 2.4 z" fill="${c}"/>`,
  fox: c => `<polygon points="13,13 27,25 32,27 37,25 51,13 52,31 32,53 12,31" fill="#fff"/><polygon points="17,19 24,26 18,28" fill="${c}" opacity=".35"/><polygon points="47,19 40,26 46,28" fill="${c}" opacity=".35"/>
    <polygon points="22,36 28,35 27,38" fill="${c}"/><polygon points="42,36 36,35 37,38" fill="${c}"/><circle cx="32" cy="49" r="2.2" fill="${c}"/>`,
  wolf: c => `<polygon points="17,8 27,23 37,23 47,8 49,26 54,35 42,42 38,54 26,54 22,42 10,35 15,26" fill="#fff"/><polygon points="19,14 24,22 19,24" fill="${c}" opacity=".35"/><polygon points="45,14 40,22 45,24" fill="${c}" opacity=".35"/>
    <polygon points="22,32 29,33 27,35.5" fill="${c}"/><polygon points="42,32 35,33 37,35.5" fill="${c}"/><polygon points="29,50 35,50 32,53" fill="${c}"/><path d="M32 26 V40" stroke="${c}" stroke-width="1.6" opacity=".35"/>`,
  lynx: c => `<path d="M17 9 L17 7 M47 9 L47 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><polygon points="17,9 26,22 13,25" fill="#fff"/><polygon points="47,9 38,22 51,25" fill="#fff"/>
    <path d="M14 24 Q32 16 50 24 L52 38 L56 42 L50 44 L52 48 L42 50 L32 55 L22 50 L12 48 L14 44 L8 42 L12 38 Z" fill="#fff"/>
    <path d="M23 34 Q26 31.5 29 34 Q26 36 23 34Z M35 34 Q38 31.5 41 34 Q38 36 35 34Z" fill="${c}"/><path d="M30 42 h4 l-2 2.4 z" fill="${c}"/><path d="M32 44.5 v2.5" stroke="${c}" stroke-width="1.3"/>`,
  bison: c => `<path d="M17 27 Q8 24 10 13 Q14 21 21 21" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><path d="M47 27 Q56 24 54 13 Q50 21 43 21" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M18 22 Q20 14 26 16 Q29 11 32 14 Q35 11 38 16 Q44 14 46 22 L48 32 L44 44 L39 49 L25 49 L20 44 L16 32 Z" fill="#fff"/><path d="M25 48 L32 59 L39 48 Z" fill="#fff"/>
    <circle cx="25" cy="32" r="1.9" fill="${c}"/><circle cx="39" cy="32" r="1.9" fill="${c}"/><ellipse cx="29" cy="44" rx="1.6" ry="1.2" fill="${c}"/><ellipse cx="35" cy="44" rx="1.6" ry="1.2" fill="${c}"/>`,
  bear: c => `<circle cx="19" cy="21" r="7" fill="#fff"/><circle cx="45" cy="21" r="7" fill="#fff"/><circle cx="19" cy="21" r="3.2" fill="${c}" opacity=".35"/><circle cx="45" cy="21" r="3.2" fill="${c}" opacity=".35"/>
    <ellipse cx="32" cy="36" rx="17" ry="16" fill="#fff"/><ellipse cx="32" cy="43" rx="7.5" ry="5.6" fill="${c}" opacity=".2"/><circle cx="25.5" cy="33" r="1.9" fill="${c}"/><circle cx="38.5" cy="33" r="1.9" fill="${c}"/><ellipse cx="32" cy="40.6" rx="2.8" ry="2" fill="${c}"/>`,
  eagle: c => `<polygon points="22,17 32,12 42,17 47,27 46,38 42,44 39,48 36,45 32,50 28,45 25,48 22,44 18,38 17,27" fill="#fff"/><path d="M28 18.5 L32 21.5 L36 18.5" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>
    <polygon points="20.5,27 28,28 26,31" fill="${c}"/><polygon points="43.5,27 36,28 38,31" fill="${c}"/><polygon points="28,31.5 36,31.5 35.5,37 33.5,43 32,45 30.5,43 28.5,37" fill="${c}"/>`
};
const GROUPS = [
  {id:"hedgehog", name:"Hedgehog", min:0, color:"#8C8279"}, {id:"hare", name:"Hare", min:5, color:"#B49870"},
  {id:"fox", name:"Fox", min:12, color:"#C8642F"}, {id:"lynx", name:"Lynx", min:20, color:"#A7782F"},
  {id:"wolf", name:"Wolf", min:35, color:"#5F6B78"}, {id:"bison", name:"Bison", min:50, color:"#6A4A33"},
  {id:"bear", name:"Bear", min:80, color:"#3D302B"}, {id:"eagle", name:"Eagle", min:95, color:"#1F3A5F"}
];
const groupOf = lv => GROUPS.filter(g => (lv || 0) >= g.min).pop();
const nextGroup = g => GROUPS[GROUPS.indexOf(g) + 1] || null;
// Light skin: round badges; skin 2: square ones, same animals.
const badge = (g, size, dim) => { const sq = skinOf() === "2";
  return `<svg class="badge" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" style="width:${size}px;height:${size}px;${sq ? "" : "clip-path:circle(50%);"}flex:none${dim ? ";opacity:.35" : ""}">${sq ? `<rect width="64" height="64" fill="${g.color}"/>` : `<circle cx="32" cy="32" r="32" fill="${g.color}"/>`}${ANIMAL[g.id](g.color)}</svg>`; };
// Exercises that count for each category, easiest first: where to look for "what result gets me to the next group".
const CAT_EX = {pull:["ring-row", "ring-row-box", "archer-ring-row", "sa-ring-row", "pullup-negative", "band-pullup", "pullup"], push:["incline-pushup-75", "knee-pushup", "pushup-negative", "pushup", "ring-dip"],
  press:["kb-clean-press", "kb-strict-press", "bb-push-press"], hinge:["kb-swing", "kb-swing-1a", "bb-dl"], legs:["bss", "bb-front-squat"], carry:["suitcase-carry", "farmer-carry"]};
// Sensible rep range for a suggestion: at least a few reps (swings 10, carries 20 m), at most what fits the training style.
const repFloor = (e, load) => e.dist ? 20 : e.pattern === "hinge" && !e.bb ? 10 : load === "bw" ? 1 : 3;
const repCap = (e, load) => e.dist ? 60 : e.bb ? 8 : e.pattern === "hinge" ? 20 : load === "bw" ? 15 : 10;
// The nearest result that lifts category c to targetLevel: more reps of the same, then a heavier load, then the next exercise.
function targetFor(c, it, targetLevel){
  if (!it || !CAT_EX[c.id] || !EX[it.ex]) return null;
  const score = (ex, load, reps) => { const v = c.score({ex, load, reps}); return v == null ? -1 : toLv(v); };
  const minReps = (id, load, from) => { const e = EX[id], step = e.dist ? 10 : 1; for (let r = Math.max(from, repFloor(e, load)); r <= repCap(e, load); r += step) if (score(id, load, r) >= targetLevel) return r; return null; };
  const cur = EX[it.ex];
  let r = minReps(it.ex, it.load, it.reps + (cur.dist ? 10 : 1)); if (r) return {ex:it.ex, load:it.load, reps:r};
  const loads = loadsOf(cur);
  for (const l of loads.slice(loads.indexOf(it.load) + 1)){ r = minReps(it.ex, l, 1); if (r) return {ex:it.ex, load:l, reps:r}; }
  const list = CAT_EX[c.id];
  for (const id of list.slice(list.indexOf(it.ex) + 1)){ const e = EX[id]; if (!e || !exAvailable(e)) continue;
    for (const l of loadsOf(e)){ r = minReps(id, l, 1); if (r) return {ex:id, load:l, reps:r}; } }
  return null;
}
// Between this group and the next: both badges with their thresholds, the bar filled up to the current level.
function groupTrack(g, ng, lv, eta){
  const pct = Math.max(0, Math.min(100, (lv - g.min) / (ng.min - g.min) * 100));
  return `<div class="gtrack" role="img" aria-label="${g.name} od ${g.min}, ${ng.name} od ${ng.min}, teraz ${lv}"><span class="gt-end">${badge(g, 28)}<small>${g.min}</small></span>
    <span class="gt-mid"><span class="bar"><i style="width:${pct}%"></i></span>${eta ? `<small>${esc(eta)}</small>` : ""}</span><span class="gt-end">${badge(ng, 28)}<small>${ng.min}</small></span></div>`;
}
const targetText = t => t ? resText(t) : null;
// Weeks to the next group at the recent pace (needs a couple of weeks of data).
function etaText(O, gap){
  const t = today(), pts = O.filter(p => (parseYmd(t) - parseYmd(p.date)) / 86400000 <= 42);
  if (pts.length < 3 || (parseYmd(pts[pts.length - 1].date) - parseYmd(pts[0].date)) / 86400000 < 14) return "";
  const xs = pts.map(p => (parseYmd(p.date) - parseYmd(pts[0].date)) / 86400000), ys = pts.map(p => p.level), n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
  if (slope <= 0) return "";
  const w = Math.max(1, Math.ceil(gap / (slope * 7)));
  return "za ~" + w + " " + plural(w, "tydzień", "tygodnie", "tygodni");
}
/* ---------- progress: level 0–100, from the percentile among people who train (like BTWB Fitness Level) ----------
   Percentiles: Beginner 5, Novice 20, Intermediate 50, Advanced 80, Elite 95 (strengthlevel.com community standards, men).
   Level = percentile × 100/80, at most 100: Advanced is 100 (Nov 2026), so the top of the scale is a result people reach.
   Hinge (no community data for KB Swing) and Conditioning (Row 2000 m, men 40–49) are estimates. */
const PCTS = [5, 20, 50, 80, 95], RIR = 2, LV_SCALE = 100 / 80;
const toLv = v => Math.min(100, Math.round(v * LV_SCALE));
// The standard result for a level: the percentile curve of a category read backwards.
function stdFor(a, lv){
  const p = lv / LV_SCALE, pts = [[0, 0], ...a.map((x, i) => [x, PCTS[i]]), [a[4] * 1.35, 100]];
  for (let i = 1; i < pts.length; i++) if (p <= pts[i][1]){ const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return x0 + (p - y0) / (y1 - y0) * (x1 - x0); }
  return pts[pts.length - 1][0];
}
const upTo = (v, step) => Math.ceil(v / step - 1e-9) * step;
// Shown as a set like the ones in the plan: max reps minus the reps in reserve, a 1RM as its set of 5.
const repsSet = (name, max) => name + " × " + Math.max(1, Math.ceil(max - RIR - 1e-9));
const set5 = (name, oneRm, step, per) => name + " " + (per || "") + plKg(upTo(oneRm / (1 + (5 + RIR) / 30), step)) + " kg × 5";
const KGS0 = {bw:0, kb4:4, kb8:8, kb16:16, kb20:20, db15x2:30, db225x2:45};
const KGS = new Proxy(KGS0, {get:(t, k) => k in t ? t[k] : LOADS[k] && LOADS[k].bb ? LOADS[k].bb : undefined});
const clamp01 = x => Math.max(0, Math.min(1, x));
function pctFrom(v, a){
  if (!(v > 0)) return 0;
  const pts = [[0, 0], ...a.map((x, i) => [x, PCTS[i]]), [a[4] * 1.35, 100]];
  for (let i = 1; i < pts.length; i++) if (v <= pts[i][0]){ const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (v - x0) / (x1 - x0) * (y1 - y0); }
  return 100;
}
const e1rm = (kg, reps) => kg * (1 + (reps + RIR) / 30);
const fmtTime = t => Math.floor(t / 60) + ":" + String(Math.round(t % 60)).padStart(2, "0");
const LEVEL_CATS = [
  {id:"pull", name:"Pull", pattern:"hpull", src:"Strength Level, Pull-ups", ref:() => ({a:[1, 6, 13, 24, 34], f:v => repsSet("Pull-up", v)}),
    score(it){ const r = it.reps; switch (it.ex){
      case "ring-row": return 1.5 * clamp01(r / 12); case "ring-row-box": case "archer-ring-row": return 1.5 + clamp01(r / 12); case "sa-ring-row": return 2 + 0.5 * clamp01(r / 10);
      case "pullup-negative": return 2.5 + clamp01(r / 5); case "band-pullup": return 3.5 + 1.5 * clamp01(r / 8);
      case "pullup": return pctFrom(r + RIR, [1, 6, 13, 24, 34]); } return null; }},
  {id:"push", name:"Push", pattern:"hpush", src:"Strength Level, Push-ups", ref:() => ({a:[1, 18, 41, 68, 99], f:v => repsSet("Push-up", v)}),
    score(it){ const r = it.reps; switch (it.ex){
      case "incline-pushup-75": case "incline-pushup-50": return 1.5 * clamp01(r / 15); case "knee-pushup": return 1.5 + 1.5 * clamp01(r / 15);
      case "pushup-negative": return 3 + clamp01(r / 8); case "pushup": return pctFrom(r + RIR, [1, 18, 41, 68, 99]);
      case "ring-dip": return Math.max(pctFrom(30, [1, 18, 41, 68, 99]), pctFrom(r + RIR, [1, 6, 13, 24, 34])); } return null; }},
  {id:"press", name:"Press", pattern:"vpush",
    src:() => bbOn() ? "Strength Level, Push Press (1RM); KB Clean & Press przeliczony z Dumbbell Shoulder Press" : "Strength Level, Dumbbell Shoulder Press (1RM jedną ręką)",
    ref:() => bbOn() ? {a:[37, 57, 83, 114, 147], f:v => set5("Push Press", v, 2.5)} : {a:[13, 21, 32, 45, 60], f:v => set5("Dumbbell Shoulder Press", v, 1)},
    score(it){ const kg = KGS[it.load]; if (!kg) return null;
      if (it.ex === "bb-push-press") return pctFrom(e1rm(kg, it.reps), [37, 57, 83, 114, 147]);
      if (it.ex === "kb-clean-press") return pctFrom(e1rm(kg, it.reps) * 0.9, [13, 21, 32, 45, 60]);
      if (it.ex === "kb-strict-press") return pctFrom(e1rm(kg, it.reps), [13, 21, 32, 45, 60]); return null; }},
  {id:"hinge", name:"Hinge", pattern:"hinge",
    src:() => bbOn() ? "Strength Level, Deadlift (1RM); KB Swing to szacunek wg StrongFirst" : "szacunek wg standardów StrongFirst (brak danych społeczności dla KB Swing)",
    ref:() => bbOn() ? {a:[80, 113, 154, 202, 253], f:v => set5("Deadlift", v, 2.5)} : {a:[16, 24, 32, 40, 48], f:v => "KB Swing " + upTo(v, 1) + " kg × 15"},
    score(it){ const kg = KGS[it.load]; if (!kg) return null;
      if (it.ex === "bb-dl") return pctFrom(e1rm(kg, it.reps), [80, 113, 154, 202, 253]);
      const eq = it.ex === "kb-swing-1a" ? kg * 1.3 : it.ex === "kb-swing" ? kg : 0; if (!eq) return null;
      return Math.max(0, pctFrom(eq, [16, 24, 32, 40, 48]) + (Math.max(10, Math.min(30, it.reps)) - 15) * 0.4); }},
  {id:"legs", name:"Legs", pattern:"lunge",
    src:() => bbOn() ? "Strength Level, Front Squat (1RM); Bulgarian Split Squat z Dumbbell Bulgarian Split Squat" : "Strength Level, Dumbbell Bulgarian Split Squat (1RM, ciężar na rękę)",
    ref:() => bbOn() ? {a:[55, 77, 105, 137, 172], f:v => set5("Front Squat", v, 2.5)} : {a:[10, 18, 30, 44, 60], f:v => set5("Bulgarian Split Squat", v, 1, "2 × ").replace(/× 5$/, "× 10")},
    score(it){ const kg = KGS[it.load];
      if (it.ex === "bb-front-squat" && kg) return pctFrom(e1rm(kg, it.reps), [55, 77, 105, 137, 172]);
      if (it.ex === "bb-back-squat" && kg) return pctFrom(e1rm(kg, it.reps), [64, 93, 130, 173, 219]);
      if (it.ex !== "bss") return null; if (it.load === "bw") return 1.5 * clamp01(it.reps / 12); return pctFrom(e1rm(KGS[it.load] / 2, it.reps), [10, 18, 30, 44, 60]); }},
  {id:"carry", name:"Core & Carry", pattern:"carry", src:"Strength Level, Farmers Walk (ciężar na rękę, 20 m)", ref:() => ({a:[9, 20, 37, 58, 84], f:v => "Farmer's Carry 2 × " + upTo(v, 1) + " kg · 20 m"}),
    score(it){ const kg = KGS[it.load]; if (!kg) return null; const hand = it.ex === "suitcase-carry" ? kg : it.ex === "farmer-carry" ? kg / 2 : 0; if (!hand) return null;
      return pctFrom(hand, [9, 20, 37, 58, 84]) + (Math.max(20, Math.min(60, it.reps)) - 20) / 10; }},
  {id:"cond", name:"Conditioning", kind:"cond", src:"szacunek z rankingów Concept2, mężczyźni 40–49", ref:() => ({a:[570, 520, 470, 430, 400].map(t => 2000 / t), f:v => "Row 2000 m " + fmtTime(Math.floor(2000 / v))}), bench:true,
    scoreBench(sec){ return pctFrom(2000 / sec, [570, 520, 470, 430, 400].map(t => 2000 / t)); }}
];
const MOD_COLORS = {W:"#1F4E8C", G:"#E39A3B", M:"#3E9C7F"};
const ddmm = d => { const x = parseYmd(d); return x.getDate() + "." + (x.getMonth() + 1); };
const exLabel = id => { const ex = exOf(id); return ex.name + (ex.tag ? " (" + ex.tag + ")" : ""); };
const resText = it => exLabel(it.ex) + " " + doseText(it.ex, it.load, it.reps).replace(/^.* · /, "").replace(/^(Bodyweight|Feet on box) /, "");
const unlockN = c => c.bench ? 1 : 2;
// Unlocked after that many sessions with a result, even when the level stayed the same.
const unlocked = (c, a) => (a.length ? a[a.length - 1].n || a.length : 0) >= unlockN(c);
const FRESH_DAYS = 42;
// Category level = best of the latest results of each exercise from the last 6 weeks.
function levelHistory(){
  const cnt = {}, out = Object.fromEntries(LEVEL_CATS.map(c => [c.id, []])), latest = Object.fromEntries(LEVEL_CATS.map(c => [c.id, {}]));
  const sess = Object.values(S.sessions).filter(x => x.v === 2 && x.status === "done" && (x.kind === "strength" || x.kind === "cond")).sort((a, b) => a.date.localeCompare(b.date));
  for (const x of sess){
    for (const c of LEVEL_CATS){
      if (c.bench){ const t = x.bench && x.bench.row2000; if (t) out[c.id].push({date:x.date, level:toLv(c.scoreBench(t)), text:"Row 2000 m " + fmtTime(t)}); continue; }
      // Conditioning days count too: Carry lives on Thursdays.
      const mine = {};
      for (const it0 of x.items || []){ const it = {...it0, ex:EX_ALIAS[it0.ex] || it0.ex}; const v = c.score(it); if (v == null) continue;
        const l = toLv(v); if (!mine[it.ex] || l > mine[it.ex].level) mine[it.ex] = {date:x.date, level:l, text:resText(it), it}; }
      if (!Object.keys(mine).length) continue;
      Object.assign(latest[c.id], mine); cnt[c.id] = (cnt[c.id] || 0) + 1;   // sessions with a result in this category, for unlocking
      // A light day on another exercise (e.g. first Deadlift after KB Swing) does not pull the level down.
      const best = Object.values(latest[c.id]).filter(r => (parseYmd(x.date) - parseYmd(r.date)) / 86400000 <= FRESH_DAYS).sort((a, b) => b.level - a.level || b.date.localeCompare(a.date))[0];
      const prev = out[c.id][out[c.id].length - 1];
      if (!prev || best.date === x.date || best.level !== prev.level) out[c.id].push({...best, date:x.date, n:cnt[c.id]}); else prev.n = cnt[c.id];
    }
  }
  return out;
}
const lastChange = arr => { if (!arr.length) return 0; const v = arr[arr.length - 1]; for (let i = arr.length - 2; i >= 0; i--) if (arr[i] !== v) return v - arr[i]; return 0; };
function overallSeries(H){
  const dates = [...new Set(Object.values(H).flat().map(r => r.date))].sort();
  return dates.map(d => { const lv = LEVEL_CATS.map(c => [c, H[c.id].filter(r => r.date <= d)]).filter(([c, a]) => unlocked(c, a)).map(([, a]) => a[a.length - 1].level);
    return lv.length ? {date:d, level:Math.round(lv.reduce((a, b) => a + b, 0) / lv.length)} : null; }).filter(Boolean);
}
function levelChart(points, label){
  const pts = points.slice(-8), n = pts.length, y = v => 78 - v / 100 * 70;
  const xs = pts.map((_, i) => n === 1 ? 162 : Math.round(44 + i * (236 / (n - 1))));
  const grid = [0, 50, 100].map(t => `<line x1="30" y1="${y(t)}" x2="302" y2="${y(t)}" style="stroke:var(--line)" stroke-width="1"/><text x="0" y="${y(t) + 4}" font-size="11" style="fill:var(--muted)">${t}</text>`).join("");
  const labels = pts.map((p, i) => n <= 5 || i % 2 === (n - 1) % 2 ? `<text x="${xs[i]}" y="102" text-anchor="middle" font-size="11" style="fill:var(--muted)">${ddmm(p.date)}</text>` : "").join("");
  const line = n > 1 ? `<polyline points="${pts.map((p, i) => xs[i] + "," + y(p.level).toFixed(1)).join(" ")}" fill="none" style="stroke:var(--ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` : "";
  return `<svg viewBox="0 0 302 108" role="img" aria-label="${esc(label + ": " + pts.map(p => p.level).join(", "))}">${grid}${line}${n ? `<circle cx="${xs[n - 1]}" cy="${y(pts[n - 1].level).toFixed(1)}" r="4" style="fill:var(--ink)"/>` : ""}${labels}</svg>`;
}
const deltaChip = d => d ? `<span class="chip-d ${d < 0 ? "down" : ""}">${d > 0 ? "+" : "−"}${Math.abs(d)}</span>` : "";
const barHtml = v => `<span class="bar"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></span>`;
function renderProgress(){
  const H = levelHistory(), O = overallSeries(H), ov = O.length ? O[O.length - 1].level : null;
  const open = LEVEL_CATS.filter(c => unlocked(c, H[c.id]));
  const rows = LEVEL_CATS.map(c => {
    const h = H[c.id], last = h[h.length - 1], d = lastChange(h.map(r => r.level)), need = unlockN(c);
    const got = last ? last.n || h.length : 0;
    if (got < need) return `<button class="row cat-r locked" data-act="cat" data-c="${c.id}"><span class="main"><span class="name">${c.name}</span></span><span class="s">${c.bench ? "Row 2000 m" : got + " z " + need}</span></button>`;
    // Name, last change, level. The group and the target live on the category screen.
    return `<button class="row cat-r" data-act="cat" data-c="${c.id}"><span class="main"><span class="name">${c.name}</span></span>${deltaChip(d)}<b class="lv">${last.level}</b>${CHEV}</button>`;
  }).join("");
  const cov = coverageData();
  let hero;
  if (ov == null) hero = `<section class="lvl"><p class="kicker">Poziom ogólny</p><p class="lead">Odblokuje się, gdy pierwsza kategoria będzie miała 2 treningi.</p></section>`;
  else {
    const g = groupOf(ov), ng = nextGroup(g), pct = ng ? (ov - g.min) / (ng.min - g.min) * 100 : 100;
    hero = `<section class="lvl grp-hero">
      <div class="grp-top">${badge(g, 88)}<div class="grp-t"><h2 class="grp-name">${g.name}</h2><p class="grp-lv"><b>${ov}</b> / 100 ${deltaChip(lastChange(O.map(p => p.level)))}</p></div></div>
      ${ng ? groupTrack(g, ng, ov, etaText(O, ng.min - ov)) : ""}
      ${levelChart(O, "Poziom ogólny")}
      <div class="grp-all" role="list" aria-label="Wszystkie grupy">${GROUPS.map(x => `<span class="grp-i ${x === g ? "on" : ""}" role="listitem" aria-label="${x.name} od ${x.min}">${badge(x, 30, x.min > ov)}<small>${x.min}</small></span>`).join("")}</div>
    </section>`;
  }
  return `<section class="screen">${backHead("Progres")}${hero}
    <section class="sec"><h2 class="sec-h">Kategorie</h2><div class="card">${rows}</div></section>
    <div class="card"><button class="row" data-act="go" data-v="coverage" style="min-height:72px"><span class="main"><span class="name">Pokrycie</span><span class="sub">${cov.reg[0].done} z ${cov.reg[0].plan} Strength · ${cov.gaps} ${plural(cov.gaps, "wzorzec", "wzorce", "wzorców")} bez ćwiczeń</span></span>${CHEV}</button></div>
  </section>`;
}
const CHECK_W = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>`;
function renderCat(){
  const c = LEVEL_CATS.find(x => x.id === S.cat) || LEVEL_CATS[0], h = levelHistory()[c.id], last = h[h.length - 1], need = unlockN(c), lv = last ? last.level : null;
  const head = `<header class="head"><div style="flex-direction:row;align-items:center;gap:12px"><button class="icon-btn" data-act="go" data-v="progress" aria-label="Wróć do progresu">${BACK}</button><h1 class="title" style="font-size:28px">${c.name}</h1></div></header>`;
  const got = last ? last.n || h.length : 0, hero = got < need ? `<section class="lvl"><p class="lead">${c.bench ? "Zrób test Row 2000 m na maksa w sesji Conditioning i podaj czas w notatce, np. „Row 2000 m 8:45”." : "Odblokuje się po 2 treningach (" + got + " z 2)."}</p></section>`
    : (() => { const g = groupOf(lv), ng = nextGroup(g), tg = ng && !c.bench ? targetText(targetFor(c, last.it, ng.min)) : null;
      return `<section class="lvl"><div class="grp-top">${badge(g, 64)}<div class="grp-t"><h2 class="grp-name" style="font-size:26px">${g.name}</h2><p class="grp-lv"><b>${lv}</b> / 100 ${deltaChip(lastChange(h.map(r => r.level)))}</p></div></div>
        ${ng ? groupTrack(g, ng, lv, "") : ""}${ng && tg ? `<p class="cat-next" style="margin:0">${badge(ng, 18)}${esc(tg)}</p>` : ""}
        ${levelChart(h, "Poziom " + c.name)}</section>`; })();
  // What a group takes: the next one, the nearest step from the current exercise (as above); every group, the standard as a set.
  const ref = c.ref(), cur = lv == null ? null : groupOf(lv), ng0 = cur && nextGroup(cur);
  const reqOf = g => { if (g.min === 0) return ""; const t = g === ng0 && !c.bench ? targetFor(c, last.it, g.min) : null; return t ? resText(t) : ref.f(stdFor(ref.a, g.min)); };
  const pick = GROUPS.find(g => g.id === S.catGroup) || (cur && nextGroup(cur)) || GROUPS[1];
  const groupsCard = `<section class="lvl" style="gap:6px"><div class="grp-all" role="tablist" aria-label="Grupy">${GROUPS.map(g => `<button class="grp-pick grp-i ${g === pick ? "sel" : ""} ${g === cur ? "on" : ""}" role="tab" aria-selected="${g === pick}" data-act="cat-g" data-g="${g.id}" aria-label="${g.name} od ${g.min}"><span class="gp-ring">${badge(g, 30, lv == null || lv < g.min)}</span><small>${g.min}</small></button>`).join("")}</div>
    <p class="grp-req">${badge(pick, 20)}<b>${pick.name}</b>${reqOf(pick) ? `<span>${esc(reqOf(pick))}</span>` : ""}</p></section>`;
  let ladder = "";
  if (!c.bench){
    const ids = LADDERS[c.pattern] || [], slotEx = (S.profile.slots.find(x => x.pattern === c.pattern && x.group === "circuit" && !x.bb) || {}).ex, curId = last && ids.includes(last.it.ex) ? last.it.ex : slotEx, ci = ids.indexOf(curId);
    if (ids.length > 1) ladder = `<section class="sec"><h2 class="sec-h">Progresja</h2><ol class="card" style="margin:0;padding:0;list-style:none">${ids.map((id, i) =>
      `<li class="step ${i === ci ? "cur" : ""}"><span class="mk ${i < ci ? "done" : i === ci ? "cur" : "next"}" aria-hidden="true">${i < ci ? CHECK_W : i === ci ? PIN : "<i></i>"}</span><span class="bd"><b>${esc(exLabel(id))}</b></span></li>`).join("")}</ol></section>`;
  }
  const results = h.length ? `<section class="sec"><h2 class="sec-h">Wyniki, które się liczą</h2><div class="card">${[...h].reverse().slice(0, 6).map(r =>
    `<div class="row"><span class="main"><span class="name" style="font-size:15px">${esc(r.text)}</span><span class="sub" style="font-size:13px">${esc(shortDate(r.date))}</span></span><b style="font-size:17px">${r.level}</b></div>`).join("")}</div></section>` : "";
  return `<section class="screen">${head}${hero}<section class="sec"><h2 class="sec-h">Grupy</h2>${groupsCard}</section>${ladder}${results}</section>`;
}
const PIN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>`;
function coverageData(){
  const to = today(), f = new Date(); f.setDate(f.getDate() - 27);
  const first = Object.values(S.sessions).filter(x => x.v === 2 && x.status === "done").map(x => x.date).sort()[0] || to;
  const from = ymd(f) > first ? ymd(f) : first, days = Math.round((parseYmd(to) - parseYmd(from)) / 86400000) + 1;
  const done = Object.values(S.sessions).filter(x => x.v === 2 && x.status === "done" && x.date >= from && x.date <= to);
  let planS = 0, planC = 0, planM = 0;
  for (let i = 0; i < days; i++){ const d = new Date(); d.setDate(d.getDate() - i); const w = d.getDay();
    if (S.profile.schedule.includes(w)) planS++; else if ((S.profile.condSchedule || []).includes(w)) planC++;
    if ((S.profile.mobSchedule || [0,1,2,3,4,5,6]).includes(w)) planM++; }
  const cnt = k => done.filter(x => x.kind === k).length;
  const reg = [{n:"Strength", done:cnt("strength"), plan:planS, unit:"treningów"}, {n:"Mobility", done:cnt("mobility"), plan:planM, unit:"dni"}, {n:"Conditioning", done:cnt("cond"), plan:planC, unit:"sesji"}];
  const mins = {W:0, G:0, M:0};
  for (const x of done){
    for (const it of x.items || []){ const ex = exOf(it.ex); if (ex.pattern === "shoulder" || x.kind === "mobility") continue;
      if (String(ex.pattern).startsWith("cond")) mins.M += ex.test ? 9 : ex.interval ? it.reps * 2 : ex.m ? it.reps / 250 : ex.cal ? it.reps / 12 : ex.deathby ? 15 : it.reps;
      else mins[it.load && it.load !== "bw" ? "W" : "G"] += x.rounds || 1; }
  }
  const tot = mins.W + mins.G + mins.M, pct = k => tot ? Math.round(mins[k] / tot * 100) : 0;
  // How many sessions hit the pattern, and with which exercises (most frequent first).
  const hit = test => { const names = {}; let c = 0;
    for (const x of done){ const its = (x.items || []).map(it => ({...it, ex:EX_ALIAS[it.ex] || it.ex})).filter(test); if (!its.length) continue; c++;
      new Set(its.map(it => exOf(it.ex).name)).forEach(n => names[n] = (names[n] || 0) + 1); }
    return {c, ex:Object.entries(names).sort((a, b) => b[1] - a[1]).map(([n]) => n).join(", ")}; };
  const P = [
    {n:"Horizontal Push", m:"G", ...hit(it => exOf(it.ex).pattern === "hpush")},
    {n:"Vertical Push", m:"W", ...hit(it => exOf(it.ex).pattern === "vpush")},
    {n:"Horizontal Pull", m:"G", ...hit(it => ["ring-row", "ring-row-box", "archer-ring-row", "sa-ring-row", "bb-row", "db-row", "sa-db-row", "sa-kb-row", "band-row"].includes(it.ex))},
    {n:"Vertical Pull", m:"G", ...hit(it => ["pullup-negative", "band-pullup", "pullup", "neg-chinup"].includes(it.ex)), off:"Pojawi się z Pull-up Negative"},
    {n:"Hinge", m:"W", ...hit(it => exOf(it.ex).pattern === "hinge")},
    {n:"Single Leg", m:"W", ...hit(it => exOf(it.ex).pattern === "lunge")},
    {n:"Squat", m:"W", ...hit(it => exOf(it.ex).pattern === "squat"), part:cnt("mobility") ? "Tylko Deep Squat Hold w Mobility" : null},
    {n:"Core & Carry", m:"W", ...hit(it => exOf(it.ex).pattern === "carry")},
    {n:"Conditioning", m:"M", c:cnt("cond"), ex:"Row, Run, Jump Rope", off:"Wt i czw w dni bez Strength"}
  ];
  return {reg, pct, tot, P, days, gaps:P.filter(p => !p.c && !p.part).length};
}
function renderCoverage(){
  const c = coverageData();
  const ICON_OK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="stroke:var(--ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="pokryte"><path d="M5 12l5 5L20 7"/></svg>`;
  const ICON_PART = `<svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="częściowo"><circle cx="12" cy="12" r="8" fill="none" style="stroke:var(--faint)" stroke-width="2.5"/><path d="M12 4a8 8 0 0 1 0 16" fill="#9A9A94"/></svg>`;
  const ICON_NO = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="stroke:var(--faint)" stroke-width="2.5" stroke-linecap="round" role="img" aria-label="brak"><path d="M6 12h12"/></svg>`;
  return `<section class="screen">${backHead("Pokrycie")}<p class="lead" style="margin-top:-8px">${c.days < 28 ? "Od pierwszego treningu, " + c.days + " " + plural(c.days, "dzień", "dni", "dni") : "Ostatnie 4 tygodnie"}</p>
    <section class="sec"><h2 class="sec-h">Regularność</h2><div class="card">${c.reg.map(r => `<div class="cat"><span class="cat-top"><span class="n">${r.n}</span><span class="s">${r.done} z ${r.plan} ${r.unit}</span></span>${barHtml(r.plan ? r.done / r.plan * 100 : 0)}</div>`).join("")}</div></section>
    <section class="sec"><h2 class="sec-h">Modality</h2><div class="lvl">
      ${c.tot ? `<div class="modbar" role="img" aria-label="Weightlifting ${c.pct("W")}%, Gymnastics ${c.pct("G")}%, Monostructural ${c.pct("M")}%">${["W", "G", "M"].map(k => c.pct(k) ? `<span style="width:${c.pct(k)}%;background:${MOD_COLORS[k]}"></span>` : "").join("")}</div>` : `<p class="note">Brak treningów w ostatnich 4 tygodniach.</p>`}
      <div class="legend">${[["W", "Weightlifting"], ["G", "Gymnastics"], ["M", "Monostructural"]].map(([k, n]) => `<span><i style="background:${MOD_COLORS[k]}"></i><em>${n}</em><b>${c.pct(k)}%</b></span>`).join("")}</div></div></section>
    <section class="sec"><h2 class="sec-h">Wzorce ruchu</h2><div class="card">${c.P.map(p => `<div class="pat ${p.c || p.part ? "" : "off"}">${p.c ? ICON_OK : p.part ? ICON_PART : ICON_NO}<span class="bd"><b><i class="pdot" style="background:${MOD_COLORS[p.m]}"></i>${p.n}</b><span>${p.c ? esc(p.ex) + " · " + p.c + " " + plural(p.c, "raz", "razy", "razy") : esc(p.part || p.off || "Brak w ostatnich 4 tygodniach")}</span></span></div>`).join("")}</div></section>
  </section>`;
}
function renderSettings(){
  const p = S.profile;
  return `<section class="screen">${backHead("Sprzęt i plan")}
    <section class="sec"><h2 class="sec-h">Sprzęt</h2><div class="card">${EQUIP.map(e => `<div class="opt"><label for="eq-${e.id}">${esc(e.label)}${e.note ? `<small>${esc(e.note)}</small>` : ""}</label><input type="checkbox" class="sw" id="eq-${e.id}" data-eq="${e.id}" ${p.equip[e.id] ? "checked" : ""}></div>`).join("")}</div></section>
    <section class="sec"><h2 class="sec-h">Dni Strength</h2><div class="days">${[1,2,3,4,5,6,0].map(d => `<button class="choice ${p.schedule.includes(d) ? "on" : ""}" data-act="day" data-d="${d}" aria-pressed="${p.schedule.includes(d)}">${DAYS_SHORT[d]}</button>`).join("")}</div>
      <p class="note">Opuszczony trening po prostu pomijasz. Aplikacja go nie przenosi.</p></section>
    <section class="sec"><h2 class="sec-h">Dni Conditioning</h2><div class="days">${[1,2,3,4,5,6,0].map(d => `<button class="choice ${(p.condSchedule || []).includes(d) ? "on" : ""}" data-act="cday" data-d="${d}" aria-pressed="${(p.condSchedule || []).includes(d)}">${DAYS_SHORT[d]}</button>`).join("")}</div>
      <p class="note">W bloku treść każdego dnia wynika z kalendarza bloku. W inne dni bez Strength Conditioning też jest dostępny.</p></section>
    <section class="sec"><h2 class="sec-h">Dni Mobility</h2><div class="days">${[1,2,3,4,5,6,0].map(d => `<button class="choice ${(p.mobSchedule || [0,1,2,3,4,5,6]).includes(d) ? "on" : ""}" data-act="mday" data-d="${d}" aria-pressed="${(p.mobSchedule || [0,1,2,3,4,5,6]).includes(d)}">${DAYS_SHORT[d]}</button>`).join("")}</div>
      <p class="note">W inne dni Mobility i tak możesz zrobić dziś, jako opcjonalne.</p></section>
    <section class="sec"><h2 class="sec-h">Wygląd</h2><div class="choices" style="grid-template-columns:1fr 1fr 1fr">${[["auto", "Jak telefon"], ["light", "Jasny"], ["dark", "Ciemny"]].map(([v, n]) => `<button class="choice ${themeOf() === v ? "on" : ""}" data-act="theme" data-v="${v}" aria-pressed="${themeOf() === v}">${n}</button>`).join("")}</div></section>
    <section class="sec"><h2 class="sec-h">Arkusz Google</h2>${Sync.url
      ? `<p class="note">Połączono. Każda sesja i zmiana planu trafia do arkusza.${Sync.last ? " Ostatnia synchronizacja: " + new Date(Sync.last).toLocaleTimeString("pl-PL", {hour:"2-digit", minute:"2-digit"}) + "." : ""}${Sync.q.size ? " Czeka na wysłanie: " + Sync.q.size + "." : ""}</p>${Sync.err ? `<p class="banner">${esc(Sync.err)}</p>` : ""}
         <button class="btn outline" data-act="sync-now">Synchronizuj teraz</button><button class="btn plain" data-act="sync-off">Odłącz arkusz</button>`
      : `<p class="note">Wklej adres aplikacji internetowej z Apps Script (kończy się na /exec). Dane będą zapisywać się w arkuszu na Twoim Dysku.</p>
         <input class="input" id="syncUrl" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec" aria-label="Adres synchronizacji">
         ${Sync.err ? `<p class="banner">${esc(Sync.err)}</p>` : ""}<button class="btn outline" data-act="sync-on" ${S.busy ? "disabled" : ""}>${S.busy ? "Łączę…" : "Połącz"}</button>`}</section>
    ${Sync.url ? `<section class="sec"><h2 class="sec-h">Podgląd ocen</h2><p class="note">Przelicza oceny wszystkich zapisanych treningów obecnymi zasadami. Nic nie zmienia w planie ani w arkuszu.</p>
      <button class="btn outline" data-act="preview-all" ${S.previewing ? "disabled" : ""}>${S.previewing ? "Liczę…" : "Przelicz oceny"}</button>
      ${Object.keys(S.previews || {}).sort().map(id => { const r = S.previews[id], old = S.reviews[id]; return `<div class="card" style="padding:14px 16px;margin-top:10px"><p class="kicker" style="margin:0">${esc(shortDate(String(id).slice(0, 10)))}${/cond/.test(id) ? " · cond" : ""}</p><p style="margin:4px 0;font-weight:600">${esc(r.title)}</p>${r.text ? `<p style="margin:4px 0">${esc(r.text)}</p>` : ""}${r.changes ? `<p class="note" style="margin:4px 0">Zmiany: ${esc(r.changes)}</p>` : ""}${old ? `<p class="note" style="margin:8px 0 0;opacity:.7">Było: ${esc(old.title || "")}</p>` : ""}</div>`; }).join("")}</section>` : ""}
    <section class="sec"><h2 class="sec-h">Dane</h2><p class="note">${Sync.url ? "Dane są w telefonie i w arkuszu." : "Wszystko jest zapisane tylko w tej aplikacji na tym telefonie. Usunięcie ikony z ekranu głównego usuwa też dane."} ${backupAgeDays() === null ? "Nie masz jeszcze kopii zapasowej." : "Ostatnia kopia: " + (backupAgeDays() === 0 ? "dziś" : backupAgeDays() + " " + plural(backupAgeDays(), "dzień", "dni", "dni") + " temu") + "."}</p>
      <button class="btn outline" data-act="backup">Zapisz kopię zapasową</button>
      <label class="btn plain" for="importFile" style="cursor:pointer">Wczytaj kopię zapasową</label><input type="file" id="importFile" accept="application/json,.json" hidden>
      ${S.notice ? `<p class="note">${esc(S.notice)}</p>` : ""}
      <button class="btn plain" data-act="reset">Przywróć plan startowy</button>
      <p class="note" style="text-align:center">Wersja ${APP_VERSION} · blokada ekranu: ${esc(wakeState)}</p></section></section>`;
}

