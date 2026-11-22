import { useEffect, useMemo, useRef, useState } from 'react';
import { PARTIDOS } from '../../data/partidos';
import { game } from '../../game/engine';
import { scores } from '../../game/scoring';
import { sound } from '../../game/sound';
import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';
import { IconClose } from '../Icons';
import { Compass } from './Compass';
import { RevealList } from './RevealList';

function useRevealSequence(run: number, parties: number) {
  const [bars, setBars] = useState(0);
  const [dots, setDots] = useState(0);
  const [you, setYou] = useState(false);

  useEffect(() => {
    setBars(0);
    setDots(0);
    setYou(false);
    if (!run) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    for (let i = 0; i < parties; i++) {
      at(600 + i * 350, () => {
        setBars(i + 1);
        sound.play('tick');
      });
    }
    const tBars = 600 + parties * 350 + 400;
    at(tBars, () => sound.play('bell'));
    for (let i = 0; i < parties; i++) {
      at(tBars + 500 + i * 250, () => {
        setDots(i + 1);
        sound.play('tick');
      });
    }
    at(tBars + 500 + parties * 250 + 300, () => {
      setYou(true);
      sound.play('stamp');
    });
    return () => timers.forEach(clearTimeout);
  }, [run, parties]);

  return { bars, dots, you };
}

export function EndScreen({ active }: { active: boolean }) {
  const live = useGame((s) => s.results);
  const kept = useRef(live);
  if (active) kept.current = live;
  const results = kept.current;
  const run = useGame((s) => s.endRun);
  const sc = useMemo(() => scores(results), [results]);
  const { bars, dots, you } = useRevealSequence(run, sc.length);
  const [revealed, setRevealed] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRevealed(false);
    reportRef.current?.scrollTo({ top: 0 });
  }, [run]);

  useEffect(() => {
    if (!revealed) return;
    const rep = reportRef.current;
    const list = listRef.current;
    if (!rep || !list) return;
    const scale = rep.getBoundingClientRect().width / rep.offsetWidth;
    const dy = (list.getBoundingClientRect().top - rep.getBoundingClientRect().top) / scale;
    rep.scrollTo({ top: rep.scrollTop + dy - 16, behavior: 'smooth' });
  }, [revealed]);

  const top = sc.filter((s) => s.pct === sc[0].pct);

  return (
    <div id="screen-end" className={cx('screen', !active && 'hidden')}>
      <button id="end-x" title="Volver al inicio" aria-label="Volver al inicio" onClick={() => game.goHome()}>
        <IconClose />
      </button>
      <div className="report" ref={reportRef}>
        <h2 id="end-title">{top.length > 1 ? 'Empate técnico en tu despacho:' : 'Tu despacho se parece a…'}</h2>
        <div id="end-winner">
          {top.map((s, i) => (
            <span key={s.k}>
              {i > 0 && ' · '}
              <span style={{ color: PARTIDOS[s.k].color }}>{PARTIDOS[s.k].nombre}</span>
            </span>
          ))}
        </div>
        <div id="end-bars">
          {sc.map((s, i) => (
            <div className="bar-row" key={s.k}>
              <div>
                {PARTIDOS[s.k].nombre}
                <small>
                  {s.pts} de {s.ap} propuestas
                </small>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  data-w={s.pct}
                  style={{ background: PARTIDOS[s.k].color, width: i < bars ? `${s.pct}%` : undefined }}
                />
              </div>
              <div>{s.pct}%</div>
            </div>
          ))}
        </div>
        <Compass results={results} partiesShown={dots} youShown={you} />
        <div className="end-btns">
          {!revealed && (
            <button
              className="big"
              id="btn-reveal"
              onClick={() => {
                sound.play('flip');
                setRevealed(true);
              }}
            >
              ¿QUIÉN PROPONÍA CADA COSA?
            </button>
          )}
          <button className="big ghost" id="btn-again" onClick={() => game.playAgain()}>
            JUGAR OTRA VEZ
          </button>
        </div>
        <RevealList ref={listRef} results={results} hidden={!revealed} />
        <p className="fine">
          El porcentaje es la parte de las propuestas de cada partido que aprobaste. En los expedientes solo cuenta la que
          salvaste. Las medidas están resumidas de los programas oficiales (consultados el 20/11/2026); para el detalle,
          léelos enteros. Esto no es una recomendación de voto.
        </p>
      </div>
    </div>
  );
}
