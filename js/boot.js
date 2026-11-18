"use strict";
/* ---------- boot ---------- */
Store.init();
Sync.init();
{ const data = Store.load(); S.profile = mergeProfile(data.profile); S.sessions = data.sessions || {};
  if (data.profile && Array.isArray(data.profile.slots) && (DEFAULT_SLOTS.some(d => !data.profile.slots.some(x => x.key === d.key)) || (data.profile.mig || 0) < MIG)) commitProfile();
  try { S.reviews = JSON.parse(localStorage.getItem("trening:reviews") || "{}"); } catch(e){ S.reviews = {}; }
  // 11.11: the note says the second round was full Push-ups × 6; the record still had the planned Knee Push-up.
  // 16.11: the review took an invented 60 kg for the logged Back Squat (planned and done: 40 kg) and raised the Deadlift from it.
  { const y = S.sessions["2026-11-16"], t = y && y.v === 2 && (y.items || []).find(i => i.key === "p0-0"), ov = S.profile.over && S.profile.over["2026-11-30"];
    if (t && t.ex === "bb-back-squat" && t.load === "bb60" && t.planLoad === "bb40"){ Object.assign(t, {load:"bb40"}); delete t.fromNote; delete y.undo; y.reviewedNote = y.note; commitSession(y); }
    if (ov && ov["p0-0"] && ov["p0-0"].load === "bb60"){ delete S.profile.over["2026-11-30"]; commitProfile(); } }
  const x = S.sessions["2026-11-11"], it = x && x.v === 2 && (x.items || []).find(i => i.key === "push");
  if (it && it.ex === "knee-pushup" && it.reps === 6 && !it.fromNote){ Object.assign(it, {ex:"pushup", fromNote:true}); commitSession(x); } }
S.loaded = true;
document.body.classList.remove("loading");
render();
Sync.pull().then(changed => { if (changed && ["home", "prep", "detail", "plan", "progress"].includes(S.view)) render(); });
// New version check: an installed iPhone app often resumes instead of restarting, so look for a newer index.html
// whenever the app comes back to the screen, and reload if it is safe (not while writing a note or waiting for a review).
let lastVersionCheck = 0;
async function checkForUpdate(){
  if (!navigator.onLine || location.protocol !== "https:" || Date.now() - lastVersionCheck < 60000) return;
  lastVersionCheck = Date.now();
  try {
    const html = await (await fetch("index.html", {cache:"no-store"})).text();
    const m = html.match(/const APP_VERSION = "([^"]+)"/);
    if (m && m[1] !== APP_VERSION && S.view !== "note" && !S.sheet && !S.reviewing) location.reload();
  } catch(e){}
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) checkForUpdate(); });
setTimeout(checkForUpdate, 3000);
// Screen stays on while the app is open; the browser drops the lock when the app goes to the background.
// iOS may refuse the lock without a tap, so it is asked for again on every tap (click/touchend count as a user gesture, pointerdown does not).
let wakeLock = null, wakeBusy = false, wakeState = "—";
async function keepAwake(){
  if (!("wakeLock" in navigator)){ wakeState = "brak wsparcia"; return; }
  if (document.hidden || wakeLock || wakeBusy) return;
  wakeBusy = true;
  try { wakeLock = await navigator.wakeLock.request("screen"); wakeState = "aktywna";
    wakeLock.addEventListener("release", () => { wakeLock = null; wakeState = "zwolniona"; }); }
  catch(e){ wakeLock = null; wakeState = "błąd: " + (e && e.name || e); }
  wakeBusy = false;
}
document.addEventListener("visibilitychange", keepAwake);
document.addEventListener("click", keepAwake, true);
document.addEventListener("touchend", keepAwake, {capture:true, passive:true});
keepAwake();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js", {updateViaCache:"none"}).catch(() => {});
