import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Scanner } from '@/components/Scanner';
import { Uploader } from '@/components/Uploader';

export default function HomeScreen() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  if (sessionId) {
    return <Uploader sessionId={sessionId} onCancel={() => setSessionId(null)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Master M Companion</Text>
      </View>
      
      <Scanner onScanSuccess={setSessionId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2e37',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
});
