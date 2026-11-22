import { useRef } from 'react';
import { game } from '../../game/engine';
import { DAYS } from '../../game/constants';
import type { Result } from '../../game/types';
import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';

interface Headline {
  k: string;
  t: string;
}

function Edition({ results }: { results: Result[] }) {
  const heads: Headline[] = [];
  const no: string[] = [];
  const skip: string[] = [];
  for (const r of results) {
    if (r.type === 'dossier') {
      const o = r.exp.opciones.find((x) => x.partido === r.chosen)!;
      heads.push({ k: `EXPEDIENTE ${r.exp.tema.toUpperCase()}`, t: o.titulo });
    }
  }
  for (const r of results) {
    if (r.type !== 'single') continue;
    if (r.verdict === 'ok') heads.push({ k: r.item.tema.toUpperCase(), t: r.item.titulo });
    if (r.verdict === 'no') no.push(r.item.titulo);
    if (r.verdict === 'skip') skip.push(r.item.titulo);
  }
  const [lead, ...others] = heads;
  return (
    <>
      {lead ? (
        <>
          <div className="np-k">{lead.k}</div>
          <div className="np-lead">{lead.t}</div>
          {others.length > 0 && (
            <div className="np-cols">
              {others.map((h, i) => (
                <div key={i}>
                  <div className="np-k">{h.k}</div>
                  <div className="np-h">{h.t}</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="np-k">ÚLTIMA HORA</div>
          <div className="np-lead">El despacho no aprueba nada en toda la jornada</div>
        </>
      )}
      {no.length > 0 && (
        <div className="np-small">
          <b>Rechazadas:</b> {no.join(' · ')}.
        </div>
      )}
      {skip.length > 0 && (
        <div className="np-small">
          <b>A la trituradora, sin decidir:</b> {skip.join(' · ')}.
        </div>
      )}
    </>
  );
}

export function NewspaperScreen({ active }: { active: boolean }) {
  const current = useGame((s) => s.day);
  const shown = useRef(current);
  if (active) shown.current = current;
  const day = shown.current;
  const results = useGame((s) => s.results);
  const today = day >= 0 ? results.filter((r) => r.day === day) : [];
  const last = day === DAYS.length - 1;
  return (
    <div id="screen-paper" className={cx('screen', !active && 'hidden')}>
      <div className="newspaper">
        <div className="np-head">
          <div className="np-meta">
            <span id="np-date">{day >= 0 ? DAYS[day].fecha : ''}</span>
            <span>Edición única</span>
          </div>
          <div className="np-name">EL DIARIO DEL DESPACHO</div>
        </div>
        <div id="np-body"><Edition results={today} /></div>
        <button className="big dark" id="btn-next" onClick={() => game.nextDay()}>
          {last ? 'IR A VOTAR' : 'SIGUIENTE JORNADA'}
        </button>
      </div>
    </div>
  );
}
