import { createSlice } from '@reduxjs/toolkit';

const liveChatSlice = createSlice({
  name: 'livechat',
  initialState: {
    messages: [],
  },
  reducers: {
    addMessage: (state, action) => {
      const newMessages = Array.isArray(action.payload)
        ? action.payload
        : [action?.payload];
      state.messages.unshift(...newMessages);
    },
  },
});

export const { addMessage } = liveChatSlice.actions;
export default liveChatSlice.reducer;
