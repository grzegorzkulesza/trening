"use strict";
// Skin: 1 light (default), 2 black and white. Kept on this phone only.
// Look: the sport skin only. Light or dark follows the phone unless set in Settings (kept on this phone only).
const KEY_THEME = "trening:theme";
const skinOf = () => "2";
const DARK_MQ = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
function themeOf(){ try { const v = localStorage.getItem(KEY_THEME); return v === "light" || v === "dark" ? v : "auto"; } catch(e){ return "auto"; } }
function applyTheme(){ const t = themeOf(), dark = t === "dark" || (t === "auto" && !!(DARK_MQ && DARK_MQ.matches));
  const h = document.documentElement; h.classList.add("skin2"); h.classList.toggle("dark", dark);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? "#000000" : "#FFFFFF"; }
applyTheme();
if (DARK_MQ) (DARK_MQ.addEventListener ? DARK_MQ.addEventListener("change", applyTheme) : DARK_MQ.addListener(applyTheme));
/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DAYS = ["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"];
const DAYS_SHORT = ["ndz","pon","wt","śr","czw","pt","sob"];
const MONTHS = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
const ymd = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const parseYmd = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const dayLabel = d => cap(DAYS[d.getDay()]) + ", " + d.getDate() + " " + MONTHS[d.getMonth()];
const shortDate = s => { const d = parseYmd(s); return DAYS_SHORT[d.getDay()]+" "+d.getDate()+"."+(d.getMonth()+1); };
const plural = (n, one, few, many) => n === 1 ? one : (n%10 >= 2 && n%10 <= 4 && (n%100 < 10 || n%100 >= 20)) ? few : many;
const roundsText = n => n + " " + (n === 1 ? "round" : "rounds");
const CHEV = `<svg class="chev" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>`;
const XICON = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>`;
const TODAY_ICON = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="13" height="12" rx="1"/><path d="M2.5 7h13M6 2v3M12 2v3"/><circle cx="9" cy="11.25" r="1.6" fill="currentColor" stroke="none"/></svg>`;
const BACK = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>`;
const GEAR = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`;
const DOTS = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><circle cx="3.5" cy="9" r="1.6"/><circle cx="9" cy="9" r="1.6"/><circle cx="14.5" cy="9" r="1.6"/></svg>`;
const MIC = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="1.5" width="6" height="10" rx="3"/><path d="M3 8.5a6 6 0 0 0 12 0M9 14.5v2.5"/></svg>`;

/* ---------- equipment & loads ---------- */
const EQUIP = [
  {id:"kb4", label:"Kettlebell 4 kg"}, {id:"kb8", label:"Kettlebell 8 kg"}, {id:"kb16", label:"Kettlebell 16 kg"}, {id:"kb20", label:"Kettlebell 20 kg"},
  {id:"db15", label:"Hantle 2 × 15 kg"}, {id:"db225", label:"Hantle 2 × 22,5 kg"}, {id:"mb9", label:"Piłka lekarska 9 kg"},
  {id:"rings", label:"Kółka gimnastyczne"}, {id:"pullbar", label:"Drążek"}, {id:"bands", label:"Gumy oporowe"},
  {id:"box", label:"Skrzynia 50 / 60 / 75 cm"}, {id:"rower", label:"Wioślarz"}, {id:"rope", label:"Skakanka"}, {id:"broom", label:"PVC pipe"}, {id:"abmat", label:"AbMat"},
  {id:"barbell", label:"Sztanga i stojaki", note:"Gryf 20 kg, bumpery 2 × 20 / 15 / 10 / 5 / 2,5 / 1,25 kg."}
];
const DEFAULT_EQUIP = Object.fromEntries(EQUIP.map(e => [e.id, true]));
// Barbell: 20 kg bar + one pair of each plate → 20–127.5 kg in 2.5 kg steps. Load codes: bb20, bb22.5 … bb127.5.
const BAR = 20, PLATES = [20, 15, 10, 5, 2.5, 1.25];
const BB_LOADS = [];
for (let kg = BAR; kg <= BAR + 2 * PLATES.reduce((a, b) => a + b, 0) + 1e-9; kg += 2.5) BB_LOADS.push("bb" + kg);
const plKg = n => String(n).replace(".", ",");
const LOADS = {
  bw:{label:"Bodyweight"},
  kb4:{label:"4 kg", color:"#A3ABB4", eq:"kb4"}, kb8:{label:"8 kg", color:"#E98FB8", eq:"kb8"},
  kb16:{label:"16 kg", color:"#E8B923", eq:"kb16"}, kb20:{label:"20 kg", color:"#7B4DB0", eq:"kb20"},
  db15:{label:"15 kg DB", color:"#2A2D32", eq:"db15"}, db15x2:{label:"2 × 15 kg", color:"#2A2D32", eq:"db15"},
  db225:{label:"22,5 kg DB", color:"#2A2D32", eq:"db225"}, db225x2:{label:"2 × 22,5 kg", color:"#2A2D32", eq:"db225"},
  mb9:{label:"9 kg ball", color:"#7B5639", eq:"mb9"},
  band:{label:"Band", eq:"bands"}, barbell:{label:"Barbell", eq:"barbell"}
};
BB_LOADS.forEach(l => { LOADS[l] = {label:plKg(+l.slice(2)) + " kg", eq:"barbell", bb:+l.slice(2)}; });

