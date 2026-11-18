"use strict";
/* ---------- storage: on this phone ---------- */
const KEY_P = "trening:v2:profile", KEY_S = "trening:v2:sessions";
const Store = {
  ok:false,
  init(){
    try { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); this.ok = true; } catch(e){ this.ok = false; }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch(e){}
  },
  load(){
    if (!this.ok) return {profile:null, sessions:{}};
    try { return {profile:JSON.parse(localStorage.getItem(KEY_P) || "null"), sessions:JSON.parse(localStorage.getItem(KEY_S) || "{}")}; }
    catch(e){ return {profile:null, sessions:{}}; }
  },
  fail(){ S.syncErr = "Nie udało się zapisać danych w telefonie."; },
  saveProfile(){ if (!this.ok) return; try { localStorage.setItem(KEY_P, JSON.stringify(S.profile)); S.syncErr = null; } catch(e){ this.fail(); } },
  saveSession(s){
    if (!this.ok) return;
    try { const all = JSON.parse(localStorage.getItem(KEY_S) || "{}"); all[s.id] = JSON.parse(JSON.stringify(s)); localStorage.setItem(KEY_S, JSON.stringify(all)); S.syncErr = null; }
    catch(e){ this.fail(); }
  },
  replaceAll(profile, sessions){ localStorage.setItem(KEY_P, JSON.stringify(profile)); localStorage.setItem(KEY_S, JSON.stringify(sessions)); }
};
const debouncers = {};
// Durations as m:ss (h:mm:ss from an hour).
const mmss = t => { t = Math.round(t); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), sec = String(t % 60).padStart(2, "0"); return h ? h + ":" + String(m).padStart(2, "0") + ":" + sec : m + ":" + sec; };
// A photo after the session (PM5, whiteboard, timer…) waiting for Claude: kept on the phone (not in the sheet) until a review has read it.
const KEY_PHOTO = "trening:photo:", photoMem = {};
const photoOf = id => { try { return localStorage.getItem(KEY_PHOTO + id) || photoMem[id] || null; } catch(e){ return photoMem[id] || null; } };
function setPhoto(id, data){ photoMem[id] = data || null; try { data ? localStorage.setItem(KEY_PHOTO + id, data) : localStorage.removeItem(KEY_PHOTO + id); } catch(e){} }
async function takePhoto(file){
  const s = current(), url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const k = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    setPhoto(s.id, c.toDataURL("image/jpeg", 0.8));
  } catch(e){ S.notice = "Nie udało się wczytać zdjęcia."; }
  URL.revokeObjectURL(url); render();
}
function commitSession(s, later = false){
  s.touched = true; s.updatedAt = Date.now();
  clearTimeout(debouncers[s.id]);
  const save = () => { Store.saveSession(s); Sync.queue(s.id); };
  if (later) debouncers[s.id] = setTimeout(save, 700); else save();
}
function commitProfile(){ S.profile.updatedAt = Date.now(); Store.saveProfile(); Sync.queue("profile"); }

