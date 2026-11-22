import { EXPEDIENTES } from '../data/expedientes';
import { SUELTAS } from '../data/sueltas';
import { DAYS } from './constants';
import type { Job } from './types';
import { shuffle } from './util';

export function planWeek(): Job[][] {
  const sueltas = shuffle(SUELTAS);
  const exps = shuffle(EXPEDIENTES);
  const n = DAYS.length;
  const first = Math.min(4, sueltas.length);
  const rest = sueltas.length - first;
  const days: Job[][] = [];
  let idx = 0;
  for (let d = 0; d < n; d++) {
    const size = d === 0 ? first : Math.floor(rest / (n - 1)) + (d - 1 < rest % (n - 1) ? 1 : 0);
    const items: Job[] = sueltas.slice(idx, idx + size).map((item) => ({ type: 'single', item }));
    idx += size;
    if (exps[d]) {
      const pos = d === 0 ? items.length : 1 + Math.floor(Math.random() * items.length);
      items.splice(pos, 0, { type: 'dossier', exp: exps[d] });
    }
    days.push(items);
  }
  exps.slice(n).forEach((exp) => days[n - 1].push({ type: 'dossier', exp }));
  return days;
}
