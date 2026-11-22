import { useEffect, useState } from 'react';
import { STAGE_H, STAGE_W } from '../game/constants';

const fit = () => Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);

export function useStageFit() {
  const [scale, setScale] = useState(fit);
  useEffect(() => {
    const onResize = () => setScale(fit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}
