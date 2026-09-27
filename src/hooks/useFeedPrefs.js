import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MIX, DEFAULT_RULES } from '@/utils/ranking';

const KEY = 'vt-feed-prefs';

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      mix: { ...DEFAULT_MIX, ...(parsed?.mix || {}) },
      rules: { ...DEFAULT_RULES, ...(parsed?.rules || {}) },
    };
  } catch (e) {
    return { mix: DEFAULT_MIX, rules: DEFAULT_RULES };
  }
};

const write = (prefs) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch (e) {
    // storage blocked — prefs stay for this session only
  }
};

/** "Tune your feed" state. Saved per device, as the panel's copy promises. */
export default function useFeedPrefs() {
  const [prefs, setPrefs] = useState({ mix: DEFAULT_MIX, rules: DEFAULT_RULES });

  useEffect(() => {
    setPrefs(read());
  }, []);

  const setMix = useCallback((key, value) => {
    setPrefs((current) => {
      const next = {
        ...current,
        mix: { ...current.mix, [key]: Math.round(Number(value)) || 0 },
      };
      write(next);
      return next;
    });
  }, []);

  const toggleRule = useCallback((key) => {
    setPrefs((current) => {
      const next = {
        ...current,
        rules: { ...current.rules, [key]: !current.rules[key] },
      };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const next = { mix: DEFAULT_MIX, rules: DEFAULT_RULES };
    write(next);
    setPrefs(next);
  }, []);

  return { ...prefs, setMix, toggleRule, reset };
}
