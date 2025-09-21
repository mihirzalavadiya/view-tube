import { useEffect, useState } from 'react';

export default function useYouTubeVideo(videoId) {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/viewtubevideo?id=${videoId}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setVideoData(data.items[0]);
        } else {
          setVideoData(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  return { videoData, loading, error };
}
