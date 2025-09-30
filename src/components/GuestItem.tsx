import React, { useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Guest, Party } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/styles';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface GuestItemProps {
  guest: Guest;
  party: Party;
  onTogglePaid: (id: number) => void; // Toggle "paid / not paid" state
  onRemove: (id: number) => void;     // Remove guest from list
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onLongPress?: (id: number) => void;
  onSelect?: (id: number) => void;
  qrRef?: React.RefObject<ViewShot>;
}

const GuestItem: React.FC<GuestItemProps> = ({ 
  guest, 
  party,
  onTogglePaid, 
  onRemove,
  isMultiSelectMode = false,
  isSelected = false,
  onLongPress,
  onSelect,
  qrRef
}) => {
  const internalViewShotRef = useRef<any>(null);
  const viewShotRef = qrRef || internalViewShotRef;

   /**
   * Capture QR code with guest name and share it
   */
  const shareQrCode = async () => {
    if (viewShotRef.current) {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri); // Open system share dialog
    }
  };

  const handlePress = () => {
    if (isMultiSelectMode && onSelect) {
      onSelect(guest.id);
    }
  };

  const handleLongPress = () => {
    if (!guest.scanned && onLongPress) {
      onLongPress(guest.id);
    }
  };

  return (
    <TouchableOpacity 
      key={`${guest.id}-${isSelected}-${isMultiSelectMode}`}
      style={[
        styles.container,
        guest.scanned && styles.containerScanned,
        isSelected && styles.containerSelected
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={guest.scanned}
      activeOpacity={0.7}
    >
      {isMultiSelectMode && (
        <View style={styles.selectionIndicator}>
          <View style={[
            styles.checkboxContainer,
            isSelected && styles.checkboxSelected
          ]}>
            {isSelected && (
              <Ionicons 
                name="checkmark" 
                size={16} 
                color={colors.white} 
              />
            )}
          </View>
        </View>
      )}
      
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
          style={{ position: 'absolute', left: -9999, width: 350, height: 500, backgroundColor: colors.white, padding: 20, borderRadius: 20 }}
        >
          {/* Event Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, textAlign: 'center' }}>
              {party.name}
            </Text>
            {party.startTime && (
              <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4, textAlign: 'center' }}>
                {new Date(party.startTime).toLocaleString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            )}
          </View>

          {/* Event Photo */}
          {party.eventPhoto && (
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Image 
                source={{ uri: party.eventPhoto }}
                style={{ width: 280, height: 80, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Guest Name */}
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text.primary, marginBottom: 16, textAlign: 'center' }}>
            {guest.name}
          </Text>

          {/* QR Code */}
          <View style={{ alignItems: 'center' }}>
            <QRCode
              value={guest.qrCode}
              size={180}
              backgroundColor={colors.white}
            />
          </View>
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
    </TouchableOpacity>
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
    overflow: 'hidden',
    ...shadows.sm,
  },
  containerScanned: {
    backgroundColor: colors.gray[50],
    opacity: 0.8,
  },
  containerSelected: {
    backgroundColor: '#E3F2FD', // Light blue background
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectionIndicator: {
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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