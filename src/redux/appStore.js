import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slice/settingsSlice';
import videoListReducer from './slice/videoListSlice';
import cacheResultReducer from './slice/searchSlice';
import addMessageReducer from './slice/liveChatSlice';

const appStore = configureStore({
  reducer: {
    theme: settingsReducer,
    videoList: videoListReducer,
    search: cacheResultReducer,
    livechat: addMessageReducer,
  },
});

export default appStore;
