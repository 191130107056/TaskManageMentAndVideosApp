import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {storeData, getData} from '../../utils/storage';

const VIDEOS_URL =
  'https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json';
const STORAGE_KEY = 'downloadedVideos';

export const fetchVideos = createAsyncThunk('videos/fetchVideos', async () => {
  try {
    const response = await axios.get(VIDEOS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
  downloaded: [],
};

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setDownloaded: (state, action) => {
      state.downloaded = action.payload;
      storeData(STORAGE_KEY, state.downloaded);
    },
    addDownloaded: (state, action) => {
      const exists = state.downloaded.some(v => v.id === action.payload.id);
      if (!exists) {
        state.downloaded.push(action.payload);
        storeData(STORAGE_KEY, state.downloaded);
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchVideos.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {setDownloaded, addDownloaded} = videosSlice.actions;
export default videosSlice.reducer;
