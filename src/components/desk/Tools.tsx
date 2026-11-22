import { game, type PropId } from '../../game/engine';
import type { Kind } from '../../game/types';
import { useGame } from '../../hooks/useGame';
import { cx, poseTransform } from '../../game/util';
import { IconNo, IconOk } from '../Icons';

export function Stamp({ which }: { which: Kind }) {
  const t = useGame((s) => s.stamps[which]);
  return (
    <div
      className={cx('stamp', t.dragging && 'dragging', t.home && 'home', t.press && 'press')}
      id={`stamp-${which}`}
      style={{ transform: poseTransform(t.pose) }}
      onPointerDown={(e) => game.startDrag(e, { kind: 'stamp', which })}
    >
      <div className="knob" />
      <div className="neck" />
      <div className="base">{which === 'ok' ? <IconOk /> : <IconNo />}</div>
    </div>
  );
}

export function Lupa() {
  const t = useGame((s) => s.lupa);
  return (
    <div
      id="lupa"
      className={cx(t.dragging && 'dragging', t.home && 'home')}
      title="Arrástrala sobre una propuesta"
      style={{ transform: poseTransform(t.pose) }}
      onPointerDown={(e) => game.startDrag(e, { kind: 'lupa' })}
    >
      <div className="lens" />
      <div className="rim" />
      <div className="handle" />
    </div>
  );
}

export function Prop({ which }: { which: PropId }) {
  const t = useGame((s) => s.props[which]);
  return (
    <div
      id={which}
      className={cx(t.dragging && 'dragging')}
      style={{ transform: poseTransform(t.pose) }}
      onPointerDown={(e) => game.startDrag(e, { kind: 'prop', which })}
    >
      {which === 'mug' && (
        <>
          <div className="mug-handle" />
          <div className="coffee" />
        </>
      )}
    </div>
  );
}
