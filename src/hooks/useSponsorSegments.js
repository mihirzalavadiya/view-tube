import { useEffect, useState } from 'react';

export default function useSponsorSegments(videoId) {
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    if (!videoId) return undefined;

    let cancelled = false;
    setSegments([]);

    fetch(`/api/sponsor?videoId=${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSegments(Array.isArray(data?.segments) ? data.segments : []);
      })
      .catch(() => {
        if (!cancelled) setSegments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return segments;
}
