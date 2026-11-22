(() => {
"use strict";


const $ = (s) => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const ICON_OK = "<svg class=\"ico\" viewBox=\"0 0 24 24\"><path d=\"M5 12.5l4.5 4.5L19 7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>";
const ICON_NO = "<svg class=\"ico\" viewBox=\"0 0 24 24\"><path d=\"M6.5 6.5l11 11M17.5 6.5l-11 11\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.4\" stroke-linecap=\"round\"/></svg>";
const ICON_VOL = "<svg class=\"ico\" viewBox=\"0 0 24 24\"><path d=\"M4 9h4l5-4v14l-5-4H4z\" fill=\"currentColor\"/><path d=\"M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>";
const ICON_MUTE = "<svg class=\"ico\" viewBox=\"0 0 24 24\"><path d=\"M4 9h4l5-4v14l-5-4H4z\" fill=\"currentColor\"/><path d=\"M16.5 9.5l5 5M21.5 9.5l-5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>";
const stage = $("#stage"), desk = $("#desk"), papersEl = $("#papers");
let scale = 1;
function fit() {
  scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", fit); fit();
const lockScroll = (el) => el.addEventListener("scroll", () => { if (el.scrollTop || el.scrollLeft) { el.scrollTop = 0; el.scrollLeft = 0; } });
[stage, $("#wrap"), $("#desk")].forEach(lockScroll);

function toDesk(e) {
  const r = desk.getBoundingClientRect();
  return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
}


const A = {
  ctx: null, out: null, nb: null, muted: false,
  init() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    this.ctx = new C();
    this.out = this.ctx.createGain(); this.out.gain.value = 0.85;
    const comp = this.ctx.createDynamicsCompressor();
    this.out.connect(comp); comp.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 2;
    this.nb = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.nb.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  },
  env(g, t0, dur, o) {
    const a = o.a || 0.003, peak = o.g || 0.3;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    if (o.hold) g.gain.setValueAtTime(peak, t0 + Math.max(a, dur - 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  },
  noise(t0, dur, o = {}) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.nb; f.type = o.type || "bandpass";
    f.frequency.setValueAtTime(o.f || 1000, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    f.Q.value = o.q ?? 1; this.env(g, t0, dur, o);
    s.connect(f); f.connect(g); g.connect(this.out);
    s.start(t0, Math.random() * 1.5); s.stop(t0 + dur + 0.05);
  },
  tone(t0, dur, o = {}) {
    const c = this.ctx, osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(o.f || 440, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    let node = osc;
    if (o.lp) { const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; osc.connect(f); node = f; }
    this.env(g, t0, dur, o); node.connect(g); g.connect(this.out);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  },
  play(name) {
    if (!this.ctx || this.muted || !SFX[name]) return;
    SFX[name](this.ctx.currentTime + 0.01);
  }
};
const SFX = {
  stamp(t) {
    A.tone(t, 0.17, { f: 150, f2: 42, g: 0.9 });
    A.noise(t, 0.09, { type: "lowpass", f: 900, q: 0.7, g: 0.9 });
    A.noise(t, 0.025, { type: "highpass", f: 2500, g: 0.25 });
    A.noise(t + 0.05, 0.06, { f: 420, q: 2, g: 0.14 });
  },
  grab(t) { A.noise(t, 0.07, { f: 2600, q: 0.7, g: 0.16 }); A.noise(t + 0.03, 0.06, { f: 4200, q: 0.9, g: 0.08 }); },
  drop(t) { A.noise(t, 0.12, { f: 1300, q: 0.6, g: 0.2 }); A.tone(t, 0.07, { f: 110, f2: 70, g: 0.1 }); },
  clunk(t) { A.tone(t, 0.1, { f: 220, f2: 90, g: 0.25 }); A.noise(t, 0.05, { type: "lowpass", f: 1200, g: 0.3 }); },
  slide(t) { A.noise(t, 0.4, { f: 500, f2: 2600, q: 0.8, g: 0.26, a: 0.12 }); A.tone(t + 0.36, 0.06, { f: 140, f2: 80, g: 0.08 }); },
  whoosh(t) { A.noise(t, 0.32, { f: 2400, f2: 500, q: 0.8, g: 0.3, a: 0.05 }); A.tone(t + 0.3, 0.09, { f: 170, f2: 80, g: 0.16 }); A.noise(t + 0.3, 0.08, { f: 1500, q: 0.6, g: 0.12 }); },
  bell(t) {
    A.noise(t, 0.02, { type: "highpass", f: 5000, g: 0.18 });
    A.tone(t, 1.6, { f: 1568, g: 0.2 }); A.tone(t, 1.4, { f: 1574, g: 0.1 });
    A.tone(t, 0.9, { f: 2510, g: 0.07 }); A.tone(t, 0.5, { f: 4180, g: 0.04 });
  },
  buzz(t) { A.tone(t, 0.3, { type: "square", f: 98, g: 0.09, a: 0.01, hold: true, lp: 900 }); A.tone(t, 0.3, { type: "square", f: 104, g: 0.08, a: 0.01, hold: true, lp: 900 }); },
  shred(t) {
    const d = 1.35;
    A.tone(t, d, { type: "sawtooth", f: 58, g: 0.16, a: 0.06, hold: true, lp: 650 });
    A.tone(t, d, { type: "sawtooth", f: 87, g: 0.1, a: 0.06, hold: true, lp: 500 });
    A.noise(t, d, { f: 2200, q: 0.4, g: 0.05, a: 0.05, hold: true });
    for (let i = 0; i < 34; i++) {
      const tt = t + 0.12 + i * 0.033 + Math.random() * 0.02;
      A.noise(tt, rand(0.025, 0.06), { f: rand(1400, 3800), q: rand(0.8, 2), g: rand(0.1, 0.24) });
    }
    A.tone(t + d - 0.05, 0.12, { f: 90, f2: 50, g: 0.2 });
  },
  flip(t) { [0, 0.08, 0.17].forEach((o) => A.noise(t + o, 0.1, { f: 3600, f2: 1400, q: 0.6, g: 0.22 })); },
  tick(t) { A.noise(t, 0.015, { type: "highpass", f: 3000, g: 0.12 }); A.tone(t, 0.02, { f: 1900, g: 0.03 }); },
  stick(t) { A.noise(t, 0.12, { f: 2400, f2: 900, q: 0.7, g: 0.22 }); A.tone(t + 0.05, 0.12, { f: 880, f2: 1320, g: 0.05 }); },
  tear(t) { for (let i = 0; i < 9; i++) A.noise(t + i * 0.028, 0.045, { f: rand(2600, 5200), q: 0.8, g: rand(0.12, 0.22) }); A.noise(t, 0.3, { f: 1800, f2: 4000, q: 0.5, g: 0.08, a: 0.05 }); },
  clink(t) { A.tone(t, 0.5, { f: 2350, g: 0.08 }); A.tone(t, 0.35, { f: 3520, g: 0.05 }); A.noise(t, 0.015, { type: "highpass", f: 5000, g: 0.1 }); }
};
document.addEventListener("pointerdown", () => A.init(), { capture: true });


const DAYS = [
  { fecha: "Lunes, 23 de noviembre", sub: "Primer día en el despacho." },
  { fecha: "Martes, 24 de noviembre", sub: "" },
  { fecha: "Miércoles, 25 de noviembre", sub: "" },
  { fecha: "Jueves, 26 de noviembre", sub: "" },
  { fecha: "Viernes, 27 de noviembre", sub: "Último día de campaña." },
  { fecha: "Sábado, 28 de noviembre", sub: "Jornada de reflexión. Los últimos papeles antes de las urnas." }
];
const HOME = { ok: { x: 1090, y: 412 }, no: { x: 1090, y: 542 } };
const ZONES = {
  shred: { x1: 1050, y1: 0, x2: 1280, y2: 405 },
  out: { x1: 0, y1: 455, x2: 240, y2: 676 }
};

let S; 
let zTop = 10, docNum = 0, firstDossier = true, firstSkip = true;

function newGame() {
  const sueltas = shuffle(window.SUELTAS), exps = shuffle(window.EXPEDIENTES);
  const n = DAYS.length, first = Math.min(4, sueltas.length);
  const rest = sueltas.length - first;
  const days = []; let idx = 0;
  for (let d = 0; d < n; d++) {
    const size = d === 0 ? first : Math.floor(rest / (n - 1)) + (d - 1 < rest % (n - 1) ? 1 : 0);
    const items = sueltas.slice(idx, idx + size).map((it) => ({ type: "single", item: it })); idx += size;
    if (exps[d]) {
      const pos = d === 0 ? items.length : 1 + Math.floor(Math.random() * items.length);
      items.splice(pos, 0, { type: "dossier", exp: exps[d] });
    }
    days.push(items);
  }
  
  exps.slice(n).forEach((e) => days[n - 1].push({ type: "dossier", exp: e }));
  S = { day: -1, days, queue: [], current: null, results: [] };
  docNum = 0; firstDossier = true; firstSkip = true; setCalendar(null);
  papersEl.innerHTML = ""; $("#outbox-stack").innerHTML = ""; $("#shred-bin").innerHTML = "";
}


function show(id) { document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("hidden", s.id !== id)); stage.classList.toggle("title-on", id === "screen-title"); }
function hideAll() { document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden")); stage.classList.remove("title-on"); }



function startDayCard() {
  S.day++; S.waitTear = true; S.queue = []; S.current = null;
  hideAll();
  setCalendar(S.day - 1);
  $("#calendar").classList.add("ready");
  updateBar();
  const mine = S;
  if (S.day === 0) setTimeout(() => { if (S === mine) runTutorial(0); }, 500);
}
function tearCalendar(viaPull = false) {
  if (!S || !S.waitTear) return;
  S.waitTear = false;
  $("#calendar").classList.remove("ready");
  if (viaPull) calDay = S.day; else setCalendar(S.day, true);
  A.play("tear");
  const sub = DAYS[S.day].sub;
  if (sub) setTimeout(() => toast(sub, 3000), 700);
  beginDay();
}
function beginDay() {
  S.queue = S.days[S.day].slice();
  updateBar();
  const mine = S;
  setTimeout(() => { if (S === mine) nextDoc(); }, 900);
}


function tutoSeen() { try { return localStorage.getItem("despacho29n-tuto") === "1"; } catch (e) { return false; } }
function tutoMark() { try { localStorage.setItem("despacho29n-tuto", "1"); } catch (e) {} }
function runTutorial(startAt = 0, onDone, custom) {
  const D = 44; 
  const box = (x, y, w, h, pad = 10) => ({ x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 });
  const steps = [
    { t: "Te doy la bienvenida al despacho. Esta semana te van a llegar <b>propuestas reales</b> de los partidos que se presentan al 29-N… <b>sin firma</b>. Tú decides." },
    { r: box(36, 206 + D, 172, 232), t: "Cada jornada empieza aquí: <b>tira de la hoja del calendario con el ratón</b> hasta arrancarla y empezarán a llegar los papeles. Son seis días, del lunes al sábado. El domingo 29, tu resultado." },
    { r: box(18, 18 + D, 200, 150), t: "Por aquí entran los documentos. El montón te dice <b>cuántos te quedan</b> por decidir hoy." },
    { r: box(250, 70 + D, 780, 420), t: "Las propuestas aparecen en el centro de la mesa y puedes <b>arrastrarlas</b>. El remitente está tachado: no sabrás de quién son hasta el final." },
    { r: box(700, 548 + D, 110, 110), t: "¿Algo te suena a chino? Arrastra la <b>lupa</b> encima del papel y te pega una nota que lo explica fácil." },
    { r: box(1080, 418 + D, 170, 242), t: "Cuando lo tengas claro, coge un sello y suéltalo sobre el papel: <b>✓</b> si lo apruebas, <b>✗</b> si lo rechazas." },
    { r: box(18, 470 + D, 200, 190), t: "Luego arrastra el papel sellado aquí, a <b>DECIDIDAS</b>. Así queda firmado." },
    { r: box(1062, 160 + D, 200, 240), t: "¿No lo tienes claro? Échalo a la <b>trituradora</b>. Es como votar en blanco: no cuenta para tu resultado." },
    { t: "Pulsa la tecla <kbd>P</kbd> cuando quieras para abrir la <b>pausa</b>: sonido, pantalla completa, repetir esta explicación o volver al inicio." },
    { r: box(36, 206 + D, 172, 232), t: "Y ya está. <b>Arranca la hoja del calendario</b> y a trabajar." }
  ];
  if (custom) steps.splice(0, steps.length, ...custom);
  const tuto = $("#tuto"), spot = $("#tuto-spot"), bx = $("#tuto-box"), txt = $("#tuto-text"), next = $("#tuto-next");
  let i = startAt;
  const show = () => {
    const s = steps[i];
    txt.innerHTML = s.t;
    next.textContent = i === steps.length - 1 ? "Empezar" : "Siguiente";
    const r = s.r || { x: 640, y: 330, w: 0, h: 0 };
    Object.assign(spot.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
    spot.style.boxShadow = s.r ? "" : "0 0 0 3000px rgba(8,6,4,.82)";
    const bw = 400, bh = bx.offsetHeight || 150;
    let x, y;
    if (!s.r) { x = 640 - bw / 2; y = 300; }
    else {
      const cx = r.x + r.w / 2;
      x = cx < 640 ? r.x + r.w + 24 : r.x - bw - 24;
      if (r.w > 700) { x = 640 - bw / 2; y = 720 - bh - 16; }
      if (r.w <= 700) { y = r.y + r.h / 2 - bh / 2; if (r.y < 60) y = r.y + r.h + 20; }
    }
    bx.style.transform = `translate3d(${clamp(x, 16, 1280 - bw - 16)}px, ${clamp(y, 16, 720 - bh - 16)}px, 0)`;
    A.play("flip");
  };
  const close = () => { tuto.classList.add("hidden"); if (!custom) tutoMark(); A.play("clunk"); if (onDone) onDone(); };
  next.onclick = () => { i++; if (i >= steps.length) close(); else show(); };
  tuto.classList.remove("hidden");
  show();
}
function updateBar() {
  if (!S || S.day < 0) { setCalendar(null); return; }
  if (calDay === null) setCalendar(S.waitTear ? S.day - 1 : S.day);
  const left = S.queue.length + (S.current ? 1 : 0);
  $("#tb-left").textContent = `PENDIENTES: ${left}`;
  const st = $("#inbox-stack"); st.innerHTML = "";
  for (let i = 0; i < Math.min(S.queue.length, 8); i++) { const b = document.createElement("i"); b.style.top = 47 - i * 8 + "px"; b.style.transform = `translateX(${[0, 4, -3, 2, -4, 3, -2, 1][i]}px) rotate(${[0, -1.2, 1, -.6, 1.3, -1, .7, -.4][i]}deg)`; st.appendChild(b); }
}


let calDay = null; 
function calHTML(d) {
  const f = d < 0 ? "Domingo, 22 de noviembre" : DAYS[d].fecha;
  const m = f.match(/^(\S+), (\d+) de (\S+)/);
  return `<div class="cal-mo">${m[3].toUpperCase()}</div><div class="cal-num">${m[2]}</div><div class="cal-wd">${m[1]}</div>`;
}
function setCalendar(d, tear = false) {
  const cal = $("#calendar"), page = $("#cal-page");
  if (d === null) { cal.classList.remove("on", "ready"); calDay = null; return; }
  cal.classList.add("on");
  if (d === calDay) return;
  if (tear && calDay !== null) { 
    const old = page.cloneNode(true); old.removeAttribute("id"); old.classList.add("tear");
    cal.appendChild(old); setTimeout(() => old.remove(), 800);
  }
  page.innerHTML = calHTML(d);
  calDay = d;
}

let calPull = null;
$("#calendar").addEventListener("pointerdown", (e) => {
  e.preventDefault(); e.stopPropagation();
  if (!S || !S.waitTear || calPull) { A.play("tick"); return; }
  const cal = $("#calendar"), page = $("#cal-page");
  const under = document.createElement("div");
  under.className = "cal-page"; under.innerHTML = calHTML(S.day);
  cal.insertBefore(under, page);
  page.classList.add("pulling"); page.style.transition = "none";
  calPull = { p0: toDesk(e), page, under, creak: 0 };
  A.play("grab");
});
window.addEventListener("pointermove", (e) => {
  if (!calPull) return;
  const p = toDesk(e), dx = p.x - calPull.p0.x, dy = p.y - calPull.p0.y, dist = Math.hypot(dx, dy);
  calPull.page.style.transform = `rotate(${clamp(dx * 0.22, -26, 26)}deg) translate(${dx * 0.12}px, ${Math.max(0, dy) * 0.22}px)`;
  if (dist > 30 && calPull.creak < 1) { calPull.creak = 1; A.play("tick"); }
  if (dist > 60 && calPull.creak < 2) { calPull.creak = 2; A.play("tick"); }
  if (dist > 95) tearByPull(dx, dy);
});
function endCalPull() {
  if (!calPull) return;
  const { page, under } = calPull; calPull = null;
  page.style.transition = "transform .3s cubic-bezier(.3,1.6,.5,1)"; page.style.transform = "";
  page.classList.remove("pulling");
  setTimeout(() => under.remove(), 300);
  A.play("drop");
}
window.addEventListener("pointerup", endCalPull);
window.addEventListener("pointercancel", endCalPull);
function tearByPull(dx, dy) {
  const { page, under } = calPull; calPull = null;
  const ang = Math.atan2(Math.max(dy, 10), dx);
  page.removeAttribute("id"); page.classList.remove("pulling"); page.classList.add("flying");
  page.style.transition = "transform .6s cubic-bezier(.25,.6,.5,1), opacity .6s ease-in";
  requestAnimationFrame(() => {
    page.style.transform = `translate(${Math.cos(ang) * 280}px, ${Math.sin(ang) * 280 + 140}px) rotate(${dx >= 0 ? 48 : -48}deg)`;
    page.style.opacity = "0";
  });
  setTimeout(() => page.remove(), 650);
  under.id = "cal-page";
  tearCalendar(true);
}

let toastTimer;
function toast(msg, ms = 3200) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}


function setPos(el) { el.style.transform = `translate(${el._x}px, ${el._y}px) rotate(${el._r}deg)` + (el._s ? ` scale(${el._s})` : ""); }

function makePaper({ tema, titulo, texto, opt, claro }) {
  docNum++;
  const el = document.createElement("div");
  el.className = "paper" + (opt ? " dossier" : "");
  const sello = "█".repeat(4 + Math.floor(Math.random() * 4));
  el.innerHTML = `
    ${opt ? `<div class="p-opt">EXPEDIENTE · OPCIÓN ${opt}</div>` : ""}
    <div class="p-head"><span>PROPUESTA Nº ${String(docNum).padStart(3, "0")}</span><span class="p-tema">${esc(tema.toUpperCase())}</span></div>
    <div class="p-from">REMITENTE: <span class="redact">${"█".repeat(14)}</span></div>
    <h3>${esc(titulo)}</h3>
    <p>${esc(texto)}</p>
    <div class="p-foot"><span>Firma: <span class="redact">${sello}</span></span><span>Registro 29-N</span></div>`;
  el._claro = claro;
  el._x = -360; el._y = 60; el._r = rand(-6, 6); el._base = rand(-2.5, 2.5);
  el.style.zIndex = ++zTop;
  setPos(el);
  el.addEventListener("pointerdown", (e) => startDrag(e, el, "paper"));
  papersEl.appendChild(el);
  return el;
}
function moveAnimated(el, x, y, r, s) {
  el.classList.add("anim");
  el._x = x; el._y = y; el._r = r ?? el._base; el._s = s;
  requestAnimationFrame(() => setPos(el));
  clearTimeout(el._animT); el._animT = setTimeout(() => el.classList.remove("anim"), 600);
}

function nextDoc() {
  S.current = null;
  const mine = S;
  if (!S.queue.length) { updateBar(); setTimeout(() => { if (S === mine) endDay(); }, 700); return; }
  const job = S.queue.shift();
  S.current = job;
  updateBar();
  A.play("bell");
  setTimeout(() => {
    if (S !== mine) return;
    if (job.type === "single") {
      const it = job.item;
      const el = makePaper({ tema: it.tema, titulo: it.titulo, texto: it.texto, claro: it.claro });
      el._doc = job; job.el = el;
      A.play("slide");
      moveAnimated(el, 470 + rand(-20, 20), 120 + rand(-15, 15));
    } else {
      const opts = shuffle(job.exp.opciones);
      job.remaining = new Set();
      const n = opts.length, span = 760, w = 300;
      const step = n > 1 ? Math.min(230, (span - w) / (n - 1)) : 0;
      const x0 = 250 + (span - (w + step * (n - 1))) / 2;
      opts.forEach((o, i) => {
        setTimeout(() => {
          if (S !== mine) return;
          const el = makePaper({ tema: job.exp.tema, titulo: o.titulo, texto: o.texto, opt: "ABCD"[i], claro: o.claro });
          el._doc = job; el._opt = o; job.remaining.add(el);
          A.play("slide");
          moveAnimated(el, x0 + i * step, 70 + (i % 2) * 40 + rand(-8, 8));
        }, i * 260);
      });
      if (firstDossier) {
        setTimeout(() => {
          if (S !== mine) return;
          const D = 44;
          runTutorial(0, null, [
            { r: { x: 240, y: 50 + D, w: 800, h: 470 }, t: `Esto es un <b>expediente</b>: ${n} propuestas sobre el mismo tema (${esc(job.exp.tema.toLowerCase())}), una de cada partido. <b>Solo una puede salir del despacho.</b>` },
            { r: { x: 1052, y: D - 10, w: 220, h: 420 }, t: "Lee las opciones y quédate con la que más te convenza. Las demás, <b>a la trituradora</b>." },
            { r: { x: 1070, y: 408 + D, w: 190, h: 140 }, t: "A la que sobreviva ponle el <b>✓</b> y llévala a <b>DECIDIDAS</b>." }
          ]);
        }, n * 260 + 500);
      }
      firstDossier = false;
    }
  }, 350);
}

function resolve(result) {
  result.day = S.day;
  S.results.push(result);
  const mine = S;
  setTimeout(() => { if (S === mine) nextDoc(); }, 450);
}

function bounce(el) { moveAnimated(el, clamp(el._x, 260, 760), clamp(el._y, 40, 300)); }

function inZone(p, z) { return p.x >= z.x1 && p.x <= z.x2 && p.y >= z.y1 && p.y <= z.y2; }

function sendOut(el) {
  const job = el._doc;
  if (!el._verdict) { A.play("buzz"); toast("Ponle un sello antes de mandarlo a DECIDIDAS."); return bounce(el); }
  if (job.type === "dossier") {
    if (job.remaining.size > 1) { A.play("buzz"); toast("De un expediente solo sale una propuesta. Tritura las demás primero."); return bounce(el); }
    if (el._verdict !== "ok") { A.play("buzz"); toast("Lo que sale de un expediente tiene que ir aprobado (✓). Vuelve a sellarlo."); return bounce(el); }
  }
  A.play("whoosh");
  el.style.pointerEvents = "none";
  moveAnimated(el, 0, 470, rand(-6, 6), 0.42);
  el.style.opacity = "0";
  setTimeout(() => {
    el.remove();
    const st = $("#outbox-stack");
    const b = document.createElement("i"); b.style.top = Math.max(0, 40 - st.children.length * 2) + "px";
    b.style.transform = `rotate(${rand(-5, 5)}deg)`;
    st.appendChild(b); while (st.children.length > 14) st.firstChild.remove();
  }, 420);
  if (job.type === "single") resolve({ type: "single", item: job.item, verdict: el._verdict });
  else resolve({ type: "dossier", exp: job.exp, chosen: el._opt.partido });
}

function shred(el) {
  const job = el._doc;
  if (job.type === "dossier" && job.remaining.size <= 1) {
    A.play("buzz"); toast("Tienes que salvar una propuesta del expediente."); return bounce(el);
  }
  
  el.style.pointerEvents = "none";
  el.querySelectorAll(".explain").forEach((n) => n.remove());
  const k = 156 / el.offsetWidth, h = el.offsetHeight * k;
  const SLOT_Y = 180, MOUTH_X = 1080, MOUTH_TOP = -44; 
  el.style.transformOrigin = "0 0";
  el.classList.add("anim");
  el.style.transition = "transform .28s cubic-bezier(.3,.9,.4,1)";
  el._x = MOUTH_X + 4; el._y = SLOT_Y - h; el._r = 0; el._s = k;
  setPos(el);
  A.play("grab");
  
  setTimeout(() => {
    const mouth = $("#shred-mouth");
    el.classList.remove("anim"); el.style.transition = "none";
    const y0 = el._y - MOUTH_TOP;
    el.style.transform = `translate(4px, ${y0}px) scale(${k})`;
    mouth.appendChild(el);
    A.play("shred");
    const sh = $("#shredder"), led = $("#shred-led");
    sh.classList.add("busy"); led.classList.add("on");
    clearTimeout(sh._t); sh._t = setTimeout(() => { sh.classList.remove("busy"); led.classList.remove("on"); }, 1350);
    el.animate([
      { transform: `translate(4px, ${y0}px) scale(${k})` },
      { transform: `translate(2px, ${y0 + h * 0.5}px) scale(${k})`, offset: 0.5 },
      { transform: `translate(5px, ${y0 + h + 4}px) scale(${k})` }
    ], { duration: 1150, easing: "linear", fill: "forwards" });
    setTimeout(() => el.remove(), 1200);
  }, 300);

  const bin = $("#shred-bin");
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const s = document.createElement("div"); s.className = "strip";
      const x = rand(8, 160), x2 = x + rand(-14, 14), y2 = rand(62, 90), r = rand(-70, 70);
      bin.appendChild(s);
      s.animate([{ transform: `translate(${x}px,-40px) rotate(0deg)` }, { transform: `translate(${x2}px,${y2}px) rotate(${r}deg)` }],
        { duration: rand(380, 560), easing: "cubic-bezier(.5,0,1,1)", fill: "forwards" });
      while (bin.children.length > 160) bin.firstChild.remove();
    }, 420 + i * 60);
  }

  if (job.type === "single") {
    resolve({ type: "single", item: job.item, verdict: "skip" });
    if (firstSkip) { firstSkip = false; setTimeout(() => toast("Triturada: no lo tienes claro. No cuenta para tu resultado.", 3600), 300); }
  } else {
    job.remaining.delete(el);
    if (job.remaining.size === 1) {
      const last = [...job.remaining][0];
      if (last._verdict !== "ok") setTimeout(() => toast("Queda una. Ponle el ✓ y llévala a DECIDIDAS."), 900);
    }
  }
}


const stamps = { ok: $("#stamp-ok"), no: $("#stamp-no") };
function stampHome(kind, animate = true) {
  const st = stamps[kind];
  st._x = HOME[kind].x; st._y = HOME[kind].y; st._r = 0;
  if (animate) { st.classList.add("home"); setTimeout(() => st.classList.remove("home"), 300); }
  setPos(st);
}
Object.keys(stamps).forEach((k) => {
  stampHome(k, false);
  stamps[k].addEventListener("pointerdown", (e) => startDrag(e, stamps[k], "stamp"));
});

const lupa = $("#lupa");
function lupaHome(animate = true) {
  lupa._x = 700; lupa._y = 548; lupa._r = 0;
  if (animate) { lupa.classList.add("home"); setTimeout(() => lupa.classList.remove("home"), 320); }
  setPos(lupa);
}
lupaHome(false);
lupa.addEventListener("pointerdown", (e) => startDrag(e, lupa, "lupa"));

function applyLupa(p) {
  const paper = paperAt(p);
  setTimeout(lupaHome, 120);
  if (!paper || !paper._claro) { A.play("drop"); return; }
  paper.querySelectorAll(".explain").forEach((n) => n.remove());
  const n = document.createElement("div");
  const r = rand(-4, 4);
  n.className = "explain";
  n.style.setProperty("--r", r + "deg"); n.style.transform = `rotate(${r}deg)`;
  n.textContent = paper._claro;
  const right = paper._x < 560;
  n.style.left = (right ? 282 : -222) + "px";
  n.style.top = clamp(p.y - paper._y - 40, 40, 160) + "px";
  n.addEventListener("pointerdown", (e) => { e.stopPropagation(); A.play("grab"); n.remove(); });
  paper.appendChild(n);
  paper.style.zIndex = ++zTop;
  A.play("stick");
}

function paperAt(p) {
  let best = null;
  for (const el of papersEl.children) {
    if (el.style.pointerEvents === "none") continue;
    const w = el.offsetWidth, h = el.offsetHeight;
    if (p.x >= el._x && p.x <= el._x + w && p.y >= el._y && p.y <= el._y + h) {
      if (!best || +el.style.zIndex > +best.style.zIndex) best = el;
    }
  }
  return best;
}

function applyStamp(st, p) {
  const kind = st.dataset.kind;
  const paper = paperAt(p);
  st.classList.add("press");
  setTimeout(() => st.classList.remove("press"), 220);
  if (!paper) { A.play("clunk"); setTimeout(() => stampHome(kind), 200); return; }
  setTimeout(() => {
    A.play("stamp");
    paper.querySelectorAll(".mark").forEach((m) => m.remove());
    const m = document.createElement("div");
    const r = rand(-12, 8);
    m.className = `mark ${kind} fresh`;
    m.innerHTML = kind === "ok" ? ICON_OK : ICON_NO;
    m.style.setProperty("--r", r + "deg");
    m.style.transform = `rotate(${r}deg)`;
    const w = paper.offsetWidth, h = paper.offsetHeight;
    m.style.left = clamp(p.x - paper._x - 46, -10, w - 82) + "px";
    m.style.top = clamp(p.y - paper._y - 46, 10, h - 90) + "px";
    paper.appendChild(m);
    paper._verdict = kind;
    paper.style.zIndex = ++zTop;
  }, 70);
  setTimeout(() => stampHome(kind), 260);
}


let drag = null;
function startDrag(e, el, kind) {
  if (e.button !== undefined && e.button !== 0) return;
  e.preventDefault(); e.stopPropagation();
  if (drag) { 
    const prev = drag; drag = null; prev.el.classList.remove("dragging");
    if (prev.kind === "stamp") stampHome(prev.el.dataset.kind);
    if (prev.kind === "lupa") lupaHome();
  }
  const p = toDesk(e);
  el.classList.remove("anim", "home");
  if (kind === "lupa") {
    el._x = p.x - 42; el._y = p.y - 42; setPos(el);
    drag = { el, kind, ox: 42, oy: 42, lx: p.x, vx: 0 };
    A.play("grab");
  } else if (kind === "stamp") {
    el._x = p.x - 75; el._y = p.y - 72; setPos(el);
    drag = { el, kind, ox: 75, oy: 72, lx: p.x, vx: 0 };
    A.play("grab");
  } else if (kind === "prop") {
    drag = { el, kind, ox: p.x - el._x, oy: p.y - el._y, lx: p.x, vx: 0 };
    A.play(el.id === "mug" ? "clink" : "grab");
  } else {
    el.style.zIndex = ++zTop;
    drag = { el, kind, ox: p.x - el._x, oy: p.y - el._y, lx: p.x, vx: 0 };
    A.play("grab");
  }
  el.classList.add("dragging");
}
window.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const p = toDesk(e), el = drag.el;
  drag.vx = drag.vx * 0.7 + (p.x - drag.lx) * 0.3; drag.lx = p.x;
  el._x = clamp(p.x - drag.ox, -140, 1200);
  el._y = clamp(p.y - drag.oy, -60, 620);
  if (drag.kind === "paper") {
    el._r = el._base + clamp(drag.vx * 0.6, -9, 9);
    $("#shredder").classList.toggle("hot", inZone(p, ZONES.shred));
    $("#outbox").classList.toggle("hot", inZone(p, ZONES.out));
  }
  setPos(el);
});
function endDrag(e) {
  if (!drag) return;
  const { el, kind } = drag; drag = null;
  el.classList.remove("dragging");
  $("#shredder").classList.remove("hot"); $("#outbox").classList.remove("hot");
  const p = toDesk(e);
  if (kind === "stamp") return applyStamp(el, p);
  if (kind === "lupa") return applyLupa(p);
  if (kind === "prop") { A.play(el.id === "mug" ? "clink" : "drop"); return; }
  el._r = el._base; setPos(el);
  if (inZone(p, ZONES.shred)) return shred(el);
  if (inZone(p, ZONES.out)) return sendOut(el);
  A.play("drop");
}
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

