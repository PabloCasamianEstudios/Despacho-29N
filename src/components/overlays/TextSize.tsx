import { TEXT_SCALE } from '../../game/constants';
import { game } from '../../game/engine';
import { useGame } from '../../hooks/useGame';

export function SizeRange({ label }: { label: string }) {
  const ts = useGame((s) => s.textScale);
  return (
    <div className="size-row">
      <span className="a a-s" aria-hidden>
        A
      </span>
      <input
        type="range"
        className="size-range"
        aria-label={label}
        min={TEXT_SCALE.min}
        max={TEXT_SCALE.max}
        step={TEXT_SCALE.step}
        value={ts}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => game.setTextScale(Number(e.target.value))}
      />
      <span className="a a-l" aria-hidden>
        A
      </span>
    </div>
  );
}

export function TextSizePicker() {
  return (
    <div className="text-size">
      <div className="paper sample">
        <div className="p-head">
          <span>PROPUESTA Nº 000</span>
          <span className="p-tema">EJEMPLO</span>
        </div>
        <div className="p-from">
          REMITENTE: <span className="redact">{'█'.repeat(14)}</span>
        </div>
        <h3>Así se leerán las propuestas</h3>
        <p>Mueve la barra hasta que leas este texto sin esfuerzo. Podrás cambiarlo cuando quieras desde la pausa.</p>
      </div>
      <SizeRange label="Tamaño de la letra" />
    </div>
  );
}
