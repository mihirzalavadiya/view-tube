import { configureStore } from '@reduxjs/toolkit';
import darkModeReducer from './slice/settingsSlice';
import videoListReducer from './slice/videoListSlice';
import cacheResultReducer from './slice/searchSlice';
import addMessageReducer from './slice/liveChatSlice';

const appStore = configureStore({
  reducer: {
    theme: darkModeReducer,
    videoList: videoListReducer,
    search: cacheResultReducer,
    livechat: addMessageReducer,
  },
});

export default appStore;
