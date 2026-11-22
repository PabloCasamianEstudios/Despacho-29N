import type { Pose } from './types';

export const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const poseTransform = ({ x, y, r, s }: Pose) =>
  `translate(${x}px, ${y}px) rotate(${r}deg)` + (s ? ` scale(${s})` : '');

export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');
