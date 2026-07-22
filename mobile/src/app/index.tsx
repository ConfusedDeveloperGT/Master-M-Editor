import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PreviewPlayer } from '@/components/PreviewPlayer';
import { Timeline } from '@/components/Timeline';
import { MediaBin } from '@/components/MediaBin';

export default function HomeScreen() {
  const router = useRouter();

  const handleExport = () => {
    Alert.alert(
      "Export Not Supported",
      "Native exporting with FFmpeg requires compiling the app using a custom development client (EAS Build). It's currently disabled in this preview."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Master M - Mobile Editor</Text>
        <View style={styles.headerActions}>
           <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/scanner')}>
             <Text style={styles.headerBtnText}>Scan QR</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.headerBtn, styles.exportBtn]} onPress={handleExport}>
             <Text style={styles.headerBtnText}>Export</Text>
           </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.workspace}>
         <PreviewPlayer />
      </View>

      <Timeline />
      
      <MediaBin />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerBtn: {
    backgroundColor: '#2a2e37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  exportBtn: {
    backgroundColor: '#6366f1',
  },
  headerBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  workspace: {
    flex: 1,
    backgroundColor: '#000',
  }
});
