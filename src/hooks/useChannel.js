import { useEffect, useState } from 'react';

export default function useChannel(channelId) {
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!channelId) return undefined;

    let cancelled = false;
    setChannel(null);

    fetch(`/api/channel?id=${channelId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setChannel(data?.items?.[0] || null);
      })
      .catch(() => {
        // The channel bar degrades to name-only without these counts.
        if (!cancelled) setChannel(null);
      });

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  return channel;
}
