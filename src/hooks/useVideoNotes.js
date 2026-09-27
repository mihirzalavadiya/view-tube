import { useCallback, useEffect, useState } from 'react';
import { secondsToClock } from '@/utils/format';

const KEY = 'vt-notes';

const readAll = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
};

const writeAll = (all) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    // storage blocked — notes last for this session only
  }
};

/**
 * Private timestamped notes per video. The design says they "stay on your
 * account"; with no account backend they stay on this device instead.
 */
export default function useVideoNotes(videoId) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!videoId) return;
    setNotes(readAll()[videoId] || []);
  }, [videoId]);

  const add = useCallback(
    (text, seconds) => {
      const clean = text.trim();
      if (!clean || !videoId) return;

      const note = {
        id: `n_${Date.now()}`,
        seconds: Math.floor(seconds || 0),
        time: secondsToClock(seconds || 0),
        text: clean,
        createdAt: new Date().toISOString(),
      };

      const all = readAll();
      const next = [...(all[videoId] || []), note].sort((a, b) => a.seconds - b.seconds);
      all[videoId] = next;
      writeAll(all);
      setNotes(next);
    },
    [videoId]
  );

  const remove = useCallback(
    (id) => {
      const all = readAll();
      const next = (all[videoId] || []).filter((n) => n.id !== id);
      all[videoId] = next;
      writeAll(all);
      setNotes(next);
    },
    [videoId]
  );

  /** Markdown with links back to the exact second, as the design promises. */
  const toMarkdown = useCallback(
    (title) => {
      const lines = notes.map(
        (n) => `- [${n.time}](https://youtu.be/${videoId}?t=${n.seconds}) — ${n.text}`
      );
      return `# ${title || 'Notes'}\n\n${lines.join('\n')}\n`;
    },
    [notes, videoId]
  );

  return { notes, add, remove, toMarkdown };
}
