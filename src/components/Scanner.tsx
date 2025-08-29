import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Guest, ScanResult } from '../types';
import { decodeQRCode } from '../utils/qrCodeGenerator';
import { colors, spacing, typography, borderRadius } from '../constants/styles';

const { width, height } = Dimensions.get('window');

interface ScannerProps {
  visible: boolean;
  guests: Guest[];
  partyCode: string | null;
  onClose: () => void;
  onScanSuccess: (guest: Guest, result: ScanResult) => void;
}

const Scanner: React.FC<ScannerProps> = ({
  visible,
  guests,
  partyCode,
  onClose,
  onScanSuccess,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraRef, setCameraRef] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      if (!permission?.granted) {
        requestPermission();
      }
      setScanned(false);
      setScanResult(null);
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    Vibration.vibrate(100); // Vibrazione per feedback

    try {
      // Decodifica il QR code per ottenere i dati
      const qrData = decodeQRCode(data);
      
      if (!qrData) {
        const result: ScanResult = {
          status: 'invalid',
          message: 'QR Code non valido o formato non riconosciuto',
          guest: null,
        };
        setScanResult(result);
        return;
      }
      
      // Verifica che il codice festa corrisponda
      if (qrData.partyCode !== partyCode) {
        const result: ScanResult = {
          status: 'invalid',
          message: `QR Code per festa diversa (${qrData.partyCode})\nFesta attuale: ${partyCode}`,
          guest: qrData.name,
        };
        setScanResult(result);
        return;
      }
      
      // Trova l'ospite corrispondente al QR code
      const guest = guests.find(g => g.qrCode === data);

      if (!guest) {
        const result: ScanResult = {
          status: 'invalid',
          message: 'QR Code non presente in questa lista ospiti',
          guest: qrData.name,
        };
        setScanResult(result);
        return;
      }

      if (guest.scanned) {
        const result: ScanResult = {
          status: 'used',
          message: `QR Code già utilizzato il ${guest.scanTime}`,
          guest: guest.name,
        };
        setScanResult(result);
        return;
      }

      // Determina il risultato in base allo stato di pagamento
      let result: ScanResult;
      if (guest.paid) {
        result = {
          status: 'success',
          message: '✅ Può entrare - Pagamento già effettuato',
          guest: guest.name,
        };
      } else {
        result = {
          status: 'payment',
          message: '💰 Deve effettuare il pagamento all\'ingresso',
          guest: guest.name,
        };
      }

      setScanResult(result);
      onScanSuccess(guest, result);

    } catch (error) {
      const result: ScanResult = {
        status: 'invalid',
        message: 'Errore nella lettura del QR Code',
        guest: null,
      };
      setScanResult(result);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanResult(null);
  };

  const handleClose = () => {
    setScanned(false);
    setScanResult(null);
    onClose();
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible transparent>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Richiesta permessi per la fotocamera...
          </Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible transparent>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.permissionTitle}>
            Accesso alla fotocamera negato
          </Text>
          <Text style={styles.permissionText}>
            Per scansionare i QR codes è necessario l'accesso alla fotocamera.
            Vai nelle impostazioni per attivarlo.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide">
      <View style={styles.container}>
        {/* Camera View */}
        <CameraView
          ref={ref => setCameraRef(ref)}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'qr',
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code39',
              'code93',
              'code128',
              'pdf417',
              'aztec',
              'datamatrix',
            ],
          }}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scanner QR Code</Text>
            <View style={styles.headerButton} />
          </View>

          {/* Scan Frame */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              {/* Corner borders */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanInstructions}>
              Inquadra il QR code dell'ospite
            </Text>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            {scanned && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={handleScanAgain}
              >
                <Ionicons name="refresh" size={24} color={colors.primary} />
                <Text style={styles.scanAgainText}>Scansiona di nuovo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Result Modal */}
        <Modal visible={!!scanResult} transparent animationType="fade">
          <View style={styles.resultOverlay}>
            <View style={[
              styles.resultContainer,
              {
                backgroundColor: 
                  scanResult?.status === 'success' ? colors.success :
                  scanResult?.status === 'payment' ? colors.warning :
                  colors.danger
              }
            ]}>
              <View style={styles.resultIcon}>
                <Ionicons
                  name={
                    scanResult?.status === 'success' ? 'checkmark-circle' :
                    scanResult?.status === 'payment' ? 'cash' :
                    scanResult?.status === 'used' ? 'time' :
                    'close-circle'
                  }
                  size={48}
                  color={colors.white}
                />
              </View>

              {scanResult?.guest && (
                <Text style={styles.resultGuestName}>
                  {scanResult.guest}
                </Text>
              )}

              <Text style={styles.resultMessage}>
                {scanResult?.message}
              </Text>

              <TouchableOpacity
                style={styles.resultCloseButton}
                onPress={() => setScanResult(null)}
              >
                <Text style={styles.resultCloseText}>Continua</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanInstructions: {
    marginTop: spacing.xl,
    fontSize: typography.sizes.md,
    color: colors.white,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  bottomActions: {
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  scanAgainText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: typography.sizes.md,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.sizes.xl,
  },
  closeButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  closeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  resultContainer: {
    alignItems: 'center',
    padding: spacing.xxxl,
    borderRadius: borderRadius.xl,
    minWidth: 300,
  },
  resultIcon: {
    marginBottom: spacing.lg,
  },
  resultGuestName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resultMessage: {
    fontSize: typography.sizes.lg,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.sizes.xxl,
  },
  resultCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resultCloseText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});

export default Scanner;