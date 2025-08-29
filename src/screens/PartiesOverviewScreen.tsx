import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Party } from '../types';
import { loadAllParties, saveParty, deleteParty } from '../utils/storage';
import { colors, spacing, typography, borderRadius, globalStyles } from '../constants/styles';

interface PartiesOverviewScreenProps {
  onSelectParty: (party: Party) => void;
}

const PartiesOverviewScreen: React.FC<PartiesOverviewScreenProps> = ({
  onSelectParty,
}) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyCode, setNewPartyCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      const savedParties = await loadAllParties();
      setParties(savedParties);
    } catch (error) {
      console.error('Errore nel caricamento delle feste:', error);
      Alert.alert('Errore', 'Impossibile caricare le feste salvate');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParty = async () => {
    if (!newPartyName.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per la festa');
      return;
    }

    if (!newPartyCode.trim()) {
      Alert.alert('Errore', 'Inserisci un codice per la festa');
      return;
    }

    if (newPartyCode.length < 4) {
      Alert.alert('Errore', 'Il codice deve essere di almeno 4 caratteri');
      return;
    }

    // Controlla se esiste già una festa con questo codice
    const existingParty = parties.find(
      (party) => party.code.toLowerCase() === newPartyCode.trim().toLowerCase()
    );

    if (existingParty) {
      Alert.alert('Errore', 'Esiste già una festa con questo codice');
      return;
    }

    const newParty: Party = {
      id: Date.now().toString(),
      code: newPartyCode.trim(),
      name: newPartyName.trim(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      guestCount: 0,
      paidCount: 0,
      scannedCount: 0,
    };

    try {
      await saveParty(newParty);
      setParties((prev) => [newParty, ...prev]);
      setNewPartyName('');
      setNewPartyCode('');
      setShowCreateModal(false);
      
      Alert.alert(
        'Festa Creata!',
        `Festa "${newParty.name}" creata con successo.`,
        [
          {
            text: 'Inizia',
            onPress: () => onSelectParty(newParty),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Errore', 'Impossibile creare la festa');
    }
  };

  const handleDeleteParty = (party: Party) => {
    Alert.alert(
      'Conferma Eliminazione',
      `Vuoi eliminare definitivamente la festa "${party.name}"?\n\nTutti i dati degli ospiti saranno persi.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParty(party.id);
              setParties((prev) => prev.filter((p) => p.id !== party.id));
              Alert.alert('Eliminata', `Festa "${party.name}" eliminata con successo`);
            } catch (error) {
              Alert.alert('Errore', 'Impossibile eliminare la festa');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const obfuscateCode = (code: string) => {
    if (code.length <= 2) return code;
    const firstChar = code.charAt(0);
    const lastChar = code.charAt(code.length - 1);
    const middleLength = code.length - 2;
    return firstChar + '•'.repeat(middleLength) + lastChar;
  };

  const renderPartyItem = ({ item }: { item: Party }) => (
    <TouchableOpacity
      style={styles.partyCard}
      onPress={() => onSelectParty(item)}
    >
      <View style={styles.partyHeader}>
        <View style={styles.partyInfo}>
          <Text style={styles.partyName}>{item.name}</Text>
          <Text style={styles.partyCode}>Codice: {obfuscateCode(item.code)}</Text>
          <Text style={styles.partyDate}>
            Creata: {formatDate(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteParty(item)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.partyStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          <Text style={styles.statText}>{item.guestCount} ospiti</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="card-outline" size={16} color={colors.success} />
          <Text style={styles.statText}>{item.paidCount} pagati</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.warning} />
          <Text style={styles.statText}>{item.scannedCount} scansionati</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.centerContent}>
          <Text>Caricamento feste...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>🎉 Le Tue Feste</Text>
        <Text style={styles.subtitle}>
          Gestisci tutte le tue feste e consulta lo storico
        </Text>
      </View>

      {/* Create Party Button */}
      <View style={styles.createSection}>
        {!showCreateModal ? (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.white} />
            <Text style={styles.createButtonText}>Crea Nuova Festa</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.createForm}>
            <TextInput
              style={styles.createInput}
              placeholder="Nome della festa (es. Compleanno Marco)"
              value={newPartyName}
              onChangeText={setNewPartyName}
              autoFocus
              maxLength={50}
            />
            <TextInput
              style={styles.createInput}
              placeholder="Codice festa (es. MARCO2024)"
              value={newPartyCode}
              onChangeText={setNewPartyCode}
              maxLength={20}
              autoCapitalize="characters"
              secureTextEntry={true}
              textContentType="password"
            />
            <View style={styles.createActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPartyName('');
                  setNewPartyCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleCreateParty}
              >
                <Text style={styles.confirmButtonText}>Crea</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Parties List */}
      {parties.length > 0 ? (
        <FlatList
          data={parties}
          renderItem={renderPartyItem}
          keyExtractor={(item) => item.id}
          style={styles.partiesList}
          contentContainerStyle={styles.partiesListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>Nessuna festa ancora</Text>
          <Text style={styles.emptyText}>
            Crea la tua prima festa per iniziare a gestire gli ospiti
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Developed by Fabrizio Sanino
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  createSection: {
    padding: spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  createButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  createForm: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  createInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  createActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  cancelButtonText: {
    color: colors.gray[600],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  partiesList: {
    flex: 1,
  },
  partiesListContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  partyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  partyCode: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  partyDate: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  deleteButton: {
    padding: spacing.sm,
  },
  partyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray[800],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.gray[50],
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PartiesOverviewScreen;
