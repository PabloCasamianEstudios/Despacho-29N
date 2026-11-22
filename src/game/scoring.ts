import { EXPEDIENTES } from '../data/expedientes';
import { PARTIDOS } from '../data/partidos';
import { SUELTAS } from '../data/sueltas';
import type { Eje, PartidoId, Point, Result } from './types';

export interface Score {
  k: PartidoId;
  pts: number;
  ap: number;
  pct: number;
}

export const PARTY_IDS = Object.keys(PARTIDOS) as PartidoId[];

const perParty = <T,>(make: () => T) =>
  Object.fromEntries(PARTY_IDS.map((k) => [k, make()])) as Record<PartidoId, T>;

export function scores(results: Result[]): Score[] {
  const sc = perParty(() => ({ pts: 0, ap: 0 }));
  for (const r of results) {
    if (r.type === 'single') {
      if (r.verdict === 'skip') continue;
      for (const k of r.item.partidos) {
        sc[k].ap++;
        if (r.verdict === 'ok') sc[k].pts++;
      }
    } else {
      for (const o of r.exp.opciones) {
        sc[o.partido].ap++;
        if (o.partido === r.chosen) sc[o.partido].pts++;
      }
    }
  }
  return PARTY_IDS
    .map((k) => ({ k, ...sc[k], pct: sc[k].ap ? Math.round((sc[k].pts / sc[k].ap) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct || b.pts - a.pts);
}

export function playerCompass(results: Result[]): Point {
  let se = 0, we = 0, sa = 0, wa = 0;
  const add = (eje: Eje, sign: number, w = 1) => {
    se += sign * eje[0] * w;
    we += Math.abs(eje[0]) * w;
    sa += sign * eje[1] * w;
    wa += Math.abs(eje[1]) * w;
  };
  for (const r of results) {
    if (r.type === 'single') {
      if (r.verdict !== 'skip') add(r.item.eje, r.verdict === 'ok' ? 1 : -1);
    } else {
      const n = r.exp.opciones.length;
      for (const o of r.exp.opciones) {
        if (o.partido === r.chosen) add(o.eje, 1);
        else add(o.eje, -1, 1 / (n - 1));
      }
    }
  }
  return { x: we ? se / we : 0, y: wa ? sa / wa : 0 };
}

export function partyCompass(): Record<PartidoId, Point> {
  const acc = perParty(() => ({ se: 0, ne: 0, sa: 0, na: 0 }));
  const add = (k: PartidoId, eje: Eje) => {
    if (eje[0]) {
      acc[k].se += eje[0];
      acc[k].ne++;
    }
    if (eje[1]) {
      acc[k].sa += eje[1];
      acc[k].na++;
    }
  };
  SUELTAS.forEach((it) => it.partidos.forEach((k) => add(k, it.eje)));
  EXPEDIENTES.forEach((e) => e.opciones.forEach((o) => add(o.partido, o.eje)));
  return Object.fromEntries(
    PARTY_IDS.map((k) => {
      const v = acc[k];
      return [k, { x: v.ne ? v.se / v.ne : 0, y: v.na ? v.sa / v.na : 0 }];
    }),
  ) as Record<PartidoId, Point>;
}

export function quadrantName(p: Point): string {
  if (Math.abs(p.x) < 0.15 && Math.abs(p.y) < 0.15) return 'Centro';
  const eco = Math.abs(p.x) < 0.15 ? 'Centro' : p.x < 0 ? 'Izquierda' : 'Derecha';
  const center = eco === 'Centro';
  const soc = Math.abs(p.y) < 0.15
    ? ''
    : p.y > 0
      ? center ? 'autoritario' : 'autoritaria'
      : center ? 'libertario' : 'libertaria';
  return `${eco} ${soc}`.trim();
}
