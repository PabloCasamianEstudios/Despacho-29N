import { useCallback, type RefObject } from 'react';
import { game } from '../../game/engine';
import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';
import { Calendar } from './Calendar';
import { Paper } from './Paper';
import { Shredder } from './Shredder';
import { Lupa, Prop, Stamp } from './Tools';
import { Inbox, Outbox } from './Trays';

function Papers() {
  const papers = useGame((s) => s.papers);
  return (
    <div id="papers">
      {papers.filter((p) => !p.feed?.inside).map((p) => (
        <Paper key={p.id} paper={p} />
      ))}
    </div>
  );
}

function Toast() {
  const toast = useGame((s) => s.toast);
  return (
    <div id="toast" className={cx(toast.show && 'show')}>
      {toast.msg}
    </div>
  );
}

export function Desk({ deskRef }: { deskRef: RefObject<HTMLDivElement | null> }) {
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      deskRef.current = el;
      game.setDesk(el);
    },
    [deskRef],
  );
  return (
    <div id="desk" ref={ref}>
      <Inbox />
      <Outbox />
      <Calendar />
      <div id="lamp" />
      <Prop which="mug" />
      <Prop which="pen" />
      <div id="lupa-spot" />
      <Lupa />
      <Shredder />
      <div className="stamp-holder" id="holder-ok" />
      <div className="stamp-holder" id="holder-no" />
      <Stamp which="ok" />
      <Stamp which="no" />
      <Papers />
      <Toast />
    </div>
  );
}
