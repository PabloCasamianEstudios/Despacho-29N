import { game } from '../../game/engine';
import { DISCORD_URL } from '../../game/constants';
import { cx } from '../../game/util';
import { IconDiscord } from '../Icons';

export function TitleScreen({ active }: { active: boolean }) {
  return (
    <div
      id="screen-title"
      className={cx('screen', !active && 'hidden')}
      onClick={() => {
        if (game.onTitle()) game.startGame();
      }}
    >
      <button
        id="title-credits"
        onClick={(e) => {
          e.stopPropagation();
          game.creditsFromTitleScreen();
        }}
      >
        Créditos
      </button>
      <a
        id="discord"
        href={DISCORD_URL}
        target="_blank"
        rel="noopener"
        title="Únete al Discord"
        aria-label="Discord"
        onClick={(e) => e.stopPropagation()}
      >
        <IconDiscord />
      </a>
      <div className="title-card">
        <h1>
          DESPACHO
          <br />
          29-N
        </h1>
        <p className="sub">
          <b>Sin logos. Sin nombres. Sin remitente.</b>
          <br />
          Tú decides qué se aprueba.
        </p>
      </div>
      <p className="fine title-fine">
        Medidas parafraseadas de los programas electorales oficiales de PP, PSOE, Vox y Frente Amplio (noviembre de 2026).
        No es una encuesta ni una recomendación de voto. Ningún partido participa ni patrocina este juego.
      </p>
    </div>
  );
}