const PROPS = { mug: { x: 900, y: 8, r: 0 }, pen: { x: 262, y: 612, r: -8 } };
function propsHome() {
  Object.entries(PROPS).forEach(([id, h]) => { const el = $("#" + id); el._x = h.x; el._y = h.y; el._r = h.r; setPos(el); });
}
propsHome();
Object.keys(PROPS).forEach((id) => $("#" + id).addEventListener("pointerdown", (e) => startDrag(e, $("#" + id), "prop")));


const P = window.PARTIDOS;
function endDay() {
  const res = S.results.filter((r) => r.day === S.day);
  const okSingles = res.filter((r) => r.type === "single" && r.verdict === "ok");
  const noSingles = res.filter((r) => r.type === "single" && r.verdict === "no");
  const doss = res.filter((r) => r.type === "dossier");
  let html = "";
  const heads = [];
  doss.forEach((d) => {
    const o = d.exp.opciones.find((x) => x.partido === d.chosen);
    heads.push({ k: `EXPEDIENTE ${d.exp.tema.toUpperCase()}`, t: o.titulo, lead: true });
  });
  okSingles.forEach((r) => heads.push({ k: r.item.tema.toUpperCase(), t: r.item.titulo }));
  if (!heads.length) html += `<div class="np-k">ÚLTIMA HORA</div><div class="np-lead">El despacho no aprueba nada en toda la jornada</div>`;
  else {
    const [lead, ...others] = heads;
    html += `<div class="np-k">${esc(lead.k)}</div><div class="np-lead">${esc(lead.t)}</div>`;
    if (others.length) html += `<div class="np-cols">` + others.map((h) => `<div><div class="np-k">${esc(h.k)}</div><div class="np-h">${esc(h.t)}</div></div>`).join("") + `</div>`;
  }
  if (noSingles.length) html += `<div class="np-small"><b>Rechazadas:</b> ${noSingles.map((r) => esc(r.item.titulo)).join(" · ")}.</div>`;
  const skips = res.filter((r) => r.type === "single" && r.verdict === "skip");
  if (skips.length) html += `<div class="np-small"><b>A la trituradora, sin decidir:</b> ${skips.map((r) => esc(r.item.titulo)).join(" · ")}.</div>`;
  $("#np-date").textContent = DAYS[S.day].fecha;
  $("#np-body").innerHTML = html;
  $("#btn-next").textContent = S.day === DAYS.length - 1 ? "IR A VOTAR" : "SIGUIENTE JORNADA";
  A.play("flip");
  show("screen-paper");
}


