import { useEffect, type RefObject } from 'react';

export function useLockScroll(...refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    const els = refs.map((r) => r.current).filter((el): el is HTMLElement => !!el);
    const reset = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (el.scrollTop || el.scrollLeft) {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      }
    };
    els.forEach((el) => el.addEventListener('scroll', reset));
    return () => els.forEach((el) => el.removeEventListener('scroll', reset));
  }, []);
}