/* ---------- exercises ---------- */
const PATTERNS = {shoulder:"Shoulder Prep", vpush:"Vertical Push", hpull:"Pull", hinge:"Hinge", squat:"Squat", carry:"Core & Carry", "cond-int":"Intervals", "cond-steady":"Steady", "cond-test":"Test", core:"Core", "cond-fin":"Finisher", hpush:"Horizontal Push", lunge:"Single Leg",
  "mob-squat":"Deep Squat", "mob-hip":"Hips", "mob-ankle":"Ankles & Calves", "mob-back":"Posterior Chain", "mob-tspine":"T-Spine & Shoulders"};
const EX = {};
const X = (id, o) => { EX[id] = Object.assign({id, loads:["bw"], side:false, timed:false, req:[]}, o); };
// circuit (plan)
X("kb-halo", {name:"KB Halo", pattern:"shoulder", loads:["kb4","kb8","kb16"], side:true, def:["kb8",5], cue:"Kettel blisko głowy, żebra w dół, brzuch napięty."});
X("kb-clean-press", {name:"KB Clean & Press", pattern:"vpush", loads:["kb8","kb16","kb20"], side:true, def:["kb16",5], cue:"Opuszczaj przez 3 sekundy. Push press dozwolony."});
X("kb-strict-press", {name:"KB Clean & Strict Press", pattern:"vpush", loads:["kb8","kb16","kb20"], side:true, def:["kb16",3], cue:"Bez pomocy nóg. Opuszczanie 3 sekundy."});
X("ring-row", {name:"Ring Row", pattern:"hpull", req:["rings"], def:["bw",8], cue:"Ringi na wysokości bioder. Ciało w jednej linii, łopatki ściągnięte."});
X("ring-row-box", {name:"Ring Row", tag:"Feet on box", pattern:"hpull", req:["rings","box","off"] /* wycofane 20.11: nie do wykonania u Grzegorza; zostaje dla historii */, def:["bw",8], cue:"Stopy na skrzyni, ciało poziomo."});
X("pullup-negative", {name:"Pull-up Negative", pattern:"hpull", req:["pullbar"], def:["bw",3], cue:"Wskakujesz nad drążek, schodzisz przez 5 sekund."});
X("band-pullup", {name:"Band-assisted Pull-up", pattern:"hpull", req:["pullbar","bands"], def:["bw",5], cue:"Guma pod kolanem albo stopą, pełny zakres."});
X("pullup", {name:"Pull-up", pattern:"hpull", req:["pullbar"], def:["bw",3], cue:"Pełny zwis na dole, broda nad drążkiem."});
X("archer-ring-row", {name:"Archer Ring Row", pattern:"hpull", req:["rings","off"] /* wycofane 20.11 */, side:true, def:["bw",5], cue:"Jedna ręka ciągnie, druga prowadzi bokiem."});
X("sa-ring-row", {name:"Single-arm Ring Row", pattern:"hpull", req:["rings","off"] /* wycofane 20.11 */, side:true, def:["bw",5], cue:"Bez rotacji tułowia."});
X("kb-swing", {name:"KB Swing", pattern:"hinge", loads:["kb16","kb20"], def:["kb20",15], cue:"Ruch idzie z bioder. Ramiona tylko prowadzą kettla."});
X("kb-swing-1a", {name:"One-arm KB Swing", pattern:"hinge", loads:["kb16","kb20"], side:true, def:["kb20",8], cue:"Barki równo, bez skrętu tułowia."});
X("incline-pushup-75", {name:"Incline Push-up", tag:"Box 75 cm", pattern:"hpush", req:["box"], def:["bw",10], cue:"Dłonie na krawędzi skrzyni, ciało prosto."});
X("knee-pushup", {name:"Knee Push-up", pattern:"hpush", def:["bw",8], cue:"Ciało prosto od kolan do głowy."});
X("pushup-negative", {name:"Push-up Negative", pattern:"hpush", def:["bw",5], cue:"3 sekundy w dół, wracasz z kolan."});
X("incline-pushup-50", {name:"Incline Push-up", tag:"Box 50 cm", pattern:"hpush", req:["box"], def:["bw",8], cue:"Dłonie na krawędzi skrzyni, ciało prosto."});
X("pushup", {name:"Push-up", pattern:"hpush", def:["bw",5], cue:"Łokcie około 45° od tułowia."});
X("ring-dip", {name:"Ring Dip", pattern:"hpush", req:["rings"], def:["bw",3], cue:"Kółka przy biodrach, barki w dół."});
X("bss", {name:"Bulgarian Split Squat", pattern:"lunge", loads:["bw","kb8","kb16","kb20","db15x2","db225x2"], side:true, def:["kb16",6], cue:"Tylna stopa na skrzyni 50 cm, tułów lekko w przód."});
X("bb-dl", {name:"Deadlift", pattern:"hinge", loads:BB_LOADS, bb:true, def:["bb60",5], cue:"Sztanga nad środkiem stopy, plecy płasko, gryf przy nogach. Odkładasz kontrolowanie, bez upuszczania."});
X("bb-front-squat", {name:"Front Squat", pattern:"squat", loads:BB_LOADS, bb:true, def:["bb30",5], cue:"Ze stojaków. Łokcie wysoko, tułów pionowo, pełny przysiad. Chwyt na palcach albo skrzyżowany."});
X("bb-push-press", {name:"Push Press", pattern:"vpush", loads:BB_LOADS, bb:true, def:["bb30",5], cue:"Ze stojaków. Krótki dip w kolanach, wypchnięcie nogami, łokcie zablokowane nad głową."});
X("suitcase-carry", {name:"Suitcase Carry", pattern:"carry", loads:["kb8","kb16","kb20"], side:true, dist:true, def:["kb16",20], cue:"Kettlebell w jednej ręce. Tułów prosto, bez przechylania, bark w dół."});
X("farmer-carry", {name:"Farmer's Carry", pattern:"carry", loads:["db15x2","db225x2"], dist:true, def:["db15x2",30], cue:"Ciężar w obu rękach, barki w dół, krótkie kroki."});
X("row-int", {name:"Row Intervals", pattern:"cond-int", req:["rower"], interval:"1 min mocno / 1 min spokojnie", def:["bw",8], cue:"Mocno: szybki oddech, nie da się mówić. Spokojnie: luźne wiosłowanie."});
X("run-int", {name:"Run Intervals", pattern:"cond-int", interval:"1 min mocno / 1 min spokojnie", def:["bw",8], cue:"Mocno: szybki bieg, nie da się mówić. Spokojnie: trucht albo marsz."});
X("rope-int", {name:"Jump Rope Intervals", pattern:"cond-int", req:["rope"], interval:"30 s skakania / 30 s przerwy", def:["bw",10], cue:"Nisko nad ziemią, na przodostopiu, nadgarstki kręcą skakanką."});
X("abmat-situp", {name:"AbMat Sit-up", pattern:"core", req:["abmat"], def:["bw",15], cue:"Stopy razem, kolana na boki, pełny zakres."});
X("row-cal", {name:"Row", pattern:"cond-fin", req:["rower"], cal:true, def:["bw",10], cue:"Kalorie na wyświetlaczu PM5; reszta minuty to odpoczynek."});
X("air-squat", {name:"Air Squat", pattern:"squat", def:["bw",15], cue:"Pełny zakres, pięty przy podłodze."});
X("row-2k", {name:"Row 2000 m", pattern:"cond-test", req:["rower"], test:true, def:["bw",2000], cue:"Na maksa, po 5 minutach spokojnego wiosłowania."});
X("row-steady", {name:"Steady Row", pattern:"cond-steady", req:["rower"], minutes:true, def:["bw",30], cue:"Tempo, przy którym mówisz pełnymi zdaniami."});
X("run-steady", {name:"Steady Run", pattern:"cond-steady", minutes:true, def:["bw",30], cue:"Tempo, przy którym mówisz pełnymi zdaniami."});
// Distances and Death by for the block (reps = metres; Death by has none).
X("row-m", {name:"Row", pattern:"cond-m", req:["rower"], m:true, def:["bw",500], cue:"Dystans na PM5."});
X("run-m", {name:"Run", pattern:"cond-m", m:true, def:["bw",400], cue:"Płasko, równym krokiem."});
X("row-death", {name:"Row", pattern:"cond-m", req:["rower"], deathby:true, def:["bw",1], cue:"Minuta 1: 1 cal, minuta 2: 2 cal i tak dalej. Koniec, gdy nie zdążysz w minucie."});
// alternatives
const A = (id, o) => X(id, Object.assign({alt:true}, o));
A("band-pull-apart", {name:"Band Pull-Apart", pattern:"shoulder", loads:["band"], def:["band",15], rel:"podobnie", why:"Otwiera barki i budzi łopatki bez ciężaru."});
A("band-dislocate", {name:"Band Shoulder Dislocate", pattern:"shoulder", loads:["band"], def:["band",10], rel:"podobnie", why:"Pełny zakres w barkach."});
A("scap-pullup", {name:"Scapular Pull-up", pattern:"shoulder", req:["pullbar"], def:["bw",8], rel:"podobnie", why:"Zwis i praca samymi łopatkami."});
A("kb-arm-bar", {name:"KB Arm Bar", pattern:"shoulder", loads:["kb8","kb16"], side:true, def:["kb8",3], rel:"trudniej", why:"Stabilizacja barku z rotacją tułowia."});
A("tgu", {name:"Turkish Get-up", pattern:"shoulder", loads:["kb8","kb16"], side:true, def:["kb8",1], rel:"trudniej", why:"Cały łańcuch i stabilność barku, wolno."});
A("db-push-press", {name:"DB Push Press", pattern:"vpush", loads:["db15x2","db225x2"], def:["db15x2",6], rel:"podobnie", why:"Ten sam wzorzec, obie ręce naraz."});
A("db-strict-press", {name:"DB Strict Press", pattern:"vpush", loads:["db15x2","db225x2"], def:["db15x2",5], rel:"trudniej", why:"Bez pomocy nóg."});
A("suitcase-march", {name:"Suitcase March", pattern:"carry", loads:["kb8","kb16","kb20"], side:true, timed:true, def:["kb16",30], rel:"podobnie", why:"Marsz w miejscu, gdy nie ma gdzie chodzić."});
A("hk-kb-press", {name:"Half-kneeling KB Press", pattern:"vpush", loads:["kb8","kb16","kb20"], side:true, def:["kb16",5], rel:"trudniej", why:"Klęk nie pozwala odchylać lędźwi."});
A("bottoms-up", {name:"Bottoms-up KB Press", pattern:"vpush", loads:["kb8"], side:true, def:["kb8",5], rel:"łatwiej", why:"Lekki ciężar, dużo kontroli barku i chwytu."});
A("pike-pushup", {name:"Pike Push-up", tag:"Feet on box", pattern:"vpush", req:["box"], def:["bw",6], rel:"podobnie", why:"Wyciskanie nad głowę masą ciała."});
A("mb-thruster", {name:"Med Ball Thruster", pattern:"vpush", loads:["mb9"], def:["mb9",10], rel:"łatwiej", why:"Przysiad i wypchnięcie; więcej kondycji niż siły."});
A("bb-strict-press", {name:"Strict Press", pattern:"vpush", loads:BB_LOADS, bb:true, def:["bb25",5], rel:"trudniej", why:"Sztanga bez pomocy nóg."});
A("db-row", {name:"DB Bent-over Row", pattern:"hpull", loads:["db15x2","db225x2"], def:["db15x2",10], rel:"podobnie", why:"Wiosłowanie oburącz w opadzie, plecy płasko."});
A("sa-db-row", {name:"Single-arm DB Row", pattern:"hpull", loads:["db15","db225"], side:true, def:["db225",8], rel:"trudniej", why:"Ręka na skrzyni, duży ciężar."});
A("sa-kb-row", {name:"Single-arm KB Row", pattern:"hpull", loads:["kb16","kb20"], side:true, def:["kb20",10], rel:"podobnie", why:"Gdy kółka nie są zawieszone."});
A("band-row", {name:"Band Row", pattern:"hpull", loads:["band"], def:["band",15], rel:"łatwiej", why:"Lekkie przyciąganie na gorszy dzień."});
A("neg-chinup", {name:"Chin-up Negative", pattern:"hpull", req:["pullbar"], def:["bw",3], rel:"trudniej", why:"Wskakujesz na górę, schodzisz przez 5 sekund."});
A("bb-row", {name:"Barbell Bent-over Row", pattern:"hpull", loads:BB_LOADS, bb:true, def:["bb30",8], rel:"podobnie", why:"Wiosłowanie sztangą w opadzie, plecy płasko."});
A("kb-dl", {name:"KB Deadlift", pattern:"hinge", loads:["kb16","kb20"], def:["kb20",10], rel:"łatwiej", why:"Ten sam zawias bez dynamiki."});
A("db-rdl", {name:"DB Romanian Deadlift", pattern:"hinge", loads:["db15x2","db225x2"], def:["db225x2",8], rel:"podobnie", why:"Wolna praca tyłu ud."});
A("sl-rdl", {name:"Single-leg KB RDL", pattern:"hinge", loads:["kb8","kb16"], side:true, def:["kb16",6], rel:"trudniej", why:"Zawias i równowaga naraz."});
A("row-sprint", {name:"Row Sprint", pattern:"hinge", req:["rower"], timed:true, def:["bw",20], rel:"podobnie", why:"Gdy chodzi o tętno, nie o sam zawias."});
A("bb-rdl", {name:"Romanian Deadlift", pattern:"hinge", loads:BB_LOADS, bb:true, def:["bb40",8], rel:"łatwiej", why:"Zawias bez odkładania na podłogę, cicho."});
A("incline-pushup-60", {name:"Incline Push-up", tag:"Box 60 cm", pattern:"hpush", req:["box"], def:["bw",10], rel:"łatwiej", why:"Mniej masy na rękach."});
A("db-floor", {name:"DB Floor Press", pattern:"hpush", loads:["db15x2","db225x2"], def:["db225x2",8], rel:"podobnie", why:"Odciąża nadgarstki."});
A("ring-pushup", {name:"Ring Push-up", pattern:"hpush", req:["rings"], def:["bw",8], rel:"trudniej", why:"Niestabilność dokłada pracy barkom."});
A("band-pushup", {name:"Band-resisted Push-up", pattern:"hpush", req:["bands"], def:["bw",6], rel:"trudniej", why:"Etap po pełnych pompkach."});
A("bb-floor", {name:"Barbell Floor Press", pattern:"hpush", loads:BB_LOADS, bb:true, def:["bb30",6], rel:"podobnie", why:"Wyciskanie leżąc z podłogi, bez ławki."});
A("rev-lunge", {name:"Reverse Lunge", pattern:"lunge", loads:["bw","kb8","kb16","db15x2","db225x2"], side:true, def:["db15x2",8], rel:"podobnie", why:"Łagodniejszy dla kolan niż wykrok w przód."});
A("step-up", {name:"Goblet Box Step-up", tag:"Box 50 cm", pattern:"lunge", loads:["kb8","kb16","kb20"], req:["box"], side:true, def:["kb16",8], rel:"podobnie", why:"Kontrolowane zejście, bez odbicia."});
A("goblet-squat", {name:"KB Goblet Squat", pattern:"lunge", loads:["kb16","kb20"], def:["kb20",10], rel:"łatwiej", why:"Obie nogi, gdy równowaga przeszkadza."});
A("cossack", {name:"Cossack Squat", pattern:"lunge", loads:["bw","kb8","kb16"], side:true, def:["kb8",5], rel:"podobnie", why:"Do tego mobilność bioder."});
A("split-squat", {name:"Split Squat", pattern:"lunge", loads:["bw","kb8","kb16","kb20"], side:true, def:["kb16",8], rel:"łatwiej", why:"Ten sam ruch, tylna stopa na podłodze."});
A("dead-bug", {name:"Dead Bug", pattern:"core", side:true, def:["bw",8], rel:"łatwiej", why:"Lędźwie przy podłodze."});
A("hollow-rock", {name:"Hollow Rock", pattern:"core", def:["bw",15], rel:"trudniej", why:"Napięty brzuch w ruchu."});
A("bb-back-squat", {name:"Back Squat", pattern:"squat", loads:BB_LOADS, bb:true, def:["bb40",5], rel:"łatwiej", why:"Ze stojaków, gdy front rack przeszkadza."});
A("goblet-sq", {name:"KB Goblet Squat", pattern:"squat", loads:["kb16","kb20"], def:["kb20",10], rel:"łatwiej", why:"Bez sztangi, ten sam przysiad."});
// mobility (plan)
X("deep-squat-hold", {name:"Deep Squat Hold", pattern:"mob-squat", timed:true, def:["bw",90], cue:"Możesz trzymać się framugi albo kółek."});
X("z-sit", {name:"Z-Sit", pattern:"mob-hip", timed:true, side:true, def:["bw",45], cue:"Ręce mogą podpierać."});
X("down-dog-press", {name:"Downward Dog Press", pattern:"mob-ankle", hold:"3 s w psie", def:["bw",10], cue:"Pięty w stronę podłogi, bez wymuszania."});
X("superman", {name:"Superman", pattern:"mob-back", hold:"3 s w górze", def:["bw",12], cue:"Ręce i nogi nisko nad podłogą, szyja długa."});
X("crab-press", {name:"Crab Press", pattern:"mob-tspine", side:true, hold:"3 s w górze", def:["bw",8], cue:"Biodra wysoko, sięgasz ręką za siebie."});
A("goblet-hold", {name:"Goblet Squat Hold", pattern:"mob-squat", loads:["kb8","kb16"], timed:true, def:["kb8",90], rel:"podobnie", why:"Ciężar z przodu ułatwia zejście."});
A("ankle-rocks", {name:"Ankle Rocks", pattern:"mob-ankle", side:true, hold:"2 s z przodu", def:["bw",10], rel:"łatwiej", why:"Kolano nad palcami, pięta przy podłodze."});
A("calf-box", {name:"Calf Stretch", tag:"Box", pattern:"mob-ankle", req:["box"], timed:true, side:true, def:["bw",45], rel:"podobnie", why:"Palce na krawędzi skrzyni, pięta w dół."});
A("hip-switch", {name:"90/90 Hip Switch", pattern:"mob-hip", side:true, def:["bw",8], rel:"podobnie", why:"Rotacje bioder, dynamicznie."});
A("couch", {name:"Couch Stretch", pattern:"mob-hip", timed:true, side:true, def:["bw",45], rel:"podobnie", why:"Zginacze bioder po siedzeniu."});
A("pigeon", {name:"Pigeon Stretch", pattern:"mob-hip", timed:true, side:true, def:["bw",45], rel:"łatwiej", why:"Rotacja zewnętrzna biodra."});
A("superman-hold", {name:"Superman Hold", pattern:"mob-back", timed:true, def:["bw",30], rel:"trudniej", why:"Ta sama pozycja, utrzymana."});
A("bird-dog", {name:"Bird Dog", pattern:"mob-back", side:true, hold:"3 s w wyproście", def:["bw",8], rel:"łatwiej", why:"Stabilizacja lędźwi."});
A("ytw", {name:"Prone Y-T-W", pattern:"mob-back", hold:"2 s w każdej literze", def:["bw",6], rel:"podobnie", why:"Tył barków, przeciw zgarbieniu."});
A("open-book", {name:"Open Book", pattern:"mob-tspine", side:true, hold:"2 s otwarty", def:["bw",8], rel:"podobnie", why:"Rotacja odcinka piersiowego w leżeniu."});
A("thread", {name:"Thread the Needle", pattern:"mob-tspine", side:true, hold:"2 s w skręcie", def:["bw",8], rel:"podobnie", why:"Rotacja z klęku podpartego."});
A("hang", {name:"Passive Hang", pattern:"mob-tspine", req:["pullbar"], timed:true, def:["bw",45], rel:"podobnie", why:"Rozciąga barki i odcinek piersiowy."});
A("wall-slide", {name:"Wall Slide + Chin Tuck", pattern:"mob-tspine", def:["bw",10], rel:"łatwiej", why:"Wprost na głowę wysuniętą do przodu."});

