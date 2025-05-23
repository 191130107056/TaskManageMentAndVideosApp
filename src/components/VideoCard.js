// src/components/VideoCard.js
import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import {useDispatch} from 'react-redux';
import {addDownloaded} from '../redux/slices/videosSlice';
import colors from '../utils/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

const VideoCard = React.memo(({video, isDownloaded, isOffline}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const dispatch = useDispatch();

  const handleDownload = useCallback(async () => {
    if (isOffline) {
      Alert.alert(
        'Offline Mode',
        'Cannot download videos while offline. Please connect to the internet and try again.',
      );
      return;
    }

    try {
      // Handle permissions for Android
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // Android 13 and above
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        } else {
          // Android 12 and below
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        }
      }

      // If permission granted, proceed with download
      setDownloading(true);
      const path = `${RNFS.DocumentDirectoryPath}/${video.id}.mp4`;

      const exists = await RNFS.exists(path);
      if (exists) {
        Alert.alert(
          'File Exists',
          'This video is already downloaded. Do you want to download it again?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Download Again',
              onPress: async () => {
                await RNFS.unlink(path);
                await handleDownload();
              },
            },
          ],
        );
        setDownloading(false);
        return;
      }

      const ret = RNFS.downloadFile({
        fromUrl: video.videoUrl,
        toFile: path,
        progress: res => setProgress(res.bytesWritten / res.contentLength),
        progressDivider: 10,
      });

      const result = await ret.promise;
      if (result.statusCode === 200) {
        dispatch(addDownloaded({...video, localPath: path}));
      } else {
        // throw new Error('Download failed');
        alert('ese');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', error.message);
    } finally {
      setDownloading(false);
    }
  }, [video, dispatch, isOffline]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgress = data => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = data => {
    setDuration(data.duration);
  };

  const handleSeek = value => {
    videoRef.current?.seek(value);
  };

  const renderVideoControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setPaused(!paused)}>
          <Icon name={paused ? 'play' : 'pause'} size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowPlayer(false)}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionButtons = () => {
    if (isDownloaded) {
      return (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setShowPlayer(true)}>
          <Text style={styles.btnText}>Play Offline</Text>
        </TouchableOpacity>
      );
    }

    if (downloading) {
      return (
        <View style={styles.btn}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.btnText}>{Math.round(progress * 100)}%</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.btn, isOffline && styles.btnDisabled]}
        onPress={handleDownload}
        disabled={isOffline}>
        <Text style={[styles.btnText, isOffline && styles.btnTextDisabled]}>
          {isOffline ? 'Offline' : 'Download'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      <Image source={{uri: video.thumbnailUrl}} style={styles.thumb} />
      <View style={styles.content}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.meta}>
          {video.duration} • {video.author}
        </Text>
        <View style={styles.row}>{renderActionButtons()}</View>
      </View>
      <Modal
        visible={showPlayer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlayer(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{
                uri: isDownloaded
                  ? `${RNFS.DocumentDirectoryPath}/${video.id}.mp4`
                  : video.videoUrl,
              }}
              style={styles.video}
              resizeMode="contain"
              onProgress={handleProgress}
              onLoad={handleLoad}
              paused={paused}
              onEnd={() => {
                setPaused(true);
                setCurrentTime(0);
              }}
            />
            {renderVideoControls()}
          </View>
        </View>
      </Modal>
    </View>
  );
});

VideoCard.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    videoUrl: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
  }).isRequired,
  isDownloaded: PropTypes.bool,
  isOffline: PropTypes.bool,
};

VideoCard.defaultProps = {
  isDownloaded: false,
  isOffline: false,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumb: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  btnDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  btnTextDisabled: {
    color: '#fff',
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    padding: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
});

export default VideoCard;
