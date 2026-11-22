import { useRef } from 'react';
import { IconFullscreen } from './components/Icons';
import { Desk } from './components/desk/Desk';
import { Intro } from './components/overlays/Intro';
import { PauseMenu } from './components/overlays/PauseMenu';
import { Tutorial } from './components/overlays/Tutorial';
import { EndScreen } from './components/screens/EndScreen';
import { NewspaperScreen } from './components/screens/NewspaperScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { sound } from './game/sound';
import { useFullscreen } from './hooks/useFullscreen';
import { useGame } from './hooks/useGame';
import { useGameInput } from './hooks/useGameInput';
import { useLockScroll } from './hooks/useLockScroll';
import { useStageFit } from './hooks/useStageFit';

function FullscreenButton() {
  const { toggle } = useFullscreen();
  return (
    <button
      id="btn-full"
      title="Pantalla completa"
      aria-label="Pantalla completa"
      onClick={(e) => {
        e.stopPropagation();
        sound.init();
        sound.play('tick');
        toggle();
      }}
    >
      <IconFullscreen />
    </button>
  );
}

export default function App() {
  const scale = useStageFit();
  const screen = useGame((s) => s.screen);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  useLockScroll(wrapRef, stageRef, deskRef);
  useGameInput();

  return (
    <div id="wrap" ref={wrapRef}>
      <div id="stage" ref={stageRef} style={{ transform: `scale(${scale})` }}>
        <Desk deskRef={deskRef} />
        <TitleScreen active={screen === 'title'} />
        <NewspaperScreen active={screen === 'paper'} />
        <EndScreen active={screen === 'end'} />
        <FullscreenButton />
        <Tutorial />
        <PauseMenu />
        <Intro />
      </div>
    </div>
  );
}
