export type PartidoId = 'pp' | 'psoe' | 'vox' | 'fa';

export type Eje = [number, number];

export interface Partido {
  nombre: string;
  color: string;
}

export interface Propuesta {
  id: string;
  eje: Eje;
  tema: string;
  partidos: PartidoId[];
  titulo: string;
  texto: string;
  claro: string;
}

export interface Opcion {
  partido: PartidoId;
  eje: Eje;
  titulo: string;
  texto: string;
  claro: string;
}

export interface Expediente {
  id: string;
  tema: string;
  opciones: Opcion[];
}

export type Verdict = 'ok' | 'no' | 'skip';
export type Kind = 'ok' | 'no';

export type Job =
  | { type: 'single'; item: Propuesta }
  | { type: 'dossier'; exp: Expediente };

export type Result =
  | { type: 'single'; item: Propuesta; verdict: Verdict; day: number }
  | { type: 'dossier'; exp: Expediente; chosen: PartidoId; day: number };

export interface Point {
  x: number;
  y: number;
}

export interface Pose {
  x: number;
  y: number;
  r: number;
  s?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