function scores() {
  const sc = {}; Object.keys(P).forEach((k) => (sc[k] = { pts: 0, ap: 0 }));
  S.results.forEach((r) => {
    if (r.type === "single") { if (r.verdict !== "skip") r.item.partidos.forEach((k) => { sc[k].ap++; if (r.verdict === "ok") sc[k].pts++; }); }
    else r.exp.opciones.forEach((o) => { sc[o.partido].ap++; if (o.partido === r.chosen) sc[o.partido].pts++; });
  });
  return Object.entries(sc).map(([k, v]) => ({ k, ...v, pct: v.ap ? Math.round((v.pts / v.ap) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct || b.pts - a.pts);
}

function playerCompass() {
  let se = 0, we = 0, sa = 0, wa = 0;
  const add = (eje, sign, w = 1) => {
    se += sign * eje[0] * w; we += Math.abs(eje[0]) * w;
    sa += sign * eje[1] * w; wa += Math.abs(eje[1]) * w;
  };
  S.results.forEach((r) => {
    if (r.type === "single") { if (r.verdict !== "skip") add(r.item.eje, r.verdict === "ok" ? 1 : -1); }
    else {
      const n = r.exp.opciones.length;
      r.exp.opciones.forEach((o) => (o.partido === r.chosen ? add(o.eje, 1) : add(o.eje, -1, 1 / (n - 1))));
    }
  });
  return { x: we ? se / we : 0, y: wa ? sa / wa : 0 };
}
function partyCompass() {
  const acc = {}; Object.keys(P).forEach((k) => (acc[k] = { se: 0, ne: 0, sa: 0, na: 0 }));
  const add = (k, eje) => { if (eje[0]) { acc[k].se += eje[0]; acc[k].ne++; } if (eje[1]) { acc[k].sa += eje[1]; acc[k].na++; } };
  window.SUELTAS.forEach((it) => it.partidos.forEach((k) => add(k, it.eje)));
  window.EXPEDIENTES.forEach((e) => e.opciones.forEach((o) => add(o.partido, o.eje)));
  return Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, { x: v.ne ? v.se / v.ne : 0, y: v.na ? v.sa / v.na : 0 }]));
}
function quadrantName(p) {
  if (Math.abs(p.x) < 0.15 && Math.abs(p.y) < 0.15) return "Centro";
  const eco = Math.abs(p.x) < 0.15 ? "Centro" : p.x < 0 ? "Izquierda" : "Derecha";
  const soc = Math.abs(p.y) < 0.15 ? "" : p.y > 0 ? (eco === "Centro" ? "autoritario" : "autoritaria") : (eco === "Centro" ? "libertario" : "libertaria");
  return (eco + " " + soc).trim();
}
function renderCompass() {
  const me = playerCompass(), parties = partyCompass();
  const X = (v) => 190 + clamp(v, -1, 1) * 160, Y = (v) => 190 - clamp(v, -1, 1) * 160;
  const label = (t, x, y, a = "middle") => `<text x="${x}" y="${y}" text-anchor="${a}" fill="#d8cbb3" font-family="Zilla Slab, Georgia, serif" font-size="12" font-weight="bold">${t}</text>`;
  const placed = [];
  const dots = Object.entries(parties).map(([k, p]) => {
    const cx = X(p.x), cy = Y(p.y);
    const clash = placed.some((q) => Math.abs(q.x - cx) < 70 && Math.abs(q.y - cy) < 16);
    const left = clash ? !(p.x > 0.55) : p.x > 0.55;
    const ly = cy + 4 + (clash ? 14 : 0);
    placed.push({ x: cx, y: ly });
    return `
    <g class="cmp-party"><circle cx="${X(p.x)}" cy="${Y(p.y)}" r="7" fill="${P[k].color}" stroke="#16120f" stroke-width="2"/>
    <text x="${cx + (left ? -11 : 11)}" y="${ly}" text-anchor="${left ? "end" : "start"}" fill="#16120f" font-family="Zilla Slab, Georgia, serif" font-size="12" font-weight="800">${esc(P[k].nombre)}</text></g>`;
  }).join("");
  const svg = `<svg viewBox="0 0 380 380" role="img" aria-label="Brújula política">
    <rect x="30" y="30" width="160" height="160" fill="#f2b8b5"/><rect x="190" y="30" width="160" height="160" fill="#9fd5f2"/>
    <rect x="30" y="190" width="160" height="160" fill="#c8e3bd"/><rect x="190" y="190" width="160" height="160" fill="#f3efa8"/>
    <g opacity=".18" stroke="#16120f">${[70, 110, 150, 230, 270, 310].map((v) => `<line x1="${v}" y1="30" x2="${v}" y2="350"/><line x1="30" y1="${v}" x2="350" y2="${v}"/>`).join("")}</g>
    <line x1="30" y1="190" x2="350" y2="190" stroke="#16120f" stroke-width="2.5"/><line x1="190" y1="30" x2="190" y2="350" stroke="#16120f" stroke-width="2.5"/>
    ${label("AUTORITARIO", 190, 22)}${label("LIBERTARIO", 190, 369)}
    ${label("IZQ.", 4, 186, "start")}${label("DER.", 376, 186, "end")}
    ${dots}
    <g class="cmp-you"><circle cx="${X(me.x)}" cy="${Y(me.y)}" r="13" fill="#16120f" stroke="#e8b04a" stroke-width="3"/>
    <text x="${X(me.x)}" y="${Y(me.y) + 4}" text-anchor="middle" fill="#e8b04a" font-family="Zilla Slab, Georgia, serif" font-size="11" font-weight="900">TÚ</text></g>
  </svg>`;
  $("#end-compass").innerHTML = svg + `<div class="cmp-side"><div class="cmp-q">${quadrantName(me)}</div>
    <p>Eje económico ${me.x < 0 ? "a la izquierda" : "a la derecha"} (${Math.round(Math.abs(me.x) * 100)}) y eje social ${me.y > 0 ? "hacia lo autoritario" : "hacia lo libertario"} (${Math.round(Math.abs(me.y) * 100)}), sobre 100.</p>
    <p style="margin-top:8px">Los puntos de colores son la media de las propuestas de cada partido que aparecen en el juego. La posición de cada propuesta es una clasificación orientativa nuestra.</p></div>`;
  return me;
}

