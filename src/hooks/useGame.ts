import { useSyncExternalStore } from 'react';
import { game, type GameState } from '../game/engine';

export function useGame<R>(select: (s: GameState) => R): R {
  return useSyncExternalStore(game.store.subscribe, () => select(game.store.get()));
}
