import { useEffect } from 'react';
import { game } from '../game/engine';
import { sound } from '../game/sound';

const IGNORED_KEYS = ['Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta'];

export function useGameInput() {
  useEffect(() => {
    const unlockAudio = () => sound.init();

    const startFromTitle = (e: KeyboardEvent) => {
      if (!game.onTitle() || e.repeat || IGNORED_KEYS.includes(e.key)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      game.startGame();
    };

    const shortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'm') game.setMuted(!game.state.muted);
      if (e.key === 'Escape' || (key === 'p' && !game.onTitle())) game.togglePause();
    };

    document.addEventListener('pointerdown', unlockAudio, { capture: true });
    window.addEventListener('keydown', startFromTitle, true);
    window.addEventListener('keydown', shortcuts);
    window.addEventListener('pointermove', game.onPointerMove);
    window.addEventListener('pointerup', game.onPointerUp);
    window.addEventListener('pointercancel', game.onPointerUp);
    return () => {
      document.removeEventListener('pointerdown', unlockAudio, { capture: true });
      window.removeEventListener('keydown', startFromTitle, true);
      window.removeEventListener('keydown', shortcuts);
      window.removeEventListener('pointermove', game.onPointerMove);
      window.removeEventListener('pointerup', game.onPointerUp);
      window.removeEventListener('pointercancel', game.onPointerUp);
    };
  }, []);
}