const UNKNOWN = {id:"?", name:"Nieznane ćwiczenie", pattern:"", loads:["bw"], side:false, timed:false, req:[], def:["bw",5]};
const EX_ALIAS = {"ring-row-60":"ring-row", "ring-row-45":"ring-row", "ring-row-30":"ring-row", "ring-row-flat":"ring-row"};
const ladderOf = sl => sl.block || sl.bb ? [sl.ex] : (LADDERS[sl.pattern] || [sl.ex]);
const LADDERS = {
  hpull:["ring-row","pullup-negative","band-pullup","pullup"],
  hpush:["incline-pushup-75","knee-pushup","pushup-negative","pushup"],
  vpush:["kb-clean-press","kb-strict-press"],
  hinge:["kb-swing","kb-swing-1a"],
  squat:["bb-front-squat"],
  carry:["suitcase-carry","farmer-carry"],
  core:["abmat-situp"],
  "cond-fin":["row-cal"],
  "cond-int":["row-int","run-int","rope-int"],
  "cond-steady":["row-steady","run-steady"]
};
function exOf(id){
  if (EX_ALIAS[id]) id = EX_ALIAS[id];
  if (EX[id]) return EX[id];
  if (id && id.startsWith("c:")){ const c = (S.profile.custom || {})[id.slice(2)]; if (c) return Object.assign({id, loads:[c.load], side:!!c.side, timed:!!c.timed, req:[], def:[c.load, c.reps], alt:true}, c); }
  return UNKNOWN;
}
const eqOk = e => !!S.profile.equip[e];
const loadsOf = ex => ex.loads.filter(l => LOADS[l] && (!LOADS[l].eq || eqOk(LOADS[l].eq)));
const exAvailable = ex => ex.req.every(eqOk) && loadsOf(ex).length > 0;
const loadLabel = (ex, load) => load === "bw" ? (ex.tag || "Bodyweight") : (ex.tag ? ex.tag + " · " : "") + (LOADS[load]?.label || load);
// One-arm, one-leg and per-side exercises are written as totals (5 per side = 10); the plan stores reps per side.
const sideTxt = ex => "";
const shownReps = (ex, reps) => ex.side ? reps * 2 : reps;
// Per-side exercises are written "2 × N" (N per side), like "2 × 15 kg" for two dumbbells.
const repTxt = (ex, reps) => ex.side ? "2 × " + reps : String(reps);
const storedReps = (ex, total) => ex.side ? Math.max(1, Math.round(total / 2)) : total;
function doseText(exId, load, reps){
  const ex = exOf(exId);
  if (ex.interval) return reps + " × (" + ex.interval + ")";
  if (ex.test) return "na czas";
  if (ex.m) return reps + " m";
  if (ex.deathby) return "runda 1: 1 cal, każda kolejna +1 cal";
  if (ex.cal) return reps + " cal";
  if (ex.minutes) return reps + " min";
  if (ex.side){ const lb = load === "bw" ? ex.tag || "" : loadLabel(ex, load);
    return (lb ? lb + " · " : "") + repTxt(ex, reps) + (ex.timed ? " s" : ex.dist ? " m" : "") + (ex.hold ? " · " + ex.hold : ""); }
  reps = shownReps(ex, reps);
  if (ex.timed) return (load === "bw" && !ex.tag ? "" : loadLabel(ex, load) + " · ") + reps + " s" + sideTxt(ex);
  const lbl = load === "bw" ? ex.tag || "" : loadLabel(ex, load);
  return (lbl ? lbl + " × " : "× ") + reps + (ex.dist ? " m" : "") + sideTxt(ex) + (ex.hold ? " · " + ex.hold : "");
}
// Plan written like the whiteboard: reps first ("5 ×"), then the name, then the load or dose. Empty reps when the dose is not a count.
function boardDose(exId, load, reps){
  const ex = exOf(exId);
  if (ex.interval) return {r:reps + " ×", rest:ex.interval};
  if (ex.test || ex.m || ex.deathby || ex.cal || ex.minutes) return {r:"", rest:doseText(exId, load, reps)};
  const lbl = load === "bw" ? ex.tag || "" : loadLabel(ex, load);
  if (ex.side && !ex.timed && !ex.dist) return {r:repTxt(ex, reps), rest:lbl + (ex.hold ? (lbl ? " · " : "") + ex.hold : "")};
  if (ex.side) return {r:"", rest:(lbl ? lbl + " · " : "") + repTxt(ex, reps) + (ex.timed ? " s" : " m")};
  reps = shownReps(ex, reps);
  if (ex.timed) return {r:"", rest:(lbl ? lbl + " · " : "") + reps + " s"};
  if (ex.dist) return {r:"", rest:(lbl ? lbl + " · " : "") + reps + " m"};
  return {r:reps + " ×", rest:lbl + (ex.hold ? (lbl ? " · " : "") + ex.hold : "")};
}
// Same split for warm-up doses written as text ("× 8", "30 kg × 5", "3 × 10 s", "2 min").
function boardText(dose){
  let m = /^(?:(.*?) · )?(2 × \d+)$/.exec(dose); if (m) return {r:m[2], rest:m[1] || ""};
  m = /^(\d+) × (.+)$/.exec(dose); if (m) return {r:m[1] + " ×", rest:m[2]};
  m = /^(.*?)\s*× (\d+)(.*)$/.exec(dose); if (m) return {r:m[2] + " ×", rest:(m[1] + m[3]).replace(/^\s*·\s*/, "").trim()};
  return {r:"", rest:dose};
}
const boardRow = (r, name, rest, dot) => `<span class="rp">${esc(r)}</span><span class="main bd"><span class="name">${esc(name)}</span>${rest || dot ? `<span class="ld">${dot || ""}${esc(rest)}</span>` : ""}</span>`;
const shortDose = (exId, reps) => { const ex = exOf(exId); if (ex.side) return ex.name + " " + repTxt(ex, reps) + (ex.timed ? " s" : ex.dist ? " m" : ""); reps = shownReps(ex, reps); if (ex.interval || ex.minutes) return ex.name + " · " + doseText(exId, "bw", reps); return ex.timed ? `${ex.name} · ${reps} s${sideTxt(ex)}` : `${ex.name} × ${reps}${ex.dist ? " m" : ""}${sideTxt(ex)}`; };
const dotHtml = load => LOADS[load]?.color ? `<span class="dot" style="background:${LOADS[load].color}"></span>` : "";

