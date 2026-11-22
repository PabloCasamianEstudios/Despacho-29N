import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';

const SHIFT = [0, 4, -3, 2, -4, 3, -2, 1];
const TILT = [0, -1.2, 1, -0.6, 1.3, -1, 0.7, -0.4];

export function Inbox() {
  const count = useGame((s) => s.inbox);
  return (
    <div id="inbox" className="tray">
      <div className="tray-slot" />
      <div className="tray-label">PENDIENTES</div>
      <div id="inbox-stack">
        {Array.from({ length: count }, (_, i) => (
          <i key={i} style={{ top: 39 - i * 7, transform: `translateX(${SHIFT[i]}px) rotate(${TILT[i]}deg)` }} />
        ))}
      </div>
    </div>
  );
}

export function Outbox() {
  const sheets = useGame((s) => s.outbox);
  const hot = useGame((s) => s.hot.out);
  return (
    <div id="outbox" className={cx('tray', hot && 'hot')}>
      <div id="outbox-stack">
        {sheets.map((s) => (
          <i key={s.id} style={{ top: s.top, transform: `rotate(${s.r}deg)` }} />
        ))}
      </div>
      <div className="tray-label">DECIDIDAS</div>
    </div>
  );
}
