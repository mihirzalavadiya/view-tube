// components/Sidebar.js
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import {
  BiBookReader,
  BiHistory,
  BiHome,
  BiLibrary,
  BiMovie,
  BiMusic,
  BiNews,
  BiTrendingUp,
} from 'react-icons/bi';
import { CgLock } from 'react-icons/cg';
import { FaThumbsUp, FaUserSecret } from 'react-icons/fa';
import { GrGamepad } from 'react-icons/gr';
import { LiaVideoSolid } from 'react-icons/lia';
import { MdSportsVolleyball } from 'react-icons/md';
import { SiYoutubeshorts } from 'react-icons/si';
import useIsMobile from '@/hooks/useIsMobile';

const Sidebar = ({ onClose }) => {
  const router = useRouter();
  const effectiveSidebarOpen = useSelector(
    (state) => state.theme?.sidebarOpen ?? true
  );
  const darkMode = useSelector((state) => state.theme?.darkMode ?? false);
  const isMobile = useIsMobile();

  const sidebarOpen = isMobile ? false : effectiveSidebarOpen;

  const menuItems = [
    {
      title: '',
      items: [
        { icon: BiHome, label: 'Home', href: '/' },
        { icon: SiYoutubeshorts, label: 'Shorts', href: '/shorts' },
        { icon: FaUserSecret, label: 'Subscriptions', href: '/subscriptions' },
      ],
    },
    {
      title: 'You',
      items: [
        { icon: BiHistory, label: 'History', href: '/history' },
        { icon: BiLibrary, label: 'Playlists', href: '/playlists' },
        { icon: LiaVideoSolid, label: 'Your videos', href: '/your-videos' },
        { icon: BiBookReader, label: 'Your courses', href: '/courses' },
        { icon: CgLock, label: 'Watch Later', href: '/watch-later' },
        { icon: FaThumbsUp, label: 'Liked videos', href: '/liked' },
      ],
    },
    {
      title: 'Explore',
      items: [
        { icon: BiTrendingUp, label: 'Trending', href: '/trending' },
        { icon: BiMusic, label: 'Music', href: '/music' },
        { icon: BiMovie, label: 'Films', href: '/films' },
        { icon: LiaVideoSolid, label: 'Live', href: '/live' },
        { icon: GrGamepad, label: 'Gaming', href: '/gaming' },
        { icon: BiNews, label: 'News', href: '/news' },
        { icon: MdSportsVolleyball, label: 'Sports', href: '/sports' },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      } shadow-lg border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className={`${sidebarOpen ? 'p-4' : 'p-2'}`}>
        <nav className="space-y-1">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sidebarOpen ? 'mb-6' : 'mb-4'}>
              {section.title && sidebarOpen && (
                <h2
                  className={`px-3 text-xs font-semibold uppercase mb-3 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {section.title}
                </h2>
              )}

              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  const isActive = router.pathname === item.href;

                  return (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className={`flex items-center rounded-lg transition-all duration-200 group relative ${
                          sidebarOpen
                            ? 'space-x-3 px-3 py-2.5'
                            : 'flex-col space-y-1 px-1 py-3 text-center'
                        } ${
                          isActive
                            ? darkMode
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : darkMode
                            ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        title={!sidebarOpen ? item.label : ''}
                      >
                        <IconComponent
                          size={sidebarOpen ? 20 : 24}
                          className={`flex-shrink-0 ${
                            isActive ? 'text-red-500' : ''
                          }`}
                        />
                        {sidebarOpen ? (
                          <span className="font-medium text-sm truncate">
                            {item.label}
                          </span>
                        ) : (
                          <span className="text-xs font-medium truncate w-full">
                            {item.label.split(' ')[0]}
                          </span>
                        )}

                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-full" />
                        )}

                        {/* Tooltip for collapsed state */}
                        {!sidebarOpen && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Separator line between sections when collapsed */}
              {!sidebarOpen && sectionIndex < menuItems.length - 1 && (
                <div
                  className={`my-4 mx-2 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </nav>

        {/* Footer Section - only show when expanded */}
        {sidebarOpen && (
          <div
            className={`mt-8 pt-4 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div
              className={`text-xs space-y-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <p>&copy; 2024 ViewTube</p>
              <div className="flex flex-wrap gap-2">
                <a href="#" className="hover:underline">
                  About
                </a>
                <a href="#" className="hover:underline">
                  Press
                </a>
                <a href="#" className="hover:underline">
                  Copyright
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
