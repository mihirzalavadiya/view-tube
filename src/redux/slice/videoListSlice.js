import { createSlice } from '@reduxjs/toolkit';

const videoListSlice = createSlice({
  name: 'videoList',
  initialState: { videos: [], searchResults: [], cleared: false },
  reducers: {
    addVideos: (state, action) => {
      state.videos = action.payload;
      state.cleared = false;
    },
    addSearchVideos: (state, action) => {
      state.searchResults = action.payload;
      state.cleared = false;
    },
    clearSearchResults: (state) => {
      state.videos = [];
      state.cleared = true;
    },
    resetCleared: (state) => {
      state.cleared = false;
    },
  },
});

export const { addVideos, addSearchVideos, clearSearchResults, resetCleared } =
  videoListSlice.actions;
export default videoListSlice.reducer;
