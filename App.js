import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import {fetchTasks} from './src/redux/slices/tasksSlice';
import {fetchVideos, setDownloaded} from './src/redux/slices/videosSlice';
import store from './src/redux/store';
import {setOffline} from './src/redux/slices/appSlice';
import AppNavigator from './src/navigation/AppNavigator';
import {NavigationContainer} from '@react-navigation/native';
import {getData} from './src/utils/storage';

export default function App() {
  useEffect(() => {
    // Load persisted videos
    (async () => {
      try {
        const downloaded = await getData('downloadedVideos');
        if (downloaded) {
          store.dispatch(setDownloaded(downloaded));
        }
      } catch (error) {
        console.error('Error loading persisted videos:', error);
      }
    })();

    // Fetch tasks and videos
    store.dispatch(fetchTasks());
    store.dispatch(fetchVideos());

    // Listen for offline/online
    const unsubscribe = NetInfo.addEventListener(state => {
      store.dispatch(setOffline(!state.isConnected));
    });
    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
