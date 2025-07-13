import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useState, useEffect } from 'react';
import { X, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { lookupProduct } from '@/services/productService';
import { saveToHistory } from '@/services/historyService';

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required to scan barcodes
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned || scanning) return;
    
    setScanned(true);
    setScanning(true);

    try {
      console.log('Scanned barcode:', data);
      const product = await lookupProduct(data);
      
      if (product) {
        await saveToHistory({
          barcode: data,
          productName: product.product_name,
          grade: product.grade,
          timestamp: new Date().toISOString(),
        });
        
        router.push({
          pathname: '/product-result',
          params: { 
            barcode: data,
            productData: JSON.stringify(product)
          }
        });
      } else {
        Alert.alert(
          'Product Not Found',
          'This product is not in our database. Would you like to add it manually?',
          [
            { text: 'Cancel', onPress: () => resetScanner() },
            { 
              text: 'Add Manually', 
              onPress: () => {
                router.push({
                  pathname: '/manual-entry',
                  params: { barcode: data }
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      Alert.alert('Error', 'Failed to process barcode. Please try again.');
      resetScanner();
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(false);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTorch = () => {
    setTorch(current => !current);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'code128', 'code39'],
        }}
        torch={torch ? 'on' : 'off'}>
        
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scan Barcode</Text>
            <Text style={styles.headerSubtitle}>
              Position the barcode within the frame
            </Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>
              {scanning ? 'Processing...' : 'Point camera at barcode'}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleTorch}>
              {torch ? (
                <FlashlightOff size={24} color="#FFFFFF" />
              ) : (
                <Flashlight size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <RotateCcw size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => router.push('/manual-entry')}>
              <Text style={styles.controlButtonText}>Manual</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {scanning && (
        <Modal transparent={true} visible={scanning}>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Processing barcode...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginTop: 5,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#14B8A6',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 50,
    minWidth: 60,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '500',
  },
});