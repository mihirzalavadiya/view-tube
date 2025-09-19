import React, { useEffect, useState, useRef } from 'react';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUpload,
  FiSun,
  FiMoon,
  FiClock,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, toggleSidebar } from '../redux/slice/settingsSlice';
import {
  addSearchVideos,
  addVideos,
  clearSearchResults,
} from '@/redux/slice/videoListSlice';
import Link from 'next/link';
import useVideos from '@/hooks/useVideos';
import useSearchSuggestions from '@/hooks/useSearchSuggestions';
import useSearchVideos from '@/hooks/useSearchVideos';

const Header = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const { refetch } = useVideos();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Mock recent searches (you can replace with real data)
  const recentSearches = [
    'react tutorial',
    'javascript tips',
    'css animations',
  ];
  const trendingSearches = [
    'iPhone 16',
    'AI news',
    'space exploration',
    'cooking recipes',
  ];

  const { suggestions } = useSearchSuggestions(query);
  const { searchVideos } = useSearchVideos();

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    const videos = await searchVideos(searchQuery);
    dispatch(addVideos(videos));
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    const searchText = suggestion.snippet?.title || suggestion;
    setQuery(searchText);
    handleSearch(searchText);
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <>
      <header
        className={`flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3 shadow-lg transition-colors duration-200 ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
        } fixed top-0 left-0 right-0 z-50`}
      >
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            className={`p-2 ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }  rounded-full transition-colors`}
            onClick={() => dispatch(toggleSidebar())}
          >
            <FiMenu size={20} />
          </button>
          <Link
            href="/"
            onClick={() => {
              dispatch(clearSearchResults());
              refetch();
            }}
          >
            <div className="text-red-600 font-bold text-lg md:text-2xl whitespace-nowrap">
              ViewTube
            </div>
          </Link>
        </div>

        {/* Middle: Search bar */}
        <div className="flex-1 mx-2 sm:mx-4 relative" ref={searchRef}>
          <div
            className={`relative flex items-center border rounded-full transition-all duration-200 ${
              isSearchFocused
                ? 'border-blue-500 shadow-lg'
                : darkMode
                ? 'border-gray-600'
                : 'border-gray-300'
            }`}
          >
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setIsSearchFocused(true);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                  setIsSearchFocused(false);
                }
              }}
              className={`flex-1 px-4 py-2 sm:py-2.5 rounded-full focus:outline-none text-sm sm:text-base transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-white placeholder-gray-400'
                  : 'bg-white text-gray-900 placeholder-gray-500'
              }`}
            />

            {/* Clear Button */}
            {query && (
              <button
                onClick={clearSearch}
                className={`absolute right-12 p-1 ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } rounded-full transition-colors`}
              >
                <FiX size={16} className="text-gray-500" />
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={() => handleSearch()}
              className={`absolute right-2 p-2 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } rounded-full transition-colors ${
                query ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              <FiSearch size={18} />
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (isSearchFocused || query) && (
            <div
              ref={suggestionsRef}
              className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-2xl border z-50 max-h-96 overflow-y-auto transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Recent Searches (when no query) */}
              {!query && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <FiClock size={14} className="mr-2" />
                    Recent
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className={`w-full flex items-center px-3 py-2 text-left ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors rounded ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <FiClock
                        size={16}
                        className="mr-3 text-gray-400 flex-shrink-0"
                      />
                      <span className="truncate text-sm">{search}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remove from recent searches logic
                        }}
                        className={`ml-auto p-1 ${
                          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        } rounded opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <FiX size={12} className="text-gray-500" />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Trending Searches (when no query) */}
              {!query && trendingSearches.length > 0 && (
                <div
                  className={`p-2 border-t ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <FiTrendingUp size={14} className="mr-2" />
                    Trending
                  </div>
                  {trendingSearches.slice(0, 4).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className={`w-full flex items-center px-3 py-2 text-left ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors rounded ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <FiTrendingUp
                        size={16}
                        className="mr-3 text-red-500 flex-shrink-0"
                      />
                      <span className="truncate text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Query-based Suggestions */}
              {query && suggestions.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <FiSearch size={14} className="mr-2" />
                    Search suggestions
                  </div>
                  {suggestions.slice(0, 8).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center px-3 py-2 text-left ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors rounded group ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <FiSearch
                        size={16}
                        className="mr-3 text-gray-400 flex-shrink-0"
                      />
                      <span className="truncate text-sm">
                        {suggestion.snippet?.title || suggestion}
                      </span>
                      <span className="ml-auto text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ↵
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {query && suggestions.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <FiSearch size={24} className="mx-auto mb-2 opacity-50" />
                  No suggestions found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            className={`p-2 ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            } rounded-full transition-colors hidden sm:block`}
          >
            <FiUpload size={18} />
          </button>
          <button
            className={`p-2 ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            } rounded-full transition-colors`}
          >
            <FiBell size={18} />
          </button>
          <button
            className={`p-2 ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            } rounded-full transition-colors`}
            onClick={() => dispatch(toggleDarkMode())}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold ml-2">
            U
          </div>
        </div>
      </header>

      {/* Backdrop overlay when suggestions are open (mobile) */}
      {showSuggestions && (isSearchFocused || query) && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => {
            setShowSuggestions(false);
            setIsSearchFocused(false);
          }}
        />
      )}
    </>
  );
};

export default Header;
