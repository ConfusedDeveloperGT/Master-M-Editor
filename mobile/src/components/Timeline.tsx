import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useEditorStore } from '@/store/editorStore';

const MAX_TIMELINE_SECONDS = 60;
const screenWidth = Dimensions.get('window').width;

export function Timeline() {
  const { timelineClips, currentTime, setCurrentTime, removeTimelineClip } = useEditorStore();

  const handleTimelinePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    // Assuming the timeline takes the full screen width minus padding if any, here it's full width
    const percentage = locationX / screenWidth;
    const newTime = Math.max(0, Math.min(percentage * MAX_TIMELINE_SECONDS, MAX_TIMELINE_SECONDS));
    setCurrentTime(newTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timeline</Text>
      <TouchableOpacity 
         style={styles.trackContainer} 
         activeOpacity={1} 
         onPress={handleTimelinePress}
      >
        <View style={styles.track}>
           {timelineClips.length === 0 && (
             <Text style={styles.emptyText}>Tap a clip in Media Bin to add here</Text>
           )}
           {timelineClips.map(clip => (
             <View
               key={clip.id}
               style={[
                 styles.clip,
                 {
                   left: `${(clip.start / MAX_TIMELINE_SECONDS) * 100}%`,
                   width: `${(clip.duration / MAX_TIMELINE_SECONDS) * 100}%`,
                 }
               ]}
             >
                <Text style={styles.clipText} numberOfLines={1}>Clip</Text>
                <TouchableOpacity onPress={() => removeTimelineClip(clip.id)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
             </View>
           ))}
           {/* Playhead */}
           <View 
             style={[
               styles.playhead, 
               { left: `${(currentTime / MAX_TIMELINE_SECONDS) * 100}%` }
             ]} 
           />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    backgroundColor: '#161921',
    borderTopWidth: 1,
    borderTopColor: '#2a2e37',
    paddingTop: 5,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
  trackContainer: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: '#0f1115',
    justifyContent: 'center',
  },
  track: {
    height: 50,
    width: '100%',
    backgroundColor: '#1e222b',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
  },
  clip: {
    position: 'absolute',
    height: '80%',
    top: '10%',
    backgroundColor: 'rgba(99, 102, 241, 0.5)',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  clipText: {
    color: 'white',
    fontSize: 10,
    flex: 1,
  },
  removeBtn: {
    padding: 2,
  },
  removeText: {
    color: '#ff4d4f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ec4899',
    zIndex: 10,
  }
});
