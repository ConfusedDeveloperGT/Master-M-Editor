import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Camera, CameraView } from 'expo-camera';

interface ScannerProps {
  onScanSuccess: (sessionId: string) => void;
}

export function Scanner({ onScanSuccess }: ScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    // Expecting URL like: http://localhost:3000/upload?session=1234
    try {
      const url = new URL(data);
      const session = url.searchParams.get('session');
      if (session) {
        onScanSuccess(session);
      } else {
        alert('Invalid QR Code. No session found.');
        setTimeout(() => setScanned(false), 2000);
      }
    } catch (e) {
      alert('Invalid QR Code format.');
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (hasPermission === null) {
    return <Text style={styles.text}>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.instructionText}>
          Scan the QR Code on your Master M Editor
        </Text>
      </View>
      
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    color: '#e2e8f0',
    textAlign: 'center',
    marginTop: 50,
  },
});
