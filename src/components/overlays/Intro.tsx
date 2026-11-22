import { useCallback, useEffect, useRef, useState } from 'react';
import { game } from '../../game/engine';
import { cx } from '../../game/util';

const LINES = [
  ['La política no debería separar al pueblo.'],
  ['No es algo de izquierda contra derecha,', 'son los de arriba contra los de abajo.'],
];

export function Intro() {
  const [shown, setShown] = useState(false);
  const [gone, setGone] = useState(false);
  const timers = useRef<number[]>([]);

  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const leave = useCallback(() => {
    setGone(true);
    game.setIntroGone();
  }, []);

  useEffect(() => {
    at(700, () => setShown(true));
    at(9200, () => setShown(false));
    at(11600, leave);
    return clear;
  }, [leave]);

  const skip = () => {
    if (gone) return;
    clear();
    setShown(false);
    at(900, leave);
  };

  return (
    <div id="intro" className={cx(gone && 'gone')} onClick={skip}>
      <div id="intro-text" className={cx(shown && 'show')}>
        {LINES.map((parts, i) => (
          <span className="line" key={i}>
            {parts.map((p, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {p}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
