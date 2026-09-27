import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addVideos } from '@/redux/slice/videoListSlice';

/**
 * Home feed. `query` comes from the active category chip — null means the
 * default popular chart, anything else is a filtered search.
 */
export default function useVideos(query = null) {
  const dispatch = useDispatch();
  const { videos, cleared } = useSelector((state) => state.videoList);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getVideos = useCallback(async () => {
    try {
      setLoading(true);
      const url = query ? `/api/feed?q=${encodeURIComponent(query)}` : '/api/feed';
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Couldn't reach the video service (${res.status})`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      dispatch(addVideos(data.items || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch, query]);

  useEffect(() => {
    getVideos();
  }, [getVideos]);

  useEffect(() => {
    if (cleared) getVideos();
  }, [cleared, getVideos]);

  return { videos, loading, error, refetch: getVideos };
}
