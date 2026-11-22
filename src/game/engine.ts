import { DAYS, LUPA_HOME, PROPS_HOME, SHRED, STAGE_W, STAMP_HOME, ZONES } from './constants';
import { planWeek } from './plan';
import { sound } from './sound';
import { createStore } from './store';
import type { Expediente, Job, Kind, Opcion, Point, Pose, Propuesta, Result } from './types';
import { clamp, rand, shuffle } from './util';

export interface Mark {
  key: number;
  kind: Kind;
  left: number;
  top: number;
  r: number;
}

export interface Note {
  key: number;
  left: number;
  top: number;
  r: number;
  text: string;
}

export interface PaperView {
  id: number;
  num: number;
  tema: string;
  titulo: string;
  texto: string;
  opt?: string;
  sello: number;
  pose: Pose;
  base: number;
  z: number;
  anim: boolean;
  dragging: boolean;
  gone: boolean;
  locked: boolean;
  verdict?: Kind;
  mark?: Mark;
  note?: Note;
  feed?: { k: number; h: number; inside: boolean };
}

export interface Tool {
  pose: Pose;
  dragging: boolean;
  home: boolean;
  press: boolean;
}

export interface Strip {
  id: number;
  x: number;
  x2: number;
  y2: number;
  r: number;
  dur: number;
}

export interface Leaf {
  id: number;
  day: number;
  mode: 'tear' | 'fly';
  from?: string;
  to?: string;
}

export interface CalendarView {
  on: boolean;
  day: number | null;
  ready: boolean;
  under: number | null;
  pull: string;
  pulling: boolean;
  spring: boolean;
  leaves: Leaf[];
}

export interface OutboxSheet {
  id: number;
  top: number;
  r: number;
}

export type Screen = 'title' | 'paper' | 'end' | null;

export type Tutorial =
  | { kind: 'intro'; index: number }
  | { kind: 'dossier'; index: number; n: number; tema: string };

export type PropId = 'mug' | 'pen';

export type DragTarget =
  | { kind: 'paper'; id: number }
  | { kind: 'stamp'; which: Kind }
  | { kind: 'lupa' }
  | { kind: 'prop'; which: PropId };

export interface GameState {
  screen: Screen;
  introGone: boolean;
  day: number;
  inbox: number;
  calendar: CalendarView;
  papers: PaperView[];
  outbox: OutboxSheet[];
  strips: Strip[];
  shredBusy: boolean;
  hot: { shred: boolean; out: boolean };
  stamps: Record<Kind, Tool>;
  lupa: Tool;
  props: Record<PropId, Tool>;
  toast: { msg: string; show: boolean };
  tutorial: Tutorial | null;
  pause: 'menu' | 'credits' | null;
  muted: boolean;
  results: Result[];
  endRun: number;
}

export interface PointerLike {
  clientX: number;
  clientY: number;
  button?: number;
  preventDefault: () => void;
  stopPropagation: () => void;
}

type Decision = Result extends infer R ? (R extends Result ? Omit<R, 'day'> : never) : never;

type ActiveJob =
  | { type: 'single'; item: Propuesta }
  | { type: 'dossier'; exp: Expediente; remaining: Set<number> };

interface PaperInfo {
  job: ActiveJob;
  opt?: Opcion;
  claro: string;
}

interface Drag {
  target: DragTarget;
  ox: number;
  oy: number;
  lx: number;
  vx: number;
}

const tool = (pose: Pose): Tool => ({ pose: { ...pose }, dragging: false, home: false, press: false });

const emptyCalendar = (): CalendarView => ({
  on: false, day: null, ready: false, under: null, pull: '', pulling: false, spring: false, leaves: [],
});

const initialState = (): GameState => ({
  screen: 'title',
  introGone: false,
  day: -1,
  inbox: 0,
  calendar: emptyCalendar(),
  papers: [],
  outbox: [],
  strips: [],
  shredBusy: false,
  hot: { shred: false, out: false },
  stamps: { ok: tool(STAMP_HOME.ok), no: tool(STAMP_HOME.no) },
  lupa: tool(LUPA_HOME),
  props: { mug: tool(PROPS_HOME.mug), pen: tool(PROPS_HOME.pen) },
  toast: { msg: '', show: false },
  tutorial: null,
  pause: null,
  muted: false,
  results: [],
  endRun: 0,
});