function chip(k) { return `<span class="chip" style="background:${P[k].color}">${esc(P[k].nombre)}</span>`; }

function showEnd() {
  const sc = scores();
  const top = sc.filter((s) => s.pct === sc[0].pct);
  $("#end-title").textContent = top.length > 1 ? "Empate técnico en tu despacho:" : "Tu despacho se parece a…";
  $("#end-winner").innerHTML = top.map((s) => `<span style="color:${P[s.k].color}">${esc(P[s.k].nombre)}</span>`).join(" · ");
  $("#end-bars").innerHTML = sc.map((s) => `
    <div class="bar-row"><div>${esc(P[s.k].nombre)}<small>${s.pts} de ${s.ap} propuestas</small></div>
    <div class="bar-track"><div class="bar-fill" style="background:${P[s.k].color}" data-w="${s.pct}"></div></div><div>${s.pct}%</div></div>`).join("");
  renderCompass();
  buildList();
  $("#end-list").classList.add("hidden");
  $("#btn-reveal").classList.remove("hidden");
  show("screen-end");
  A.play("flip");
  document.querySelectorAll(".bar-fill").forEach((b, i) => setTimeout(() => { b.style.width = b.dataset.w + "%"; A.play("tick"); }, 600 + i * 350));
  const tBars = 600 + sc.length * 350 + 400;
  setTimeout(() => A.play("bell"), tBars);
  document.querySelectorAll(".cmp-party").forEach((g, i) => setTimeout(() => { g.classList.add("show"); A.play("tick"); }, tBars + 500 + i * 250));
  setTimeout(() => { document.querySelector(".cmp-you")?.classList.add("show"); A.play("stamp"); }, tBars + 500 + sc.length * 250 + 300);
}
function buildList() {
  let html = "";
  DAYS.forEach((d, i) => {
    const res = S.results.filter((r) => r.day === i); if (!res.length) return;
    html += `<h4>${esc(d.fecha.toUpperCase())}</h4>`;
    res.forEach((r) => {
      if (r.type === "single") {
        html += `<div class="row"><div>${esc(r.item.titulo)}<span class="sub">${esc(r.item.texto)}</span></div>
          <span class="verdict ${r.verdict}">${{ ok: "APROBADA", no: "RECHAZADA", skip: "EN BLANCO" }[r.verdict]}</span><span>${r.item.partidos.map(chip).join("")}</span></div>`;
      } else {
        r.exp.opciones.forEach((o) => {
          const kept = o.partido === r.chosen;
          html += `<div class="row"><div>${kept ? "★ " : ""}${esc(o.titulo)}<span class="sub">Expediente ${esc(r.exp.tema)}</span></div>
            <span class="verdict ${kept ? "ok" : "no"}">${kept ? "SALVADA" : "TRITURADA"}</span><span>${chip(o.partido)}</span></div>`;
        });
      }
    });
  });
  $("#end-list").innerHTML = html;
}



