import { forwardRef } from 'react';
import { PARTIDOS } from '../../data/partidos';
import { DAYS } from '../../game/constants';
import type { PartidoId, Result } from '../../game/types';

const VERDICT = { ok: 'APROBADA', no: 'RECHAZADA', skip: 'EN BLANCO' } as const;

function Chip({ k }: { k: PartidoId }) {
  return (
    <span className="chip" style={{ background: PARTIDOS[k].color }}>
      {PARTIDOS[k].nombre}
    </span>
  );
}

function Rows({ r }: { r: Result }) {
  if (r.type === 'single') {
    return (
      <div className="row">
        <div>
          {r.item.titulo}
          <span className="sub">{r.item.texto}</span>
        </div>
        <span className={`verdict ${r.verdict}`}>{VERDICT[r.verdict]}</span>
        <span>
          {r.item.partidos.map((k) => (
            <Chip key={k} k={k} />
          ))}
        </span>
      </div>
    );
  }
  return (
    <>
      {r.exp.opciones.map((o) => {
        const kept = o.partido === r.chosen;
        return (
          <div className="row" key={o.partido}>
            <div>
              {kept ? '★ ' : ''}
              {o.titulo}
              <span className="sub">Expediente {r.exp.tema}</span>
            </div>
            <span className={`verdict ${kept ? 'ok' : 'no'}`}>{kept ? 'SALVADA' : 'TRITURADA'}</span>
            <span>
              <Chip k={o.partido} />
            </span>
          </div>
        );
      })}
    </>
  );
}

export const RevealList = forwardRef<HTMLDivElement, { results: Result[]; hidden: boolean }>(function RevealList(
  { results, hidden },
  ref,
) {
  return (
    <div id="end-list" ref={ref} className={hidden ? 'hidden' : undefined}>
      {DAYS.map((d, i) => {
        const res = results.filter((r) => r.day === i);
        if (!res.length) return null;
        return (
          <div key={i}>
            <h4>{d.fecha.toUpperCase()}</h4>
            {res.map((r, j) => (
              <Rows key={j} r={r} />
            ))}
          </div>
        );
      })}
    </div>
  );
});
