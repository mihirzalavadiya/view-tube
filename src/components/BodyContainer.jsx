import React from 'react';
import ButtonList from './ButtonList';
import { useSelector } from 'react-redux';
import VideoContainer from './VideoContainer';
import useIsMobile from '@/hooks/useIsMobile';

const BodyContainer = () => {
  const effectiveSidebarOpen = useSelector(
    (state) => state.theme?.sidebarOpen ?? true
  );
  const darkMode = useSelector((state) => state.theme.darkMode);
  const isMobile = useIsMobile();

  const sidebarOpen = isMobile ? false : effectiveSidebarOpen;

  return (
    <div
      className={`${sidebarOpen ? 'ml-62' : 'ml-14'} ${
        darkMode ? ' text-white' : ' text-gray-800'
      } transition-all duration-300 ease-in-out`}
    >
      <ButtonList />
      <VideoContainer />
    </div>
  );
};

export default BodyContainer;
