import {createSlice} from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isOffline: false,
  },
  reducers: {
    setOffline: (state, action) => {
      state.isOffline = action.payload;
    },
  },
});

export const {setOffline} = appSlice.actions;
export default appSlice.reducer;
