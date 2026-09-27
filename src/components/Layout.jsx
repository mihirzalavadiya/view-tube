import React from 'react';
import Rail from './Rail';
import TopBar from './TopBar';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-bg font-sans text-ink">
    <Rail />
    {/* pb-16 on mobile clears the bottom tab bar */}
    <div className="min-w-0 flex-1 pb-16 md:pb-0">
      <TopBar />
      {children}
    </div>
  </div>
);

export default Layout;
