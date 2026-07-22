import React from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Scanner } from '@/components/Scanner';
import { useRouter } from 'expo-router';

export default function ScannerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Editor</Text>
      </TouchableOpacity>
      <Scanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  backButton: {
    padding: 20,
    backgroundColor: '#1e222b',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  backText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
