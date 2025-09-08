// components/Layout.js
import React from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const sidebarOpen = useSelector((state) => state.theme?.sidebarOpen ?? true);
  const darkMode = useSelector((state) => state.theme?.darkMode ?? false);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 p-4 sm:p-4 w-full transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'ml-0' : 'ml-0'
          } ${darkMode ? 'text-white' : ' text-gray-800'}`}
        >
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {/* {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )} */}
    </div>
  );
};

export default Layout;
