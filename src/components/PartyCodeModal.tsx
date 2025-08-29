import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/styles';

interface PartyCodeModalProps {
  visible: boolean;
  onConfirm: (partyCode: string) => void;
  onCancel?: () => void;
}

const PartyCodeModal: React.FC<PartyCodeModalProps> = ({ visible, onConfirm, onCancel }) => {
  const [partyCode, setPartyCode] = useState('');

  const handleConfirm = () => {
    const trimmedCode = partyCode.trim().toUpperCase();
    
    if (trimmedCode.length < 3) {
      Alert.alert('Errore', 'Il codice festa deve essere di almeno 3 caratteri');
      return;
    }

    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      Alert.alert('Errore', 'Il codice festa può contenere solo lettere e numeri');
      return;
    }

    onConfirm(trimmedCode);
    setPartyCode('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Ionicons name="calendar-outline" size={32} color={colors.primary} />
            <Text style={styles.title}>Codice Festa</Text>
            <Text style={styles.subtitle}>
              Inserisci un codice univoco per questa festa.{'\n'}
              Tutti i QR code saranno generati con questo codice.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Codice Festa</Text>
            <TextInput
              style={styles.input}
              value={partyCode}
              onChangeText={(text) => setPartyCode(text.toUpperCase())}
              placeholder="es. FESTA2025, MATRIMONIO, COMPLEANNO..."
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="characters"
              maxLength={20}
              autoFocus
            />
            <Text style={styles.inputHint}>
              Lettere e numeri, 3-20 caratteri
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              partyCode.trim().length < 3 && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={partyCode.trim().length < 3}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
            <Text style={styles.confirmButtonText}>Conferma</Text>
          </TouchableOpacity>

          {onCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setPartyCode('');
                onCancel();
              }}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              Il codice festa garantisce che i QR code rimangano validi anche se rigenerati
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
  },
  inputHint: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  cancelButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.gray[600],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${colors.primary}10`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    lineHeight: 16,
  },
});

export default PartyCodeModal;
