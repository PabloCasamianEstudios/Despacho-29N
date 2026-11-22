import { memo, useEffect, useRef } from 'react';
import type { Strip as StripModel } from '../../game/engine';
import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';
import { IconShredder } from '../Icons';
import { ShreddingPaper } from './Paper';

const Strip = memo(function Strip({ strip }: { strip: StripModel }) {
  const ref = useRef<HTMLDivElement>(null);
  const end = `translate(${strip.x2}px,${strip.y2}px) rotate(${strip.r}deg)`;
  useEffect(() => {
    ref.current?.animate([{ transform: `translate(${strip.x}px,-40px) rotate(0deg)` }, { transform: end }], {
      duration: strip.dur,
      easing: 'cubic-bezier(.5,0,1,1)',
      fill: 'forwards',
    });
  }, [strip, end]);
  return <div ref={ref} className="strip" />;
});

export function Shredder() {
  const hot = useGame((s) => s.hot.shred);
  const busy = useGame((s) => s.shredBusy);
  const strips = useGame((s) => s.strips);
  const papers = useGame((s) => s.papers);
  const inside = papers.filter((p) => p.feed?.inside);
  return (
    <div id="shredder" className={cx(hot && 'hot', busy && 'busy')}>
      <div id="shred-mouth">
        {inside.map((p) => (
          <ShreddingPaper key={p.id} paper={p} />
        ))}
      </div>
      <div className="shred-body">
        <div className="shred-slot" />
        <div className={cx('shred-led', busy && 'on')} id="shred-led" />
        <div className="shred-brand">
          <IconShredder />
        </div>
      </div>
      <div id="shred-bin">
        {strips.map((s) => (
          <Strip key={s.id} strip={s} />
        ))}
      </div>
    </div>
  );
}
