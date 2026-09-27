import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'vt-watch-budget';
const EVENT = 'vt-budget-change';
export const DEFAULT_LIMIT_MIN = 45;

// A poll tick is ~1s; anything larger is a seek or a tab that was asleep, so
// it is not counted as time actually watched.
const MAX_TICK_SECONDS = 3;

const today = () => new Date().toISOString().slice(0, 10);

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const limitMin = Number(parsed?.limitMin) || DEFAULT_LIMIT_MIN;
    if (!parsed || parsed.date !== today()) return { date: today(), seconds: 0, limitMin };
    return { date: parsed.date, seconds: Number(parsed.seconds) || 0, limitMin };
  } catch (e) {
    return { date: today(), seconds: 0, limitMin: DEFAULT_LIMIT_MIN };
  }
};

const write = (state) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // storage blocked — the budget just resets
  }
  // The top-bar pill and the watch page each hold their own instance of
  // this hook; the event keeps them showing the same number.
  window.dispatchEvent(new CustomEvent(EVENT));
};

/**
 * The design's daily watch budget. Counted from real playback: the player
 * reports its position every second and only forward movement of roughly one
 * second counts, so seeking and pausing don't inflate the total.
 */
export default function useWatchBudget() {
  const [state, setState] = useState({ date: today(), seconds: 0, limitMin: DEFAULT_LIMIT_MIN });
  const lastPositionRef = useRef(null);

  useEffect(() => {
    setState(read());
    const sync = () => setState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const record = useCallback((positionSec, playing) => {
    const previous = lastPositionRef.current;
    lastPositionRef.current = positionSec;

    if (!playing || previous === null) return;

    const delta = positionSec - previous;
    if (delta <= 0 || delta > MAX_TICK_SECONDS) return;

    const base = read();
    write({ ...base, seconds: base.seconds + delta });
  }, []);

  const resetPosition = useCallback(() => {
    lastPositionRef.current = null;
  }, []);

  const setLimit = useCallback((limitMin) => {
    write({ ...read(), limitMin });
  }, []);

  const limitSec = state.limitMin * 60;
  const usedSec = Math.min(state.seconds, limitSec);

  return {
    usedMin: Math.floor(state.seconds / 60),
    remainingMin: Math.max(0, Math.round((limitSec - state.seconds) / 60)),
    limitMin: state.limitMin,
    ratio: limitSec > 0 ? usedSec / limitSec : 0,
    spent: state.seconds >= limitSec,
    record,
    resetPosition,
    setLimit,
  };
}
