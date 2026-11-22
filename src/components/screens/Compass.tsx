import { PARTIDOS } from '../../data/partidos';
import { partyCompass, PARTY_IDS, playerCompass, quadrantName } from '../../game/scoring';
import type { Result } from '../../game/types';
import { clamp, cx } from '../../game/util';

const FONT = 'Zilla Slab, Georgia, serif';
const X = (v: number) => 190 + clamp(v, -1, 1) * 160;
const Y = (v: number) => 190 - clamp(v, -1, 1) * 160;
const GRID = [70, 110, 150, 230, 270, 310];
const PARTIES = partyCompass();

function AxisLabel({ x, y, anchor = 'middle', children }: { x: number; y: number; anchor?: 'start' | 'middle' | 'end'; children: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill="#d8cbb3" fontFamily={FONT} fontSize="12" fontWeight="bold">
      {children}
    </text>
  );
}

function partyDots() {
  const placed: { x: number; y: number }[] = [];
  return PARTY_IDS.map((k) => {
    const p = PARTIES[k];
    const cx = X(p.x);
    const cy = Y(p.y);
    const clash = placed.some((q) => Math.abs(q.x - cx) < 70 && Math.abs(q.y - cy) < 16);
    const left = clash ? !(p.x > 0.55) : p.x > 0.55;
    const ly = cy + 4 + (clash ? 14 : 0);
    placed.push({ x: cx, y: ly });
    return { k, cx, cy, ly, left };
  });
}

export function Compass({ results, partiesShown, youShown }: { results: Result[]; partiesShown: number; youShown: boolean }) {
  const me = playerCompass(results);
  return (
    <div id="end-compass">
      <svg viewBox="0 0 380 380" role="img" aria-label="Brújula política">
        <rect x="30" y="30" width="160" height="160" fill="#f2b8b5" />
        <rect x="190" y="30" width="160" height="160" fill="#9fd5f2" />
        <rect x="30" y="190" width="160" height="160" fill="#c8e3bd" />
        <rect x="190" y="190" width="160" height="160" fill="#f3efa8" />
        <g opacity=".18" stroke="#16120f">
          {GRID.map((v) => (
            <g key={v}>
              <line x1={v} y1="30" x2={v} y2="350" />
              <line x1="30" y1={v} x2="350" y2={v} />
            </g>
          ))}
        </g>
        <line x1="30" y1="190" x2="350" y2="190" stroke="#16120f" strokeWidth="2.5" />
        <line x1="190" y1="30" x2="190" y2="350" stroke="#16120f" strokeWidth="2.5" />
        <AxisLabel x={190} y={22}>AUTORITARIO</AxisLabel>
        <AxisLabel x={190} y={369}>LIBERTARIO</AxisLabel>
        <AxisLabel x={4} y={186} anchor="start">IZQ.</AxisLabel>
        <AxisLabel x={376} y={186} anchor="end">DER.</AxisLabel>
        {partyDots().map((d, i) => (
          <g key={d.k} className={cx('cmp-party', i < partiesShown && 'show')}>
            <circle cx={d.cx} cy={d.cy} r="7" fill={PARTIDOS[d.k].color} stroke="#16120f" strokeWidth="2" />
            <text
              x={d.cx + (d.left ? -11 : 11)}
              y={d.ly}
              textAnchor={d.left ? 'end' : 'start'}
              fill="#16120f"
              fontFamily={FONT}
              fontSize="12"
              fontWeight="800"
            >
              {PARTIDOS[d.k].nombre}
            </text>
          </g>
        ))}
        <g className={cx('cmp-you', youShown && 'show')}>
          <circle cx={X(me.x)} cy={Y(me.y)} r="13" fill="#16120f" stroke="#e8b04a" strokeWidth="3" />
          <text x={X(me.x)} y={Y(me.y) + 4} textAnchor="middle" fill="#e8b04a" fontFamily={FONT} fontSize="11" fontWeight="900">
            TÚ
          </text>
        </g>
      </svg>
      <div className="cmp-side">
        <div className="cmp-q">{quadrantName(me)}</div>
        <p>
          Eje económico {me.x < 0 ? 'a la izquierda' : 'a la derecha'} ({Math.round(Math.abs(me.x) * 100)}) y eje social{' '}
          {me.y > 0 ? 'hacia lo autoritario' : 'hacia lo libertario'} ({Math.round(Math.abs(me.y) * 100)}), sobre 100.
        </p>
        <p className="cmp-note">
          Los puntos de colores son la media de las propuestas de cada partido que aparecen en el juego. La posición de cada
          propuesta es una clasificación orientativa nuestra.
        </p>
      </div>
    </div>
  );
}
