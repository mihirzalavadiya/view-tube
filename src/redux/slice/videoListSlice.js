import { createSlice } from '@reduxjs/toolkit';

const videoListSlice = createSlice({
  name: 'videoList',
  initialState: { videos: [], cleared: false },
  reducers: {
    addVideos: (state, action) => {
      state.videos = action.payload;
      state.cleared = false;
    },
    // Clicking the wordmark drops the current results so useVideos refetches
    // the default feed.
    clearSearchResults: (state) => {
      state.videos = [];
      state.cleared = true;
    },
  },
});

export const { addVideos, clearSearchResults } = videoListSlice.actions;
export default videoListSlice.reducer;
