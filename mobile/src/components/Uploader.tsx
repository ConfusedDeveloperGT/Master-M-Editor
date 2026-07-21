import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

interface UploaderProps {
  sessionId: string;
  onCancel: () => void;
}

export function Uploader({ sessionId, onCancel }: UploaderProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      base64: true, // Need base64 to upload via Supabase JS on React Native
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadVideo(result.assets[0]);
    }
  };

  const uploadVideo = async (asset: ImagePicker.ImagePickerAsset) => {
    setStatus('uploading');
    try {
      const fileExt = asset.uri.split('.').pop() || 'mp4';
      const fileName = `${sessionId}-${Math.random()}.${fileExt}`;

      // If base64 is available, decode it. Otherwise, fetch the blob.
      let fileData;
      if (asset.base64) {
        fileData = decode(asset.base64);
      } else {
        const response = await fetch(asset.uri);
        fileData = await response.blob();
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('editor-uploads')
        .upload(fileName, fileData, {
          contentType: `video/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('editor-uploads')
        .getPublicUrl(fileName);

      // Update the session in Database
      const { error: dbError } = await supabase
        .from('qr_sessions')
        .update({ video_url: publicUrl, status: 'completed' })
        .eq('session_id', sessionId);

      if (dbError) throw dbError;

      setStatus('success');
      // Auto-cancel after 3 seconds on success
      setTimeout(() => onCancel(), 3000);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Failed to upload video');
      setStatus('error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connected!</Text>
      <Text style={styles.subtitle}>Session ID: {sessionId.slice(0, 8)}...</Text>
      
      {status === 'idle' && (
        <>
          <TouchableOpacity style={styles.button} onPress={pickVideo}>
            <Text style={styles.buttonText}>Select Video to Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'uploading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Uploading to Editor...</Text>
        </View>
      )}

      {status === 'success' && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Upload Complete!</Text>
          <Text style={styles.subtitle}>Check your web browser.</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {errorMessage}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setStatus('idle')}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f1115',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#2a2e37',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#e2e8f0',
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    color: '#4ade80',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 24,
    textAlign: 'center',
  },
});
