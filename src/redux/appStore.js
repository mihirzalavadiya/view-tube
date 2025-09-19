import { configureStore } from '@reduxjs/toolkit';
import darkModeReducer from './slice/settingsSlice';
import videoListReducer from './slice/videoListSlice';
import cacheResultReducer from './slice/searchSlice';

const appStore = configureStore({
  reducer: {
    theme: darkModeReducer,
    videoList: videoListReducer,
    search: cacheResultReducer,
  },
});

export default appStore;
