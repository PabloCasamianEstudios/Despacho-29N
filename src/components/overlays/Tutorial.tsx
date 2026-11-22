import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DESK_TOP, STAGE_H, STAGE_W } from '../../game/constants';
import { game, type Tutorial as TutorialState } from '../../game/engine';
import type { Rect } from '../../game/types';
import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';
import { TextSizePicker } from './TextSize';

interface Step {
  r?: Rect;
  t: ReactNode;
  wide?: boolean;
}

const D = DESK_TOP;

const box = (x: number, y: number, w: number, h: number, pad = 10): Rect => ({
  x: x - pad,
  y: y - pad,
  w: w + pad * 2,
  h: h + pad * 2,
});

const INTRO_STEPS: Step[] = [
  {
    wide: true,
    t: (
      <>
        Antes de empezar: <b>ajusta el tamaño de la letra</b> para que leas bien los papeles.
        <TextSizePicker />
      </>
    ),
  },
  {
    t: (
      <>
        Te doy la bienvenida al despacho. Esta semana te van a llegar <b>propuestas reales</b> de los partidos que se
        presentan al 29-N… <b>sin firma</b>. Tú decides.
      </>
    ),
  },
  {
    r: box(36, 206 + D, 172, 232),
    t: (
      <>
        Cada jornada empieza aquí: <b>tira de la hoja del calendario con el ratón</b> hasta arrancarla y empezarán a
        llegar los papeles. Son seis días, del lunes al sábado. El domingo 29, tu resultado.
      </>
    ),
  },
  {
    r: box(18, 18 + D, 200, 150),
    t: (
      <>
        Por aquí entran los documentos. El montón te dice <b>cuántos te quedan</b> por decidir hoy.
      </>
    ),
  },
  {
    r: box(250, 70 + D, 780, 420),
    t: (
      <>
        Las propuestas aparecen en el centro de la mesa y puedes <b>arrastrarlas</b>. El remitente está tachado: no
        sabrás de quién son hasta el final.
      </>
    ),
  },
  {
    r: box(700, 548 + D, 110, 110),
    t: (
      <>
        ¿Algo te suena a chino? Arrastra la <b>lupa</b> encima del papel y te pega una nota que lo explica fácil.
      </>
    ),
  },
  {
    r: box(1080, 418 + D, 170, 242),
    t: (
      <>
        Cuando lo tengas claro, coge un sello y suéltalo sobre el papel: <b>✓</b> si lo apruebas, <b>✗</b> si lo
        rechazas.
      </>
    ),
  },
  {
    r: box(18, 470 + D, 200, 190),
    t: (
      <>
        Luego arrastra el papel sellado aquí, a <b>DECIDIDAS</b>. Así queda firmado.
      </>
    ),
  },
  {
    r: box(1062, 160 + D, 200, 240),
    t: (
      <>
        ¿No lo tienes claro? Échalo a la <b>trituradora</b>. Es como votar en blanco: no cuenta para tu resultado.
      </>
    ),
  },
  {
    t: (
      <>
        Pulsa la tecla <kbd>P</kbd> cuando quieras para abrir la <b>pausa</b>: sonido, pantalla completa, repetir esta
        explicación o volver al inicio.
      </>
    ),
  },
  {
    r: box(36, 206 + D, 172, 232),
    t: (
      <>
        Y ya está. <b>Arranca la hoja del calendario</b> y a trabajar.
      </>
    ),
  },
];

const dossierSteps = (n: number, tema: string): Step[] => [
  {
    r: { x: 240, y: 50 + D, w: 800, h: 470 },
    t: (
      <>
        Esto es un <b>expediente</b>: {n} propuestas sobre el mismo tema ({tema.toLowerCase()}), una de cada partido.{' '}
        <b>Solo una puede salir del despacho.</b>
      </>
    ),
  },
  {
    r: { x: 1052, y: D - 10, w: 220, h: 420 },
    t: (
      <>
        Lee las opciones y quédate con la que más te convenza. Las demás, <b>a la trituradora</b>.
      </>
    ),
  },
  {
    r: { x: 1070, y: 408 + D, w: 190, h: 140 },
    t: (
      <>
        A la que sobreviva ponle el <b>✓</b> y llévala a <b>DECIDIDAS</b>.
      </>
    ),
  },
];

const stepsFor = (t: TutorialState) => (t.kind === 'intro' ? INTRO_STEPS : dossierSteps(t.n, t.tema));

function placeBox(r: Rect | undefined, bw: number, bh: number) {
  let x: number;
  let y: number;
  if (!r) {
    x = STAGE_W / 2 - bw / 2;
    y = Math.min(300, (STAGE_H - bh) / 2);
  } else if (r.w > 700) {
    x = STAGE_W / 2 - bw / 2;
    y = STAGE_H - bh - 16;
  } else {
    x = r.x + r.w / 2 < STAGE_W / 2 ? r.x + r.w + 24 : r.x - bw - 24;
    y = r.y < 60 ? r.y + r.h + 20 : r.y + r.h / 2 - bh / 2;
  }
  return { left: Math.max(16, Math.min(x, STAGE_W - bw - 16)), top: Math.max(16, Math.min(y, STAGE_H - bh - 16)) };
}

function TutorialCard({ t }: { t: TutorialState }) {
  const steps = useMemo(() => stepsFor(t), [t]);
  const step = steps[t.index];
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const r = step.r ?? { x: STAGE_W / 2, y: 330, w: 0, h: 0 };

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const place = () => setPos(placeBox(step.r, el.offsetWidth || 400, el.offsetHeight || 150));
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  const last = t.index === steps.length - 1;
  return (
    <div id="tuto">
      <div
        id="tuto-spot"
        style={{
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          boxShadow: step.r ? undefined : '0 0 0 3000px rgba(8,6,4,.82)',
        }}
      />
      <div id="tuto-box" ref={boxRef} className={cx(step.wide && 'wide')} style={pos ? { transform: `translate3d(${pos.left}px, ${pos.top}px, 0)` } : { visibility: 'hidden' }}>
        <div id="tuto-text">{step.t}</div>
        <div className="tuto-btns">
          <span />
          <button id="tuto-next" className="big" onClick={() => game.tutorialNext(steps.length)}>
            {last ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Tutorial() {
  const t = useGame((s) => s.tutorial);
  return t ? <TutorialCard t={t} /> : null;
}