/* ---------- plan ---------- */
const DEFAULT_SLOTS = [
  // Strength: two circuits in turn (Nov 2026). A: squat and push. B: hinge and pull.
  // One barbell lift in each; without a barbell the KB slot named in `bb` is done instead.
  {key:"sq-kb", group:"circuit", plan:"A", pattern:"squat", ex:"goblet-sq", load:"kb16", reps:8},
  {key:"bb-fs", group:"circuit", plan:"A", pattern:"squat", ex:"bb-front-squat", load:"bb30", reps:5, bb:"sq-kb"},
  {key:"bss", group:"circuit", plan:"A", pattern:"lunge", ex:"bss", load:"kb8", reps:5},
  {key:"cp", group:"circuit", plan:"A", pattern:"vpush", ex:"kb-clean-press", load:"kb16", reps:5},
  {key:"push", group:"circuit", plan:"A", pattern:"hpush", ex:"pushup", load:"bw", reps:6},
  {key:"core", group:"circuit", plan:"A", pattern:"core", ex:"abmat-situp", load:"bw", reps:15},
  {key:"dl-kb", group:"circuit", plan:"B", pattern:"hinge", ex:"kb-dl", load:"kb20", reps:10},
  {key:"bb-dl", group:"circuit", plan:"B", pattern:"hinge", ex:"bb-dl", load:"bb60", reps:5, bb:"dl-kb"},
  {key:"swing", group:"circuit", plan:"B", pattern:"hinge", ex:"kb-swing", load:"kb20", reps:15},
  {key:"vpull", group:"circuit", plan:"B", pattern:"hpull", ex:"band-pullup", load:"bw", reps:5},
  {key:"row", group:"circuit", plan:"B", pattern:"hpull", ex:"ring-row", load:"bw", reps:8},
  {key:"carry", group:"circuit", plan:"B", pattern:"carry", ex:"suitcase-carry", load:"kb16", reps:20},
  // Finisher after the circuit: EMOM, longer every week (see finMin).
  {key:"fin", group:"fin", pattern:"cond-fin", ex:"row-cal", load:"bw", reps:10},
  {key:"c-int", group:"cond", pattern:"cond-int", ex:"row-int", load:"bw", reps:8},
  {key:"c-steady", group:"cond", pattern:"cond-steady", ex:"row-steady", load:"bw", reps:40},
  {key:"m-squat", group:"mobility", pattern:"mob-squat", ex:"deep-squat-hold", load:"bw", reps:90},
  {key:"m-zsit", group:"mobility", pattern:"mob-hip", ex:"z-sit", load:"bw", reps:45},
  {key:"m-dog", group:"mobility", pattern:"mob-ankle", ex:"down-dog-press", load:"bw", reps:10},
  {key:"m-super", group:"mobility", pattern:"mob-back", ex:"superman", load:"bw", reps:12},
  {key:"m-crab", group:"mobility", pattern:"mob-tspine", ex:"crab-press", load:"bw", reps:8}
];
// Warm-up, about 5 minutes. General first (Row), then every movement of the day in its order:
// the body area it loads gets primed and the movement itself is rehearsed light (barbell ~50%, KB 8 kg, bodyweight half the reps).
// Engine days warm up in the same modality; a Steady session is its own warm-up.
function warmupFor(items){
  const out = [], seen = new Set(), add = w => { if (w && !seen.has(w.name)){ seen.add(w.name); out.push(w); } };
  const exs = (items || []).map(it => ({it, ex:exOf(it.ex)})).filter(x => x.ex.id !== "?");
  const cardio = x => /^cond-/.test(x.ex.pattern);
  if (!exs.length) return out;
  if (exs.every(cardio)){
    if (exs.some(x => x.ex.minutes || x.ex.test)) return out;
    if (exs.some(x => /^run/.test(x.ex.id))) return [{name:"Easy Run", dose:"5 min"}, {name:"Leg Swing", dose:"× 20"}, {name:"Strides", dose:"3 × 20 s"}];
    return [{name:"Row", dose:"4 min"}, {name:"Row Sprint", dose:"3 × 10 s"}];
  }
  add(eqOk("rower") ? {name:"Row", dose:"2 min"} : {name:"Jumping Jacks", dose:"× 40"});
  const kbOf = it => LOADS[it.load] && /^kb/.test(it.load) ? it.load : eqOk("kb16") ? "kb16" : eqOk("kb8") ? "kb8" : null;
  const kbDl = it => { const k = kbOf(it); return k ? {name:"KB Deadlift", dose:LOADS[k].label + " × 5"} : {name:"Hip Hinge", dose:"× 8"}; };
  const squatPrep = () => eqOk("kb8") ? {name:"Goblet Squat", dose:"8 kg × 5 · 2 s na dole"} : {name:"Air Squat", dose:"× 8 · 2 s na dole"};
  const half = it => Math.max(3, Math.ceil(it.reps / 2));
  const same = x => ({name:x.ex.name, dose:x.ex.side ? (x.ex.tag ? x.ex.tag + " · " : "") + repTxt(x.ex, half(x.it)) : (x.ex.tag ? x.ex.tag + " " : "") + "× " + shownReps(x.ex, half(x.it))});
  for (const x of exs){
    const {it, ex} = x, p = ex.pattern;
    if (cardio(x) || p === "carry" || p === "shoulder") continue;
    if (ex.bb){
      if (p === "squat") add(squatPrep());
      if (p === "hinge") add(eqOk("broom") ? {name:"PVC Hip Hinge", dose:"× 8"} : kbDl(it));
      if (p === "vpush" && eqOk("broom")) add({name:"PVC Pass-through", dose:"× 10"});
      const kg = LOADS[it.load] && LOADS[it.load].bb || BAR;
      add({name:ex.name, dose:plKg(Math.max(BAR, Math.round(kg / 2 / 2.5) * 2.5)) + " kg × 5"});
    } else if (p === "hinge"){ add(kbDl(it)); if (it.load !== "bw" && !/dl$/.test(ex.id)) add({name:ex.name, dose:ex.side ? LOADS[it.load].label + " · " + repTxt(ex, 3) : LOADS[it.load].label + " × " + shownReps(ex, 5)}); }
    else if (p === "vpush"){
      if (/^kb-/.test(ex.id)){ add(kbDl(it)); add({name:ex.name, dose:ex.side ? (eqOk("kb8") ? "8 kg · " : "") + repTxt(ex, 3) : (eqOk("kb8") ? "8 kg " : "") + "× " + shownReps(ex, 3)}); }
      else { if (eqOk("broom")) add({name:"PVC Pass-through", dose:"× 10"}); add(same(x)); }
    }
    else if (p === "squat") add(it.load === "bw" ? {name:ex.name, dose:"× " + half(it) + " · 2 s na dole"} : squatPrep());
    else if (p === "lunge") add(it.load === "bw" ? same(x) : squatPrep());
    else if (p === "hpull") add(/ring/.test(ex.id) ? same(x) : eqOk("pullbar") ? {name:"Scapular Pull-up", dose:"× 5"} : same(x));
    else if (p === "hpush") add(same(x));
    else if (p === "core") add({name:"Hollow Hold", dose:"4 × 5 s"});
  }
  return out;
}

