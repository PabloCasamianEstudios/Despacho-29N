import { useLayoutEffect, useRef } from 'react';
import { game, type Leaf } from '../../game/engine';
import { DAYS, EVE } from '../../game/constants';
import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';

function PageFace({ day }: { day: number }) {
  const fecha = day < 0 ? EVE : DAYS[day].fecha;
  const [, wd, num, mo] = fecha.match(/^(\S+), (\d+) de (\S+)/)!;
  return (
    <>
      <div className="cal-mo">{mo.toUpperCase()}</div>
      <div className="cal-num">{num}</div>
      <div className="cal-wd">{wd}</div>
    </>
  );
}

function FlyingLeaf({ leaf }: { leaf: Leaf }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || leaf.mode !== 'fly') return;
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.transform = leaf.to ?? '';
      el.style.opacity = '0';
    });
  }, [leaf]);
  if (leaf.mode === 'tear') {
    return (
      <div className="cal-page tear">
        <PageFace day={leaf.day} />
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className="cal-page flying"
      style={{ transform: leaf.from, transition: 'transform .6s cubic-bezier(.25,.6,.5,1), opacity .6s ease-in' }}
    >
      <PageFace day={leaf.day} />
    </div>
  );
}

export function Calendar() {
  const cal = useGame((s) => s.calendar);
  return (
    <div
      id="calendar"
      className={cx(cal.on && 'on', cal.ready && 'ready')}
      aria-live="polite"
      onPointerDown={(e) => game.startCalPull(e)}
    >
      <div className="cal-back" />
      <div className="cal-rings">
        <i />
        <i />
        <i />
      </div>
      {cal.under !== null && (
        <div className="cal-page">
          <PageFace day={cal.under} />
        </div>
      )}
      <div
        className={cx('cal-page', cal.pulling && 'pulling')}
        id="cal-page"
        style={{
          transform: cal.pull || undefined,
          transition: cal.pulling ? 'none' : cal.spring ? 'transform .3s cubic-bezier(.3,1.6,.5,1)' : undefined,
        }}
      >
        {cal.day !== null && <PageFace day={cal.day} />}
      </div>
      {cal.leaves.map((leaf) => (
        <FlyingLeaf key={leaf.id} leaf={leaf} />
      ))}
    </div>
  );
}
