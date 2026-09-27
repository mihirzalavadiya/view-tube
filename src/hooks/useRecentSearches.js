import { useCallback, useEffect, useState } from 'react';

const KEY = 'vt-recent-searches';
const MAX = 6;

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : [];
  } catch (e) {
    return [];
  }
};

const write = (terms) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(terms.slice(0, MAX)));
  } catch (e) {
    // storage unavailable — recents are a convenience
  }
};

/** Real recent searches, replacing the hardcoded mock list the header used. */
export default function useRecentSearches() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(read());
  }, []);

  const remember = useCallback((term) => {
    const clean = term.trim();
    if (!clean) return;
    const next = [clean, ...read().filter((t) => t !== clean)].slice(0, MAX);
    write(next);
    setRecent(next);
  }, []);

  const forget = useCallback((term) => {
    const next = read().filter((t) => t !== term);
    write(next);
    setRecent(next);
  }, []);

  return { recent, remember, forget };
}
