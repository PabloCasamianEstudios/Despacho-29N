import type { Pose } from './types';

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const DESK_TOP = 44;

export const DAYS = [
  { fecha: 'Lunes, 23 de noviembre', sub: 'Primer día en el despacho.' },
  { fecha: 'Martes, 24 de noviembre', sub: '' },
  { fecha: 'Miércoles, 25 de noviembre', sub: '' },
  { fecha: 'Jueves, 26 de noviembre', sub: '' },
  { fecha: 'Viernes, 27 de noviembre', sub: 'Último día de campaña.' },
  { fecha: 'Sábado, 28 de noviembre', sub: 'Jornada de reflexión. Los últimos papeles antes de las urnas.' },
];

export const EVE = 'Domingo, 22 de noviembre';

export const STAMP_HOME: Record<'ok' | 'no', Pose> = {
  ok: { x: 1090, y: 412, r: 0 },
  no: { x: 1090, y: 542, r: 0 },
};

export const LUPA_HOME: Pose = { x: 700, y: 548, r: 0 };

export const PROPS_HOME: Record<'mug' | 'pen', Pose> = {
  mug: { x: 900, y: 8, r: 0 },
  pen: { x: 262, y: 612, r: -8 },
};

export const ZONES = {
  shred: { x1: 1050, y1: 0, x2: 1280, y2: 405 },
  out: { x1: 0, y1: 455, x2: 240, y2: 676 },
};

export const SHRED = { slotY: 180, mouthX: 1080, mouthTop: -44, width: 156 };

export const DISCORD_URL = 'https://discord.gg/WwGSacHA8d';
