import { game } from '../../game/engine';
import { sound } from '../../game/sound';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useGame } from '../../hooks/useGame';
import { cx } from '../../game/util';
import { IconClose } from '../Icons';

function Check({ id, checked, onChange, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: string }) {
  return (
    <label className="chk">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="box" />
      {children}
    </label>
  );
}

function Credits() {
  return (
    <div className="pause-card credits-card" id="credits">
      <h3>CRÉDITOS</h3>
      <p className="cr-main">
        Un juego de <b>The Penguin Pilots Devs</b>
      </p>
      <dl>
        <dt>Tipografías</dt>
        <dd>Zilla Slab, de Typotheque para Mozilla (SIL Open Font License)</dd>
        <dd>Ultra, de Astigmatic (Apache License 2.0)</dd>
        <dt>Código</dt>
        <dd>Asistido por Claude, de Anthropic</dd>
        <dt>Herramientas</dt>
        <dd>React y TypeScript · SCSS · Vite</dd>
        <dd>Web Audio API para los sonidos · Claude Code</dd>
      </dl>
      <p className="cr-thanks">¡Y gracias a ti, jugador!</p>
      <button className="big" id="btn-credits-back" onClick={() => game.creditsBack()}>
        VOLVER
      </button>
    </div>
  );
}

export function PauseMenu() {
  const view = useGame((s) => s.pause);
  const muted = useGame((s) => s.muted);
  const full = useFullscreen();
  return (
    <div
      id="pause"
      className={cx(!view && 'hidden')}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) game.closePause();
      }}
    >
      {view === 'menu' && (
        <div className="pause-card">
          <button id="pause-x" aria-label="Cerrar" onClick={() => game.closePause()}>
            <IconClose />
          </button>
          <h3>PAUSA</h3>
          <Check
            id="opt-sound"
            checked={!muted}
            onChange={(on) => {
              game.setMuted(!on);
              sound.play('tick');
            }}
          >
            Sonido
          </Check>
          <Check id="opt-full" checked={full.on} onChange={full.set}>
            Pantalla completa
          </Check>
          <button className="big ghost" id="btn-tuto" onClick={() => game.replayTutorial()}>
            VER TUTORIAL
          </button>
          <button className="big ghost" id="btn-credits" onClick={() => game.showCredits(true)}>
            CRÉDITOS
          </button>
          <button className="big" id="btn-home" onClick={() => game.goHome()}>
            VOLVER AL INICIO
          </button>
        </div>
      )}
      {view === 'credits' && <Credits />}
    </div>
  );
}
