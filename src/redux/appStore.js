import { configureStore } from '@reduxjs/toolkit';
import darkModeReducer from './slice/settingsSlice';
import videoListReducer from './slice/videoListSlice';

const appStore = configureStore({
  reducer: {
    theme: darkModeReducer,
    videoList: videoListReducer,
  },
});

export default appStore;
