import type { Partido, PartidoId } from '../game/types';

export const PARTIDOS: Record<PartidoId, Partido> = {
  pp:   { nombre: "PP",            color: "#1d84ce" },
  psoe: { nombre: "PSOE",          color: "#e30613" },
  vox:  { nombre: "Vox",           color: "#4f9a1a" },
  fa:   { nombre: "Frente Amplio", color: "#c2185b" }
};
