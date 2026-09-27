import { useEffect, useMemo, useState } from 'react';

// Module-level so avatars resolved on the home feed are reused on the watch
// page and across re-renders without refetching.
const cache = new Map();

const pick = (ids) => {
  const out = {};
  ids.forEach((id) => {
    if (cache.has(id)) out[id] = cache.get(id);
  });
  return out;
};

/** Resolves channelId → { avatar, title } for a list of videos' channels. */
export default function useChannelAvatars(channelIds = []) {
  const key = useMemo(
    () => [...new Set(channelIds.filter(Boolean))].sort().join(','),
    [channelIds]
  );

  const [avatars, setAvatars] = useState(() => (key ? pick(key.split(',')) : {}));

  useEffect(() => {
    if (!key) return undefined;

    const ids = key.split(',');
    setAvatars(pick(ids));

    const missing = ids.filter((id) => !cache.has(id));
    if (missing.length === 0) return undefined;

    let cancelled = false;

    fetch(`/api/channels?ids=${missing.join(',')}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.channels) return;
        Object.entries(data.channels).forEach(([id, value]) => cache.set(id, value));
        setAvatars(pick(ids));
      })
      .catch(() => {
        // Cards fall back to initials, which is the design's own placeholder.
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return avatars;
}
