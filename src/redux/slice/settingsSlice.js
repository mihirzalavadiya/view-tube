import { createSlice } from '@reduxjs/toolkit';

// The DOM attribute set by the _document.js pre-paint script is the source of
// truth on first render; hydrateTheme copies it into the store on mount so the
// two never disagree. The rail toggle goes through setTheme/toggleTheme.
const settingsSlice = createSlice({
  name: 'theme',
  initialState: { theme: 'dark' },
  reducers: {
    hydrateTheme: (state, action) => {
      state.theme = action.payload === 'light' ? 'light' : 'dark';
    },
    setTheme: (state, action) => {
      state.theme = action.payload === 'light' ? 'light' : 'dark';
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { hydrateTheme, setTheme, toggleTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
