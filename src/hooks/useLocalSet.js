import { useCallback, useEffect, useState } from 'react';

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

/**
 * A membership set kept in localStorage — used for Subscribe and Save, which
 * are per-device here because the app has no account backend.
 */
export default function useLocalSet(key) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(read(key));
  }, [key]);

  const toggle = useCallback(
    (id) => {
      if (!id) return;
      const current = read(key);
      const next = current.includes(id)
        ? current.filter((i) => i !== id)
        : [...current, id];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        // storage blocked — state still updates for this session
      }
      setItems(next);
    },
    [key]
  );

  const has = useCallback((id) => items.includes(id), [items]);

  return { items, has, toggle };
}
