import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useEditorStore } from '@/store/editorStore';

export function PreviewPlayer() {
  const { timelineClips, currentTime, isPlaying, setCurrentTime, setIsPlaying } = useEditorStore();
  const videoRef = useRef<Video>(null);

  const activeClip = timelineClips.find(
    (clip) => currentTime >= clip.start && currentTime < clip.end
  );

  useEffect(() => {
    if (!videoRef.current) return;
    
    const syncTime = async () => {
      if (activeClip) {
        const videoTime = (currentTime - activeClip.start) + activeClip.offset;
        const status = await videoRef.current?.getStatusAsync();
        if (status && status.isLoaded) {
          if (Math.abs((status.positionMillis / 1000) - videoTime) > 0.2) {
             await videoRef.current?.setPositionAsync(videoTime * 1000);
          }
        }
      }
    };
    syncTime();
  }, [currentTime, activeClip]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying && activeClip) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [isPlaying, activeClip]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && isPlaying) {
        if (activeClip) {
            const newTime = activeClip.start + (status.positionMillis / 1000) - activeClip.offset;
            // Prevent infinite loop by not updating if it's very close
            if (Math.abs(currentTime - newTime) > 0.1) {
               setCurrentTime(newTime);
            }
        }
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {activeClip ? (
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: activeClip.sourceUrl }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            shouldPlay={isPlaying}
          />
        ) : (
          <View style={styles.emptyVideo}>
             <Text style={styles.emptyText}>No media at this time</Text>
          </View>
        )}
      </View>
      <View style={styles.controls}>
        <Text style={styles.timeText}>{currentTime.toFixed(2)}s</Text>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
          <Text style={styles.playBtnText}>{isPlaying ? '⏸ Pause' : '▶ Play'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    flexDirection: 'column',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  emptyVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#0f1115',
  },
  timeText: {
    color: '#e2e8f0',
    fontFamily: 'monospace',
    marginRight: 20,
    fontSize: 16,
  },
  playBtn: {
    backgroundColor: '#2a2e37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  playBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
