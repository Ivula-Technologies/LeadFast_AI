'use client';

import { useEffect, useState } from 'react';

/**
 * useTypewriter – reveals `text` one character at a time.
 *
 * @param text       The full string to animate.
 * @param speed      Delay in ms between characters (default 55 ms).
 * @param startDelay Optional delay in ms before the animation begins (default 0).
 * @returns          A tuple of [displayedText, isDone] — isDone becomes true
 *                   once the entire string has been revealed, so callers can
 *                   hide the blinking cursor at that point.
 */
export function useTypewriter(
  text: string,
  speed = 55,
  startDelay = 0,
): [string, boolean] {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval>;

    const startTimer = setTimeout(() => {
      setDisplayed('');
      setIsDone(false);
      interval = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setIsDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return [displayed, isDone];
}
