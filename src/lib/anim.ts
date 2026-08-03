import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** True once the element has scrolled into view; used to auto-run figures. */
export function useInView<T extends HTMLElement>(margin = "-15% 0px -15% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, margin]);

  return { ref, inView };
}

export interface StepperOptions {
  speed?: number;
  loop?: boolean;
}

/**
 * Drives every "watch it happen" demo: a frame counter from 0..total that can
 * be played, paused, scrubbed, reset, or skipped to the end.
 */
export function useStepper(total: number, options: StepperOptions = {}) {
  const { speed: initialSpeed = 320, loop = false } = options;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);

  // Never let the cursor dangle past a shorter dataset.
  useEffect(() => {
    setStep((s) => Math.min(s, total));
  }, [total]);

  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      if (loop) {
        const t = setTimeout(() => setStep(0), speed * 3);
        return () => clearTimeout(t);
      }
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, total)), speed);
    return () => clearTimeout(t);
  }, [playing, step, total, speed, loop]);

  const play = useCallback(() => {
    setStep((s) => (s >= total ? 0 : s));
    setPlaying(true);
  }, [total]);

  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);
  const reset = useCallback(() => {
    setPlaying(false);
    setStep(0);
  }, []);
  const skipToEnd = useCallback(() => {
    setPlaying(false);
    setStep(total);
  }, [total]);

  return useMemo(
    () => ({
      step,
      setStep,
      playing,
      play,
      pause,
      toggle,
      reset,
      skipToEnd,
      speed,
      setSpeed,
      done: step >= total,
      total,
    }),
    [step, playing, play, pause, toggle, reset, skipToEnd, speed, total],
  );
}