const inZone = (p: Point, z: { x1: number; y1: number; x2: number; y2: number }) =>
  p.x >= z.x1 && p.x <= z.x2 && p.y >= z.y1 && p.y <= z.y2;

export class Game {
  readonly store = createStore<GameState>(initialState());

  days: Job[][] = [];
  queue: Job[] = [];
  waitTear = false;
  firstDossier = true;
  firstSkip = true;
  creditsFromTitle = false;

  private gen = 0;
  private uid = 0;
  private zTop = 10;
  private docNum = 0;
  private info = new Map<number, PaperInfo>();
  private els = new Map<number, HTMLElement>();
  private animTimers = new Map<number, number>();
  private desk: HTMLElement | null = null;
  private drag: Drag | null = null;
  private calPull: { p0: Point; creak: number } | null = null;
  private toastTimer = 0;
  private shredTimer = 0;

  get state() {
    return this.store.get();
  }

  private set(patch: Partial<GameState> | ((s: GameState) => Partial<GameState>)) {
    this.store.set(patch);
  }

  later(ms: number, fn: () => void) {
    const g = this.gen;
    window.setTimeout(() => {
      if (this.gen === g) fn();
    }, ms);
  }

  setDesk(el: HTMLElement | null) {
    this.desk = el;
  }

  registerPaper(id: number, el: HTMLElement | null) {
    if (el) this.els.set(id, el);
    else this.els.delete(id);
  }

  private toDesk(e: { clientX: number; clientY: number }): Point {
    const r = this.desk!.getBoundingClientRect();
    const k = r.width / STAGE_W;
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
  }

  setIntroGone() {
    this.set({ introGone: true });
  }

  onTitle() {
    const s = this.state;
    return s.screen === 'title' && s.introGone && s.pause === null;
  }

  startGame() {
    sound.init();
    sound.play('clunk');
    this.newGame();
    this.startDayCard();
  }

  newGame() {
    this.gen++;
    this.days = planWeek();
    this.queue = [];
    this.waitTear = false;
    this.docNum = 0;
    this.firstDossier = true;
    this.firstSkip = true;
    this.info.clear();
    this.set({ day: -1, results: [], papers: [], outbox: [], strips: [], calendar: emptyCalendar() });
  }

  startDayCard() {
    const day = this.state.day + 1;
    this.waitTear = true;
    this.queue = [];
    this.set({ day, screen: null });
    this.setCalendar(day - 1);
    this.set((s) => ({ calendar: { ...s.calendar, ready: true } }));
    this.updateBar();
    if (day === 0) this.later(500, () => this.runTutorial({ kind: 'intro', index: 0 }));
  }

  tearCalendar(viaPull = false) {
    if (!this.waitTear) return;
    this.waitTear = false;
    const day = this.state.day;
    if (viaPull) this.set((s) => ({ calendar: { ...s.calendar, ready: false, day } }));
    else {
      this.set((s) => ({ calendar: { ...s.calendar, ready: false } }));
      this.setCalendar(day, true);
    }
    sound.play('tear');
    const sub = DAYS[day].sub;
    if (sub) window.setTimeout(() => this.toast(sub, 3000), 700);
    this.beginDay();
  }

  beginDay() {
    this.queue = this.days[this.state.day].slice();
    this.updateBar();
    this.later(900, () => this.nextDoc());
  }

  updateBar() {
    const s = this.state;
    if (s.day < 0) {
      this.setCalendar(null);
      return;
    }
    if (s.calendar.day === null) this.setCalendar(this.waitTear ? s.day - 1 : s.day);
    this.set({ inbox: Math.min(this.queue.length, 8) });
  }

