import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hydrateTheme, toggleTheme } from '@/redux/slice/settingsSlice';

/**
 * Keeps the redux theme, the <html data-vt> attribute and localStorage in sync.
 * _document.js has already written the attribute before paint, so on mount we
 * read it back rather than re-deciding (which would cause a flash).
 */
export default function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    const fromDom = document.documentElement.getAttribute('data-vt');
    dispatch(hydrateTheme(fromDom === 'light' ? 'light' : 'dark'));
    // mount only — the pre-paint script owns the initial value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-vt', theme);
    try {
      localStorage.setItem('vt-theme', theme);
    } catch (e) {
      // private mode / blocked storage — the attribute still applies
    }
  }, [theme]);

  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);

  return { theme, toggle };
}
