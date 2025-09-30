import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Party } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/styles';

interface EventConfigModalProps {
  visible: boolean;
  onClose: () => void;
  party: Party;
  onUpdateParty: (party: Party) => void;
}

const EventConfigModal: React.FC<EventConfigModalProps> = ({
  visible,
  onClose,
  party,
  onUpdateParty,
}) => {
  const [eventPhoto, setEventPhoto] = useState<string>(party.eventPhoto || '');
  const [startTime, setStartTime] = useState<Date>(
    party.startTime ? new Date(party.startTime) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setEventPhoto(party.eventPhoto || '');
      setStartTime(party.startTime ? new Date(party.startTime) : new Date());
    }
  }, [visible, party]);

  const handleSave = () => {
    const updatedParty: Party = {
      ...party,
      eventPhoto: eventPhoto || undefined,
      startTime: startTime.toISOString(),
      lastModified: new Date().toISOString(),
    };

    onUpdateParty(updatedParty);
    onClose();
  };

  const handleSelectPhoto = () => {
    // Per ora mostra un alert che spiega come implementare
    Alert.alert(
      'Selezione Foto',
      'Funzionalità in sviluppo. Sarà possibile selezionare una foto dalla galleria o scattarne una nuova.',
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Rimuovi Foto Attuale',
          style: 'destructive',
          onPress: () => setEventPhoto(''),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const adjustTime = (minutes: number) => {
    const newTime = new Date(startTime);
    newTime.setMinutes(newTime.getMinutes() + minutes);
    setStartTime(newTime);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Configura Evento</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Event Photo Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Foto Evento</Text>
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={handleSelectPhoto}
              >
                {eventPhoto ? (
                  <Image
                    source={{ uri: eventPhoto }}
                    style={styles.eventPhoto}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons
                      name="camera-outline"
                      size={32}
                      color={colors.text.muted}
                    />
                    <Text style={styles.photoPlaceholderText}>
                      Tocca per selezionare una foto
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Start Time Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Orario di Inizio</Text>
              <View style={styles.timeContainer}>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeText}>{formatDate(startTime)}</Text>
                </View>
                <View style={styles.timeControls}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(-60)}
                  >
                    <Text style={styles.timeButtonText}>-1h</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(-15)}
                  >
                    <Text style={styles.timeButtonText}>-15m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(15)}
                  >
                    <Text style={styles.timeButtonText}>+15m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(60)}
                  >
                    <Text style={styles.timeButtonText}>+1h</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.setNowButton}
                  onPress={() => setStartTime(new Date())}
                >
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.setNowButtonText}>Imposta Ora Attuale</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={16} color={colors.white} />
              <Text style={styles.saveButtonText}>Salva</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    ...shadows.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  photoContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  eventPhoto: {
    width: '100%',
    height: 120,
  },
  photoPlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  photoPlaceholderText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  timeContainer: {
    gap: spacing.md,
  },
  timeDisplay: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timeText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  timeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  setNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  setNowButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
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
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});

export default EventConfigModal;