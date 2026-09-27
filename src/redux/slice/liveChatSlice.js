import { createSlice } from '@reduxjs/toolkit';

const MAX_MESSAGES = 80;

const liveChatSlice = createSlice({
  name: 'livechat',
  initialState: {
    messages: [],
  },
  reducers: {
    // The poller re-sends everything the API returns each cycle, so incoming
    // ids are deduped against what is already in the list.
    addMessages: (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [action.payload];
      const seen = new Set(state.messages.map((m) => m.id));
      const fresh = incoming.filter((m) => m?.id && !seen.has(m.id));
      if (fresh.length === 0) return;

      state.messages.unshift(...fresh);
      if (state.messages.length > MAX_MESSAGES) {
        state.messages.length = MAX_MESSAGES;
      }
    },
    resetChat: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessages, resetChat } = liveChatSlice.actions;
export default liveChatSlice.reducer;
