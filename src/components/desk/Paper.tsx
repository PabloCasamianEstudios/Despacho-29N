import { memo, useCallback, useEffect, useRef, type CSSProperties } from 'react';
import { game, type PaperView } from '../../game/engine';
import { SHRED } from '../../game/constants';
import { cx, poseTransform } from '../../game/util';
import { IconNo, IconOk } from '../Icons';

const redact = (n: number) => '█'.repeat(n);

function PaperBody({ paper, withNote }: { paper: PaperView; withNote: boolean }) {
  const { mark, note } = paper;
  return (
    <>
      {paper.opt && <div className="p-opt">EXPEDIENTE · OPCIÓN {paper.opt}</div>}
      <div className="p-head">
        <span>PROPUESTA Nº {String(paper.num).padStart(3, '0')}</span>
        <span className="p-tema">{paper.tema.toUpperCase()}</span>
      </div>
      <div className="p-from">
        REMITENTE: <span className="redact">{redact(14)}</span>
      </div>
      <h3>{paper.titulo}</h3>
      <p>{paper.texto}</p>
      <div className="p-foot">
        <span>
          Firma: <span className="redact">{redact(paper.sello)}</span>
        </span>
        <span>Registro 29-N</span>
      </div>
      {mark && (
        <div
          key={mark.key}
          className={`mark ${mark.kind} fresh`}
          style={{ left: mark.left, top: mark.top, transform: `rotate(${mark.r}deg)`, '--r': `${mark.r}deg` } as CSSProperties}
        >
          {mark.kind === 'ok' ? <IconOk /> : <IconNo />}
        </div>
      )}
      {withNote && note && (
        <div
          key={note.key}
          className="explain"
          style={{ left: note.left, top: note.top, transform: `rotate(${note.r}deg)`, '--r': `${note.r}deg` } as CSSProperties}
          onPointerDown={(e) => {
            e.stopPropagation();
            game.removeNote(paper.id);
          }}
        >
          {note.text}
        </div>
      )}
    </>
  );
}

export const Paper = memo(function Paper({ paper }: { paper: PaperView }) {
  const ref = useCallback((el: HTMLDivElement | null) => game.registerPaper(paper.id, el), [paper.id]);
  const feeding = paper.feed && !paper.feed.inside;
  const style: CSSProperties = {
    transform: poseTransform(paper.pose),
    zIndex: paper.z,
    opacity: paper.gone ? 0 : undefined,
    pointerEvents: paper.locked ? 'none' : undefined,
    transformOrigin: paper.feed ? '0 0' : undefined,
    transition: feeding ? 'transform .28s cubic-bezier(.3,.9,.4,1)' : undefined,
  };
  return (
    <div
      ref={ref}
      className={cx('paper', paper.opt && 'dossier', paper.anim && 'anim', paper.dragging && 'dragging')}
      style={style}
      onPointerDown={(e) => game.startDrag(e, { kind: 'paper', id: paper.id })}
    >
      <PaperBody paper={paper} withNote />
    </div>
  );
});

export function ShreddingPaper({ paper }: { paper: PaperView }) {
  const ref = useRef<HTMLDivElement>(null);
  const { k, h } = paper.feed!;
  const y0 = SHRED.slotY - h - SHRED.mouthTop;

  useEffect(() => {
    ref.current?.animate(
      [
        { transform: `translate(4px, ${y0}px) scale(${k})` },
        { transform: `translate(2px, ${y0 + h * 0.5}px) scale(${k})`, offset: 0.5 },
        { transform: `translate(5px, ${y0 + h + 4}px) scale(${k})` },
      ],
      { duration: 1150, easing: 'linear', fill: 'forwards' },
    );
  }, [h, k, y0]);

  return (
    <div
      ref={ref}
      className={cx('paper', paper.opt && 'dossier')}
      style={{ transform: `translate(4px, ${y0}px) scale(${k})`, transformOrigin: '0 0', pointerEvents: 'none', transition: 'none' }}
    >
      <PaperBody paper={paper} withNote={false} />
    </div>
  );
}
