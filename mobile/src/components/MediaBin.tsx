import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEditorStore } from '@/store/editorStore';
import { Ionicons } from '@expo/vector-icons';

export function MediaBin() {
  const { importedMedia, addImportedMedia, addTimelineClip, timelineClips } = useEditorStore();

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      addImportedMedia(result.assets[0].uri);
    }
  };

  const handleAddClip = (url: string) => {
    const lastClip = timelineClips[timelineClips.length - 1];
    const startTime = lastClip ? lastClip.end : 0;
    const duration = 5; // Default stub duration

    addTimelineClip({
      sourceUrl: url,
      type: 'video',
      start: startTime,
      end: startTime + duration,
      duration: duration,
      offset: 0
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Media Bin</Text>
        <TouchableOpacity style={styles.importBtn} onPress={pickVideo}>
          <Text style={styles.importBtnText}>+ Import</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {importedMedia.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No media imported.</Text>
          </View>
        ) : (
          importedMedia.map((url, i) => (
            <TouchableOpacity key={i} style={styles.mediaItem} onPress={() => handleAddClip(url)}>
               {/* Displaying a placeholder for video thumbnail in Media Bin */}
               <View style={styles.mediaPlaceholder}>
                  <Ionicons name="videocam" size={24} color="#6366f1" />
               </View>
               <View style={styles.addOverlay}>
                  <Text style={styles.addText}>Tap to add</Text>
               </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    backgroundColor: '#1e222b',
    borderTopWidth: 1,
    borderTopColor: '#2a2e37',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  title: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  importBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  importBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  mediaItem: {
    width: 100,
    height: 80,
    marginRight: 10,
    backgroundColor: '#0f1115',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2e37',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  addText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
