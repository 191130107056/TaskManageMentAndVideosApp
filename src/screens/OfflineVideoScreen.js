// src/screens/OfflineVideoScreen.js
import React, {useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import VideoCard from '../components/VideoCard';
import {fetchVideos} from '../redux/slices/videosSlice';
import colors from '../utils/colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function OfflineVideoScreen() {
  const {items, loading, error, downloaded} = useSelector(
    state => state.videos,
  );
  const dispatch = useDispatch();

  const loadVideos = useCallback(() => {
    console.log('Loading videos...');
    dispatch(fetchVideos());
  }, [dispatch]);

  useEffect(() => {
    console.log('Initial load of videos');
    loadVideos();
  }, [loadVideos]);

  console.log('Current state:', {loading, itemsCount: items?.length, error});

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon name="cloud-offline" size={50} color={colors.gray} />
      <Text style={styles.errorText}>
        {error ||
          'Unable to load videos. Please check your internet connection.'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadVideos}>
        <Icon name="refresh" size={20} color="#fff" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <VideoCard
            video={item}
            isDownloaded={!!downloaded.find(v => v.id === item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No Videos Found</Text>}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadVideos}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    color: colors.gray,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    color: colors.gray,
    marginTop: 50,
  },
});
