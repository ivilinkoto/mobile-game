import { useEffect, useRef, useState } from 'react';

/** Smoothly counts a displayed number toward `value` (for coin counters). */
export function useCountUp(value: number, duration = 700): number {
  const [shown, setShown] = useState(value);
  // Last displayed value, kept in sync from the animation loop.
  const current = useRef(value);

  useEffect(() => {
    const from = current.current;
    if (from === value) return;
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const next = Math.round(from + (value - from) * eased);
      current.current = next;
      setShown(next);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return shown;
}
