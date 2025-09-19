import { cacheResults } from '@/redux/slice/searchSlice';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useSearchSuggestions = (query) => {
  //   const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const cachedSuggestions = useSelector((state) => state.search[query]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    if (cachedSuggestions) return;
    console.log('Fetching new suggestions for:', cachedSuggestions);

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${query}`);
        const data = await res.json();
        dispatch(cacheResults({ [query]: data[1] || [] }));
        console.log('Fetched suggestions:', data[1]);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // fallback mock data
        dispatch(
          cacheResults({
            [query]: [
              { snippet: { title: `${query} tutorial` } },
              { snippet: { title: `${query} guide` } },
              { snippet: { title: `${query} tips` } },
              { snippet: { title: `${query} 2024` } },
              { snippet: { title: `best ${query}` } },
            ],
          })
        );
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [query, cachedSuggestions, dispatch]);

  return { suggestions: cachedSuggestions || [], loading };
};

export default useSearchSuggestions;
