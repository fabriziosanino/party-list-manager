import React, { useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Guest } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/styles';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface GuestItemProps {
  guest: Guest;
  onTogglePaid: (id: number) => void; // Toggle "paid / not paid" state
  onRemove: (id: number) => void;     // Remove guest from list
}

const GuestItem: React.FC<GuestItemProps> = ({ 
  guest, 
  onTogglePaid, 
  onRemove
}) => {
  const viewShotRef = useRef<any>(null);

   /**
   * Capture QR code with guest name and share it
   */
  const shareQrCode = async () => {
    if (viewShotRef.current) {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri); // Open system share dialog
    }
  };

  return (
    <View style={[
      styles.container,
      guest.scanned && styles.containerScanned
    ]}>
      <View style={styles.guestInfo}>
        <Text
          style={[
            styles.guestName,
            guest.scanned && styles.guestNameScanned,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {guest.name}
        </Text>
        {guest.scanTime && (
          <View style={styles.scanInfo}>
            <Ionicons 
              name="time-outline" 
              size={14} 
              color={colors.gray[500]} 
            />
            <Text style={styles.scanTime}>
              {guest.scanTime}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.paidButton,
            guest.paid ? styles.paidButtonActive : styles.paidButtonInactive
          ]}
          onPress={() => onTogglePaid(guest.id)}
        >
          <Ionicons
            name="cash"
            size={16}
            color={guest.paid ? '#22c55e' : '#ef4444'}
          />
        
        </TouchableOpacity>

        {/* Share QR Code Button */}
        {guest.scanTime == null && (
        <TouchableOpacity style={styles.paidButton} onPress={shareQrCode}>
          <Ionicons name="share-social-outline" size={16} color={colors.primary} />
          <Text style={[styles.paidText, { color: colors.primary }]}></Text>
        </TouchableOpacity>
        )}

        {/* Hidden exportable view with name and QR code on white background */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
          style={{ position: 'absolute', left: -9999, width: 300, height: 380, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 20 }}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text.primary, marginBottom: 24, textAlign: 'center' }}>{guest.name}</Text>
          <QRCode
            value={guest.qrCode}
            size={200}
            backgroundColor={colors.white}
          />
        </ViewShot>

        {guest.scanned && (
          <View style={styles.enteredBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.enteredText}>Entrato</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onRemove(guest.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  containerScanned: {
    backgroundColor: colors.gray[50],
    opacity: 0.8,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
  },
  guestNameScanned: {
    textDecorationLine: 'line-through',
    color: colors.gray[500],
  },
  scanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  scanTime: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  paidButtonActive: {
    backgroundColor: '#22c55e30', // Verde con 30% opacità - più visibile
  },
  paidButtonInactive: {
    backgroundColor: '#ef444430', // Rosso con 30% opacità - più visibile
  },
  paidText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  paidTextActive: {
    color: colors.success,
  },
  paidTextInactive: {
    color: colors.danger,
  },
  enteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  enteredText: {
    fontSize: typography.sizes.xs,
    color: colors.success,
    fontWeight: typography.weights.medium,
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
});

export default GuestItem;