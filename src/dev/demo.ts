import { EXPEDIENTES } from '../data/expedientes';
import { SUELTAS } from '../data/sueltas';
import { game } from '../game/engine';
import type { Result } from '../game/types';

const params = new URLSearchParams(location.search);
const item = (id: string) => SUELTAS.find((x) => x.id === id)!;
const exp = (id: string) => EXPEDIENTES.find((x) => x.id === id)!;
const strips = (n: number) => {
  for (let i = 0; i < n; i++) game.addStrip();
};
const outbox = (n: number) =>
  game.store.set((s) => ({
    outbox: [...s.outbox, ...Array.from({ length: n }, (_, i) => ({ id: 1e6 + i, top: 40 - i * 2, r: Math.random() * 10 - 5 }))],
  }));

function freeze() {
  game.endDay = () => {};
  game.beginDay = () => {
    game.queue = [];
  };
  game.firstDossier = false;
}

function toTable() {
  game.newGame();
  game.store.set({ day: 0, screen: null });
  game.queue = game.days[0].slice();
  game.updateBar();
}

const modes: Record<string, () => void> = {
  arrancar() {
    game.newGame();
    game.startDayCard();
  },
  tuto() {
    const original = game.runTutorial.bind(game);
    game.runTutorial = () => {};
    freeze();
    game.newGame();
    game.startDayCard();
    game.runTutorial = original;
    window.setTimeout(() => game.runTutorial({ kind: 'intro', index: Number(params.get('step') || 0) }), 900);
  },
  mesa() {
    toTable();
    strips(40);
    outbox(6);
    game.queue.unshift({ type: 'single', item: item('ppvox-cgpj') });
    game.nextDoc();
    window.setTimeout(() => {
      const p = game.state.papers.at(-1)!;
      game.applyLupa({ x: p.pose.x + 150, y: p.pose.y + 120 });
    }, 1400);
  },
  triturar() {
    toTable();
    game.queue = [{ type: 'single', item: item('vox-evau') }];
    game.nextDoc();
    window.setTimeout(() => game.shred(game.state.papers.at(-1)!.id), 1400);
  },
  expediente() {
    freeze();
    toTable();
    strips(25);
    outbox(9);
    game.queue = [{ type: 'dossier', exp: exp('exp-energia') }];
    game.nextDoc();
    window.setTimeout(() => {
      const last = game.state.papers.at(-1)!;
      game.applyStamp('ok', { x: last.pose.x + 150, y: last.pose.y + 200 });
    }, 2200);
  },
  periodico() {
    toTable();
    const results: Result[] = [
      { type: 'dossier', exp: exp('exp-vivienda'), chosen: 'psoe', day: 0 },
      { type: 'single', item: item('psoe-psicologo'), verdict: 'ok', day: 0 },
      { type: 'single', item: item('ppvox-indultos'), verdict: 'ok', day: 0 },
      { type: 'single', item: item('fa-tren'), verdict: 'ok', day: 0 },
      { type: 'single', item: item('vox-zbe'), verdict: 'no', day: 0 },
      { type: 'single', item: item('pp-prorroga'), verdict: 'skip', day: 0 },
    ];
    game.store.set({ results });
    game.endDay();
  },
  final() {
    toTable();
    const verdicts = ['ok', 'ok', 'no', 'ok', 'skip', 'no'] as const;
    const chosen = ['psoe', 'fa', 'pp', 'psoe', 'fa', 'vox'] as const;
    const results: Result[] = [
      ...SUELTAS.map((it, i): Result => ({ type: 'single', item: it, verdict: verdicts[i % 6], day: (i + 1) % 6 })),
      ...EXPEDIENTES.map((e, j): Result => ({ type: 'dossier', exp: e, chosen: chosen[j], day: j })),
    ];
    game.store.set({ results, day: 5 });
    game.showEnd();
  },
};

export function runDemo() {
  Object.assign(window, { __game: game });
  const mode = params.get('demo');
  if (!mode || mode === 'intro') return;
  game.setIntroGone();
  const intro = document.getElementById('intro');
  if (intro) intro.style.display = 'none';
  modes[mode]?.();
}
