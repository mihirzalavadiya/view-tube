import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addVideos } from '@/redux/slice/videoListSlice';

export default function useVideos(cleared) {
  const dispatch = useDispatch();
  const { videos, searchResults } = useSelector((state) => state.videoList);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getVideos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/viewtube');

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      dispatch(addVideos(data.items || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getVideos();
  }, [getVideos]);

  useEffect(() => {
    if (cleared) {
      getVideos();
    }
  }, [cleared, getVideos]);

  return { videos, searchResults, loading, error, refetch: getVideos };
}