const titleScreen = $("#screen-title");
const onTitle = () => !titleScreen.classList.contains("hidden") && $("#intro").classList.contains("gone") && pause.classList.contains("hidden");
function startGame() { A.init(); A.play("clunk"); newGame(); startDayCard(); }
titleScreen.addEventListener("click", (e) => { if (e.target.closest("#discord, #title-credits")) return; if (onTitle()) startGame(); });
$("#btn-full").addEventListener("click", (e) => {
  e.stopPropagation(); A.init(); A.play("tick");
  if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
});
window.addEventListener("keydown", (e) => {
  if (!onTitle() || e.repeat || ["Escape", "Tab", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
  e.preventDefault(); e.stopImmediatePropagation(); startGame();
}, true);
stage.classList.add("title-on");
$("#btn-day").addEventListener("click", beginDay);
$("#btn-next").addEventListener("click", () => {
  A.play("clunk");
  if (S.day >= DAYS.length - 1) showEnd(); else startDayCard();
});
$("#btn-reveal").addEventListener("click", () => {
  A.play("flip"); $("#end-list").classList.remove("hidden"); $("#btn-reveal").classList.add("hidden");
  const rep = $(".report");
  const dy = ($("#end-list").getBoundingClientRect().top - rep.getBoundingClientRect().top) / scale;
  rep.scrollTo({ top: rep.scrollTop + dy - 16, behavior: "smooth" });
});
$("#btn-again").addEventListener("click", () => { A.play("clunk"); newGame(); startDayCard(); });

const pause = $("#pause");
function openPause() { pause.classList.remove("hidden"); $("#opt-sound").checked = !A.muted; $("#opt-full").checked = !!document.fullscreenElement; A.play("flip"); }
function closePause() { pause.classList.add("hidden"); showCredits(false); creditsFromTitle = false; A.play("clunk"); }
function showCredits(on) { $("#credits").classList.toggle("hidden", !on); $(".pause-card:not(.credits-card)").classList.toggle("hidden", on); }
$("#btn-credits").addEventListener("click", () => { showCredits(true); A.play("flip"); });
let creditsFromTitle = false;
$("#btn-credits-back").addEventListener("click", () => { if (creditsFromTitle) { creditsFromTitle = false; closePause(); return; } showCredits(false); A.play("flip"); });
$("#title-credits").addEventListener("click", (e) => {
  e.stopPropagation(); A.init();
  creditsFromTitle = true; pause.classList.remove("hidden"); showCredits(true); A.play("flip");
});
function toggleMute() { A.muted = !A.muted; $("#opt-sound").checked = !A.muted; }
$("#pause-x").addEventListener("click", closePause);
pause.addEventListener("pointerdown", (e) => { if (e.target === pause) closePause(); });
$("#opt-sound").addEventListener("change", (e) => { A.muted = !e.target.checked; A.play("tick"); });
$("#opt-full").addEventListener("change", (e) => {
  if (e.target.checked) document.documentElement.requestFullscreen?.().catch(() => (e.target.checked = false));
  else if (document.fullscreenElement) document.exitFullscreen();
});
document.addEventListener("fullscreenchange", () => { $("#opt-full").checked = !!document.fullscreenElement; });
$("#btn-home").addEventListener("click", goHome);
$("#end-x").addEventListener("click", goHome);
$("#btn-tuto").addEventListener("click", () => {
  pause.classList.add("hidden");
  const enMesa = S && S.day >= 0 && [...document.querySelectorAll(".screen")].every((x) => x.classList.contains("hidden"));
  if (enMesa) runTutorial(0);
  else { try { localStorage.removeItem("despacho29n-tuto"); } catch (e) {} goHome(); A.init(); newGame(); startDayCard(); }
});
function goHome() {
  S = null; drag = null;
  papersEl.innerHTML = ""; $("#outbox-stack").innerHTML = ""; $("#shred-bin").innerHTML = ""; $("#shred-mouth").innerHTML = "";
  $("#tuto").classList.add("hidden"); $("#toast").classList.remove("show");
  stampHome("ok", false); stampHome("no", false); lupaHome(false); propsHome();
  pause.classList.add("hidden");
  updateBar(); $("#inbox-stack").innerHTML = "";
  show("screen-title"); A.play("clunk");
}
window.addEventListener("keydown", (e) => {
  if (e.key === "m" || e.key === "M") toggleMute();
  if (e.key === "Escape" || ((e.key === "p" || e.key === "P") && !onTitle())) { if (pause.classList.contains("hidden")) openPause(); else closePause(); }
});


const INTRO_LINES = [
  "La política no debería separar al pueblo.",
  "No es algo de izquierda contra derecha,<br>son los de arriba contra los de abajo."
];
(function intro() {
  const box = $("#intro"), txt = $("#intro-text");
  txt.innerHTML = INTRO_LINES.map((l) => `<span class="line">${l}</span>`).join("");
  let timers = [];
  const finish = () => {
    timers.forEach(clearTimeout); timers = [];
    txt.classList.remove("show");
    timers.push(setTimeout(() => box.classList.add("gone"), 900));
    box.removeEventListener("click", finish);
  };
  timers.push(setTimeout(() => txt.classList.add("show"), 700));   
  timers.push(setTimeout(() => txt.classList.remove("show"), 9200)); 
  timers.push(setTimeout(() => box.classList.add("gone"), 11600));   
  box.addEventListener("click", finish);
})();

updateBar();
})();
