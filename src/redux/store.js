import {configureStore} from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import videosReducer from './slices/videosSlice';
import appReducer from './slices/appSlice';

export default configureStore({
  reducer: {
    tasks: tasksReducer,
    videos: videosReducer,
    app: appReducer,
  },
});
