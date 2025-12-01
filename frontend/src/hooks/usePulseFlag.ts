import { useEffect, useRef, useState } from 'react';

/**
 * Returns a boolean flag that becomes true whenever the trigger key changes,
 * then resets after the provided duration. Useful for replayable animations.
 */
export const usePulseFlag = (triggerKey: number, duration = 1400): boolean => {
  const [active, setActive] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!triggerKey) {
      return;
    }
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Briefly turn the flag off so CSS animations tied to the class
    // can restart even if a previous pulse is still in progress.
    setActive(false);

    restartTimeoutRef.current = window.setTimeout(() => {
      setActive(true);
      hideTimeoutRef.current = window.setTimeout(() => {
        setActive(false);
        hideTimeoutRef.current = null;
      }, duration);
      restartTimeoutRef.current = null;
    }, 20);

    return () => {
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [duration, triggerKey]);

  return active;
};
