import { createSlice } from '@reduxjs/toolkit';

const darkModeSlice = createSlice({
  name: 'theme',
  initialState: { darkMode: false, sidebarOpen: true },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleDarkMode, toggleSidebar } = darkModeSlice.actions;
export default darkModeSlice.reducer;