const MIG = 5; // 1: barbell switched on; 2: Steady at least 40 min; 3: circuits A and B, 3 rounds, finisher (Nov 2026); 4: longer mobility
function defaultProfile(){
  return {v:2, mig:MIG, schedule:[1,3,5], condSchedule:[2,4], mobSchedule:[0,1,2,3,4,5,6], rounds:3, rest:120, warmStart:"rope", equip:{...DEFAULT_EQUIP}, slots:DEFAULT_SLOTS.map(s => ({...s})), custom:{}, analysis:null, over:{}};
}
function mergeProfile(p){
  const d = defaultProfile();
  if (!p || typeof p !== "object") return d;
  const out = {...d, schedule:Array.isArray(p.schedule) ? p.schedule : d.schedule, condSchedule:Array.isArray(p.condSchedule) ? p.condSchedule : d.condSchedule, mobSchedule:Array.isArray(p.mobSchedule) ? p.mobSchedule : d.mobSchedule, rounds:p.rounds || d.rounds, rest:p.rest || d.rest,
    warmStart:p.warmStart || d.warmStart, equip:{...d.equip, ...(p.equip || {})}, custom:p.custom || {}, analysis:p.analysis || null, over:p.over && typeof p.over === "object" ? p.over : {}, finStart:p.finStart || null, finMax:p.finMax || 10, lastBackup:p.lastBackup || null, updatedAt:p.updatedAt || 0, v:2, mig:MIG};
  if ((p.mig || 0) < 1) out.equip.barbell = true;
  if (p.v === 2 && Array.isArray(p.slots)){
    const byKey = Object.fromEntries(p.slots.map(s => [s.key, s]));
    // What the plan is made of comes from the defaults; exercise, load and reps from the stored plan.
    out.slots = d.slots.map(s => byKey[s.key] && byKey[s.key].ex ? {...s, ex:byKey[s.key].ex, load:byKey[s.key].load, reps:byKey[s.key].reps} : s);
    out.slots.forEach(sl => { if (EX_ALIAS[sl.ex]) sl.ex = EX_ALIAS[sl.ex]; });
    if ((p.mig || 0) < 2){ const st = out.slots.find(x => x.key === "c-steady"); if (st && st.reps < 40) st.reps = 40; }
    if ((p.mig || 0) < 3){ out.rounds = 3; out.finStart = ymd(mondayOf(today())); }
    if ((p.mig || 0) < 5) out.slots.forEach(sl => { if (sl.ex === "ring-row-box") sl.ex = "ring-row"; });
    if ((p.mig || 0) < 4) out.slots.forEach(sl => { if (sl.group === "mobility") sl.reps = Math.max(sl.reps, exOf(sl.ex).def[1]); });
  }
  return out;
}

