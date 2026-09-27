import { useCallback, useEffect, useState } from 'react';

const KEY = 'vt-watch-history';
const MAX_ENTRIES = 40;

// Below this we assume the user barely started; above it they effectively
// finished. Either way the video does not belong in "Continue watching".
const MIN_PCT = 2;
const MAX_PCT = 95;

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const write = (entries) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch (e) {
    // storage unavailable — history is a convenience, not a requirement
  }
};

/**
 * Real watch history backed by localStorage. WatchPage calls recordProgress as
 * playback advances; Home reads `resumable` for the Continue-watching rail.
 */
export default function useWatchHistory() {
  const [entries, setEntries] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntries(read());
    setReady(true);
  }, []);

  const recordProgress = useCallback((entry) => {
    if (!entry?.id) return;

    const next = read().filter((e) => e.id !== entry.id);
    next.unshift({ ...entry, updatedAt: Date.now() });
    write(next);
    setEntries(next);
  }, []);

  const remove = useCallback((id) => {
    const next = read().filter((e) => e.id !== id);
    write(next);
    setEntries(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setEntries([]);
  }, []);

  const resumable = entries.filter((e) => {
    if (!e.durationSec || !e.positionSec) return false;
    const pct = (e.positionSec / e.durationSec) * 100;
    return pct >= MIN_PCT && pct <= MAX_PCT;
  });

  return { entries, resumable, ready, recordProgress, remove, clear };
}
