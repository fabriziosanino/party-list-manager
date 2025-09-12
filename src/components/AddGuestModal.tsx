import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewGuest, GuestList } from '../types';
import { colors, spacing, typography, borderRadius, shadows, globalStyles } from '../constants/styles';

interface AddGuestModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (guest: NewGuest) => void;
  guestLists: GuestList[];
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({
  visible,
  onClose,
  onAdd,
  guestLists,
}) => {
  const [guest, setGuest] = useState<NewGuest>({ 
    name: '', 
    paid: false, 
    listId: guestLists[0]?.id || '' 
  });
  const [nameError, setNameError] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setGuest({ 
        name: '', 
        paid: false, 
        listId: guestLists[0]?.id || '' 
      });
      setNameError('');
    }
  }, [visible, guestLists]);

  const handleNameChange = (text: string) => {
    setGuest(prev => ({ ...prev, name: text }));
    if (nameError) {
      setNameError('');
    }
  };

  const handleAddGuest = () => {
    const trimmedName = guest.name.trim();
    
    if (!trimmedName) {
      setNameError('Il nome è obbligatorio');
      return;
    }

    if (trimmedName.length < 2) {
      setNameError('Il nome deve avere almeno 2 caratteri');
      return;
    }

    onAdd({ ...guest, name: trimmedName });
    onClose();
  };

  const handleCancel = () => {
    setGuest({ 
      name: '', 
      paid: false, 
      listId: guestLists[0]?.id || '' 
    });
    setNameError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Aggiungi Nuovo Ospite</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome ospite *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  nameError ? styles.textInputError : null
                ]}
                placeholder="Inserisci il nome dell'ospite"
                value={guest.name}
                onChangeText={handleNameChange}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
              />
              {nameError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{nameError}</Text>
                </View>
              ) : null}
            </View>

            {/* List Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lista</Text>
              <View style={styles.listSelector}>
                {guestLists.map((list) => (
                  <TouchableOpacity
                    key={list.id}
                    style={[
                      styles.listOption,
                      guest.listId === list.id && styles.listOptionSelected
                    ]}
                    onPress={() => setGuest(prev => ({ ...prev, listId: list.id }))}
                  >
                    <View 
                      style={[
                        styles.listColorIndicator, 
                        { backgroundColor: list.color }
                      ]} 
                    />
                    <Text style={[
                      styles.listOptionText,
                      guest.listId === list.id && styles.listOptionTextSelected
                    ]}>
                      {list.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Ha già pagato</Text>
                <Text style={styles.switchDescription}>
                  Attiva se l'ospite ha già effettuato il pagamento
                </Text>
              </View>
              <Switch
                value={guest.paid}
                onValueChange={(value) => setGuest(prev => ({ ...prev, paid: value }))}
                trackColor={{ 
                  false: colors.gray[300], 
                  true: `${colors.success}50` 
                }}
                thumbColor={guest.paid ? colors.success : colors.gray[500]}
                ios_backgroundColor={colors.gray[300]}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddGuest}
            >
              <Ionicons name="person-add" size={18} color={colors.white} />
              <Text style={styles.addButtonText}>Aggiungi Ospite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
  },
  closeButton: {
    padding: spacing.xs,
  },
  form: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
  },
  textInput: {
    ...globalStyles.input,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  textInputError: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.danger,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.lg,
  },
  switchLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  switchDescription: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    lineHeight: typography.sizes.sm,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.xl,
    paddingTop: 0,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  listSelector: {
    marginTop: spacing.xs,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  listOptionSelected: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  listColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  listOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  listOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});

export default AddGuestModal;