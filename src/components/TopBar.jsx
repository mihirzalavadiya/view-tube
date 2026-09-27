import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { FiClock, FiSearch, FiX } from 'react-icons/fi';
import { addVideos, clearSearchResults } from '@/redux/slice/videoListSlice';
import useSearchSuggestions from '@/hooks/useSearchSuggestions';
import useSearchVideos from '@/hooks/useSearchVideos';
import useRecentSearches from '@/hooks/useRecentSearches';
import useWatchBudget from '@/hooks/useWatchBudget';
import WatchBudget from './WatchBudget';

const CRUMBS = {
  '/': 'For you',
  '/watch': 'Watching',
  '/shorts': 'Shorts',
};

const TopBar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const { suggestions } = useSearchSuggestions(query);
  const { searchVideos } = useSearchVideos();
  const { recent, remember, forget } = useRecentSearches();
  const budget = useWatchBudget();

  const crumb = CRUMBS[router.pathname] || 'Browsing';

  const runSearch = useCallback(
    async (raw) => {
      const term = (raw ?? query).trim();
      if (!term) return;

      setQuery(term);
      setOpen(false);
      inputRef.current?.blur();
      remember(term);

      if (router.pathname !== '/') await router.push('/');
      const videos = await searchVideos(term);
      dispatch(addVideos(videos));
    },
    [query, remember, router, searchVideos, dispatch]
  );

  // Click-outside closes the dropdown
  useEffect(() => {
    const onDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // "/" focuses search, per the design's keyboard spec
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== '/') return;
      const el = document.activeElement;
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) return;
      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const showRecent = !query && recent.length > 0;
  const showSuggestions = Boolean(query) && suggestions.length > 0;

  return (
    <header className="sticky top-0 z-[15] flex items-center gap-3 border-b border-line bg-bg px-[18px] py-4 md:gap-5 md:px-[34px]">
      <Link
        href="/"
        onClick={() => {
          setQuery('');
          dispatch(clearSearchResults());
        }}
        className="flex min-w-0 shrink-0 items-baseline gap-2.5 hover:text-ink"
      >
        <span className="font-display text-[23px] font-extrabold tracking-[-0.045em]">
          ViewTube
        </span>
        <span className="hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:inline">
          {crumb}
        </span>
      </Link>

      <div ref={wrapRef} className="relative w-full max-w-[560px] flex-1">
        <div className="flex items-center gap-2.5 rounded-full border border-transparent bg-surface2 px-4 py-2.5 transition-colors duration-200 focus-within:border-accent">
          <FiSearch size={16} className="shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search creators, courses, topics"
            aria-label="Search"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch();
              if (e.key === 'Escape') {
                setOpen(false);
                e.currentTarget.blur();
              }
            }}
            className="min-w-0 flex-1 border-0 bg-transparent font-sans text-[14.5px] text-ink outline-none placeholder:text-muted"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted hover:text-ink"
            >
              <FiX size={14} aria-hidden="true" />
            </button>
          ) : (
            <span
              aria-hidden="true"
              className="hidden shrink-0 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block"
            >
              /
            </span>
          )}
        </div>

        {open && (showRecent || showSuggestions) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-raised">
            {showRecent && (
              <>
                <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Recent
                </div>
                {recent.map((term) => (
                  <div
                    key={term}
                    className="group flex items-center rounded-lg hover:bg-surface2"
                  >
                    <button
                      type="button"
                      onClick={() => runSearch(term)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
                    >
                      <FiClock size={15} className="shrink-0 text-muted" aria-hidden="true" />
                      <span className="truncate text-sm text-ink">{term}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => forget(term)}
                      aria-label={`Remove ${term} from recent searches`}
                      className="mr-2 grid h-6 w-6 shrink-0 place-items-center rounded text-muted hover:bg-surface3 hover:text-ink"
                    >
                      <FiX size={13} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </>
            )}

            {showSuggestions && (
              <>
                <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Suggestions
                </div>
                {suggestions.slice(0, 8).map((suggestion, index) => {
                  const text = suggestion?.snippet?.title || suggestion;
                  return (
                    <button
                      key={`${text}-${index}`}
                      type="button"
                      onClick={() => runSearch(text)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface2"
                    >
                      <FiSearch size={15} className="shrink-0 text-muted" aria-hidden="true" />
                      <span className="truncate text-sm text-ink">{text}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      <WatchBudget
        ratio={budget.ratio}
        remainingMin={budget.remainingMin}
        limitMin={budget.limitMin}
        spent={budget.spent}
      />
    </header>
  );
};

export default TopBar;