  setCalendar(d: number | null, tear = false) {
    const cal = this.state.calendar;
    if (d === null) {
      this.set({ calendar: { ...cal, on: false, ready: false, day: null } });
      return;
    }
    if (d === cal.day) {
      if (!cal.on) this.set({ calendar: { ...cal, on: true } });
      return;
    }
    const leaves = cal.leaves.slice();
    if (tear && cal.day !== null) {
      const id = ++this.uid;
      leaves.push({ id, day: cal.day, mode: 'tear' });
      window.setTimeout(() => this.dropLeaf(id), 800);
    }
    this.set({ calendar: { ...cal, on: true, day: d, leaves } });
  }

  private dropLeaf(id: number) {
    this.set((s) => ({ calendar: { ...s.calendar, leaves: s.calendar.leaves.filter((l) => l.id !== id) } }));
  }

  private patchCalendar(patch: Partial<CalendarView>) {
    this.set((s) => ({ calendar: { ...s.calendar, ...patch } }));
  }

  startCalPull(e: PointerLike) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.waitTear || this.calPull) {
      sound.play('tick');
      return;
    }
    this.patchCalendar({ under: this.state.day, pulling: true, spring: false, pull: '' });
    this.calPull = { p0: this.toDesk(e), creak: 0 };
    sound.play('grab');
  }

  private moveCalPull(e: PointerEvent) {
    const pull = this.calPull!;
    const p = this.toDesk(e);
    const dx = p.x - pull.p0.x;
    const dy = p.y - pull.p0.y;
    const dist = Math.hypot(dx, dy);
    this.patchCalendar({
      pull: `rotate(${clamp(dx * 0.22, -26, 26)}deg) translate(${dx * 0.12}px, ${Math.max(0, dy) * 0.22}px)`,
    });
    if (dist > 30 && pull.creak < 1) {
      pull.creak = 1;
      sound.play('tick');
    }
    if (dist > 60 && pull.creak < 2) {
      pull.creak = 2;
      sound.play('tick');
    }
    if (dist > 95) this.tearByPull(dx, dy);
  }

  private endCalPull() {
    if (!this.calPull) return;
    this.calPull = null;
    this.patchCalendar({ spring: true, pull: '', pulling: false });
    window.setTimeout(() => {
      if (!this.calPull) this.patchCalendar({ under: null });
    }, 300);
    sound.play('drop');
  }

  private tearByPull(dx: number, dy: number) {
    this.calPull = null;
    const cal = this.state.calendar;
    const ang = Math.atan2(Math.max(dy, 10), dx);
    const id = ++this.uid;
    const leaf: Leaf = {
      id,
      day: cal.day ?? -1,
      mode: 'fly',
      from: cal.pull,
      to: `translate(${Math.cos(ang) * 280}px, ${Math.sin(ang) * 280 + 140}px) rotate(${dx >= 0 ? 48 : -48}deg)`,
    };
    window.setTimeout(() => this.dropLeaf(id), 650);
    this.patchCalendar({ pull: '', pulling: false, spring: false, under: null, leaves: [...cal.leaves, leaf] });
    this.tearCalendar(true);
  }

  runTutorial(t: Tutorial) {
    this.set({ tutorial: t });
    sound.play('flip');
  }

  tutorialNext(count: number) {
    const t = this.state.tutorial;
    if (!t) return;
    if (t.index + 1 >= count) {
      this.set({ tutorial: null });
      sound.play('clunk');
      return;
    }
    this.set({ tutorial: { ...t, index: t.index + 1 } });
    sound.play('flip');
  }

  toast(msg: string, ms = 3200) {
    this.set({ toast: { msg, show: true } });
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.set((s) => ({ toast: { ...s.toast, show: false } })), ms);
  }

  paper(id: number) {
    return this.state.papers.find((p) => p.id === id);
  }

  private patchPaper(id: number, patch: Partial<PaperView> | ((p: PaperView) => Partial<PaperView>)) {
    this.set((s) => ({
      papers: s.papers.map((p) => (p.id === id ? { ...p, ...(typeof patch === 'function' ? patch(p) : patch) } : p)),
    }));
  }

  private removePaper(id: number) {
    this.info.delete(id);
    this.set((s) => ({ papers: s.papers.filter((p) => p.id !== id) }));
  }

  makePaper(o: { tema: string; titulo: string; texto: string; claro: string; opt?: string }, job: ActiveJob, opt?: Opcion) {
    const id = ++this.uid;
    const num = ++this.docNum;
    const paper: PaperView = {
      id,
      num,
      tema: o.tema,
      titulo: o.titulo,
      texto: o.texto,
      opt: o.opt,
      sello: 4 + Math.floor(Math.random() * 4),
      pose: { x: -360, y: 60, r: rand(-6, 6) },
      base: rand(-2.5, 2.5),
      z: ++this.zTop,
      anim: false,
      dragging: false,
      gone: false,
      locked: false,
    };
    this.info.set(id, { job, opt, claro: o.claro });
    this.set((s) => ({ papers: [...s.papers, paper] }));
    return id;
  }

  moveAnimated(id: number, x: number, y: number, r?: number, s?: number) {
    this.patchPaper(id, { anim: true });
    requestAnimationFrame(() => {
      void this.els.get(id)?.offsetWidth;
      this.patchPaper(id, (p) => ({ pose: { x, y, r: r ?? p.base, s } }));
    });
    window.clearTimeout(this.animTimers.get(id));
    this.animTimers.set(id, window.setTimeout(() => this.patchPaper(id, { anim: false }), 600));
  }

  nextDoc() {
    if (!this.queue.length) {
      this.updateBar();
      this.later(700, () => this.endDay());
      return;
    }
    const job = this.queue.shift()!;
    this.updateBar();
    sound.play('bell');
    this.later(350, () => {
      if (job.type === 'single') {
        const it = job.item;
        const id = this.makePaper(it, { type: 'single', item: it });
        sound.play('slide');
        this.moveAnimated(id, 470 + rand(-20, 20), 120 + rand(-15, 15));
        return;
      }
      const active: ActiveJob = { type: 'dossier', exp: job.exp, remaining: new Set() };
      const opts = shuffle(job.exp.opciones);
      const n = opts.length;
      const span = 760;
      const w = 300;
      const step = n > 1 ? Math.min(230, (span - w) / (n - 1)) : 0;
      const x0 = 250 + (span - (w + step * (n - 1))) / 2;
      opts.forEach((o, i) => {
        this.later(i * 260, () => {
          const id = this.makePaper({ ...o, tema: job.exp.tema, opt: 'ABCD'[i] }, active, o);
          active.remaining.add(id);
          sound.play('slide');
          this.moveAnimated(id, x0 + i * step, 70 + (i % 2) * 40 + rand(-8, 8));
        });
      });
      if (this.firstDossier) {
        this.later(n * 260 + 500, () => this.runTutorial({ kind: 'dossier', index: 0, n, tema: job.exp.tema }));
      }
      this.firstDossier = false;
    });
  }

  private resolve(result: Decision) {
    this.set((s) => ({ results: [...s.results, { ...result, day: s.day } as Result] }));
    this.later(450, () => this.nextDoc());
  }

  private bounce(id: number) {
    const p = this.paper(id)!;
    this.moveAnimated(id, clamp(p.pose.x, 260, 760), clamp(p.pose.y, 40, 300));
  }

  private reject(id: number, msg: string) {
    sound.play('buzz');
    this.toast(msg);
    this.bounce(id);
  }

  sendOut(id: number) {
    const p = this.paper(id);
    const info = this.info.get(id);
    if (!p || !info) return;
    const job = info.job;
    if (!p.verdict) return this.reject(id, 'Ponle un sello antes de mandarlo a DECIDIDAS.');
    if (job.type === 'dossier') {
      if (job.remaining.size > 1) return this.reject(id, 'De un expediente solo sale una propuesta. Tritura las demás primero.');
      if (p.verdict !== 'ok') return this.reject(id, 'Lo que sale de un expediente tiene que ir aprobado (✓). Vuelve a sellarlo.');
    }
    sound.play('whoosh');
    this.patchPaper(id, { locked: true, gone: true });
    this.moveAnimated(id, 0, 470, rand(-6, 6), 0.42);
    window.setTimeout(() => {
      this.removePaper(id);
      this.set((s) => {
        const sheet = { id: ++this.uid, top: Math.max(0, 40 - s.outbox.length * 2), r: rand(-5, 5) };
        return { outbox: [...s.outbox, sheet].slice(-14) };
      });
    }, 420);
    if (job.type === 'single') this.resolve({ type: 'single', item: job.item, verdict: p.verdict });
    else this.resolve({ type: 'dossier', exp: job.exp, chosen: info.opt!.partido });
  }

  shred(id: number) {
    const info = this.info.get(id);
    const el = this.els.get(id);
    if (!info || !el) return;
    const job = info.job;
    if (job.type === 'dossier' && job.remaining.size <= 1) return this.reject(id, 'Tienes que salvar una propuesta del expediente.');
    const k = SHRED.width / el.offsetWidth;
    const h = el.offsetHeight * k;
    window.clearTimeout(this.animTimers.get(id));
    this.patchPaper(id, {
      locked: true,
      note: undefined,
      anim: true,
      feed: { k, h, inside: false },
      pose: { x: SHRED.mouthX + 4, y: SHRED.slotY - h, r: 0, s: k },
    });
    sound.play('grab');

    window.setTimeout(() => {
      this.patchPaper(id, { anim: false, feed: { k, h, inside: true } });
      sound.play('shred');
      this.set({ shredBusy: true });
      window.clearTimeout(this.shredTimer);
      this.shredTimer = window.setTimeout(() => this.set({ shredBusy: false }), 1350);
      window.setTimeout(() => this.removePaper(id), 1200);
    }, 300);

    for (let i = 0; i < 18; i++) {
      this.later(420 + i * 60, () => this.addStrip());
    }

    if (job.type === 'single') {
      this.resolve({ type: 'single', item: job.item, verdict: 'skip' });
      if (this.firstSkip) {
        this.firstSkip = false;
        window.setTimeout(() => this.toast('Triturada: no lo tienes claro. No cuenta para tu resultado.', 3600), 300);
      }
      return;
    }
    job.remaining.delete(id);
    if (job.remaining.size === 1) {
      const last = this.paper([...job.remaining][0]);
      if (last?.verdict !== 'ok') window.setTimeout(() => this.toast('Queda una. Ponle el ✓ y llévala a DECIDIDAS.'), 900);
    }
  }

  addStrip() {
    const x = rand(8, 160);
    const strip: Strip = { id: ++this.uid, x, x2: x + rand(-14, 14), y2: rand(62, 90), r: rand(-70, 70), dur: rand(380, 560) };
    this.set((s) => ({ strips: [...s.strips, strip].slice(-160) }));
  }

  private toolOf(s: GameState, t: Exclude<DragTarget, { kind: 'paper' }>): Tool {
    if (t.kind === 'stamp') return s.stamps[t.which];
    if (t.kind === 'lupa') return s.lupa;
    return s.props[t.which];
  }

  private patchTool(t: Exclude<DragTarget, { kind: 'paper' }>, patch: Partial<Tool>) {
    this.set((s) => {
      const next = { ...this.toolOf(s, t), ...patch };
      if (t.kind === 'stamp') return { stamps: { ...s.stamps, [t.which]: next } };
      if (t.kind === 'lupa') return { lupa: next };
      return { props: { ...s.props, [t.which]: next } };
    });
  }

  stampHome(which: Kind, animate = true) {
    this.patchTool({ kind: 'stamp', which }, { pose: { ...STAMP_HOME[which] }, home: animate });
    if (animate) window.setTimeout(() => this.patchTool({ kind: 'stamp', which }, { home: false }), 300);
  }

  lupaHome(animate = true) {
    this.patchTool({ kind: 'lupa' }, { pose: { ...LUPA_HOME }, home: animate });
    if (animate) window.setTimeout(() => this.patchTool({ kind: 'lupa' }, { home: false }), 320);
  }

  propsHome() {
    this.set({ props: { mug: tool(PROPS_HOME.mug), pen: tool(PROPS_HOME.pen) } });
  }

  paperAt(p: Point): PaperView | null {
    let best: PaperView | null = null;
    for (const paper of this.state.papers) {
      const el = this.els.get(paper.id);
      if (paper.locked || !el) continue;
      const { x, y } = paper.pose;
      if (p.x >= x && p.x <= x + el.offsetWidth && p.y >= y && p.y <= y + el.offsetHeight) {
        if (!best || paper.z > best.z) best = paper;
      }
    }
    return best;
  }

  applyLupa(p: Point) {
    const paper = this.paperAt(p);
    window.setTimeout(() => this.lupaHome(), 120);
    const claro = paper && this.info.get(paper.id)?.claro;
    if (!paper || !claro) {
      sound.play('drop');
      return;
    }
    const note: Note = {
      key: ++this.uid,
      r: rand(-4, 4),
      text: claro,
      left: paper.pose.x < 560 ? 282 : -222,
      top: clamp(p.y - paper.pose.y - 40, 40, 160),
    };
    this.patchPaper(paper.id, { note, z: ++this.zTop });
    sound.play('stick');
  }

  removeNote(id: number) {
    sound.play('grab');
    this.patchPaper(id, { note: undefined });
  }

  applyStamp(which: Kind, p: Point) {
    const t = { kind: 'stamp', which } as const;
    const paper = this.paperAt(p);
    this.patchTool(t, { press: true });
    window.setTimeout(() => this.patchTool(t, { press: false }), 220);
    if (!paper) {
      sound.play('clunk');
      window.setTimeout(() => this.stampHome(which), 200);
      return;
    }
    const el = this.els.get(paper.id)!;
    window.setTimeout(() => {
      sound.play('stamp');
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const mark: Mark = {
        key: ++this.uid,
        kind: which,
        r: rand(-12, 8),
        left: clamp(p.x - paper.pose.x - 46, -10, w - 82),
        top: clamp(p.y - paper.pose.y - 46, 10, h - 90),
      };
      this.patchPaper(paper.id, { mark, verdict: which, z: ++this.zTop });
    }, 70);
    window.setTimeout(() => this.stampHome(which), 260);
  }

  startDrag(e: PointerLike, target: DragTarget) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (this.drag) {
      const prev = this.drag.target;
      this.drag = null;
      if (prev.kind === 'paper') this.patchPaper(prev.id, { dragging: false });
      else this.patchTool(prev, { dragging: false });
      if (prev.kind === 'stamp') this.stampHome(prev.which);
      if (prev.kind === 'lupa') this.lupaHome();
    }
    const p = this.toDesk(e);
    if (target.kind === 'paper') {
      const paper = this.paper(target.id);
      if (!paper) return;
      window.clearTimeout(this.animTimers.get(target.id));
      this.patchPaper(target.id, { anim: false, dragging: true, z: ++this.zTop });
      this.drag = { target, ox: p.x - paper.pose.x, oy: p.y - paper.pose.y, lx: p.x, vx: 0 };
      sound.play('grab');
      return;
    }
    const cur = this.toolOf(this.state, target);
    if (target.kind === 'prop') {
      this.patchTool(target, { home: false, dragging: true });
      this.drag = { target, ox: p.x - cur.pose.x, oy: p.y - cur.pose.y, lx: p.x, vx: 0 };
      sound.play(target.which === 'mug' ? 'clink' : 'grab');
      return;
    }
    const [ox, oy] = target.kind === 'lupa' ? [42, 42] : [75, 72];
    this.patchTool(target, { home: false, dragging: true, pose: { ...cur.pose, x: p.x - ox, y: p.y - oy } });
    this.drag = { target, ox, oy, lx: p.x, vx: 0 };
    sound.play('grab');
  }

  onPointerMove = (e: PointerEvent) => {
    if (this.calPull) this.moveCalPull(e);
    const d = this.drag;
    if (!d) return;
    const p = this.toDesk(e);
    d.vx = d.vx * 0.7 + (p.x - d.lx) * 0.3;
    d.lx = p.x;
    const x = clamp(p.x - d.ox, -140, 1200);
    const y = clamp(p.y - d.oy, -60, 620);
    const t = d.target;
    if (t.kind !== 'paper') {
      this.patchTool(t, { pose: { ...this.toolOf(this.state, t).pose, x, y } });
      return;
    }
    const shred = inZone(p, ZONES.shred);
    const out = inZone(p, ZONES.out);
    this.set((s) => ({
      papers: s.papers.map((pp) =>
        pp.id === t.id ? { ...pp, pose: { ...pp.pose, x, y, r: pp.base + clamp(d.vx * 0.6, -9, 9) } } : pp,
      ),
      hot: s.hot.shred === shred && s.hot.out === out ? s.hot : { shred, out },
    }));
  };

  onPointerUp = (e: PointerEvent) => {
    this.endCalPull();
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    const t = d.target;
    this.set({ hot: { shred: false, out: false } });
    const p = this.toDesk(e);
    if (t.kind !== 'paper') {
      this.patchTool(t, { dragging: false });
      if (t.kind === 'stamp') return this.applyStamp(t.which, p);
      if (t.kind === 'lupa') return this.applyLupa(p);
      sound.play(t.which === 'mug' ? 'clink' : 'drop');
      return;
    }
    this.patchPaper(t.id, (pp) => ({ dragging: false, pose: { ...pp.pose, r: pp.base } }));
    if (inZone(p, ZONES.shred)) return this.shred(t.id);
    if (inZone(p, ZONES.out)) return this.sendOut(t.id);
    sound.play('drop');
  };

  endDay() {
    this.set({ screen: 'paper' });
    sound.play('flip');
  }

  nextDay() {
    sound.play('clunk');
    if (this.state.day >= DAYS.length - 1) this.showEnd();
    else this.startDayCard();
  }

  showEnd() {
    this.set((s) => ({ screen: 'end', endRun: s.endRun + 1 }));
    sound.play('flip');
  }

  playAgain() {
    sound.play('clunk');
    this.newGame();
    this.startDayCard();
  }

  openPause() {
    this.set({ pause: 'menu' });
    sound.play('flip');
  }

  closePause() {
    this.creditsFromTitle = false;
    this.set({ pause: null });
    sound.play('clunk');
  }

  togglePause() {
    if (this.state.pause) this.closePause();
    else this.openPause();
  }

  showCredits(on: boolean) {
    this.set({ pause: on ? 'credits' : 'menu' });
    sound.play('flip');
  }

  creditsFromTitleScreen() {
    sound.init();
    this.creditsFromTitle = true;
    this.showCredits(true);
  }

  creditsBack() {
    if (this.creditsFromTitle) this.closePause();
    else this.showCredits(false);
  }

  setMuted(muted: boolean) {
    sound.muted = muted;
    this.set({ muted });
  }

  replayTutorial() {
    const s = this.state;
    this.set({ pause: null });
    if (s.day >= 0 && s.screen === null) {
      this.runTutorial({ kind: 'intro', index: 0 });
      return;
    }
    this.goHome();
    sound.init();
    this.newGame();
    this.startDayCard();
  }

  goHome() {
    this.gen++;
    this.drag = null;
    this.calPull = null;
    this.waitTear = false;
    this.queue = [];
    this.info.clear();
    this.creditsFromTitle = false;
    this.set({
      day: -1,
      inbox: 0,
      papers: [],
      outbox: [],
      strips: [],
      tutorial: null,
      pause: null,
      hot: { shred: false, out: false },
      toast: { ...this.state.toast, show: false },
      stamps: { ok: tool(STAMP_HOME.ok), no: tool(STAMP_HOME.no) },
      lupa: tool(LUPA_HOME),
      calendar: emptyCalendar(),
      screen: 'title',
    });
    this.propsHome();
    sound.play('clunk');
  }
}

export const game = new Game();
