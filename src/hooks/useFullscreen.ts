import { useCallback, useEffect, useState } from 'react';

export function useFullscreen() {
  const [on, setOn] = useState(() => !!document.fullscreenElement);

  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const set = useCallback((want: boolean) => {
    if (want && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => setOn(false));
    } else if (!want && document.fullscreenElement) {
      void document.exitFullscreen();
    }
  }, []);

  const toggle = useCallback(() => set(!document.fullscreenElement), [set]);

  return { on, set, toggle };
}
