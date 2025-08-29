import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Guest } from '../types';
import GuestItem from './GuestItem';
import { colors, spacing, typography } from '../constants/styles';

interface GuestListProps {
  guests: Guest[];
  onTogglePaid: (id: number) => void;
  onRemoveGuest: (id: number) => void;
  isSearching?: boolean;
}

const GuestList: React.FC<GuestListProps> = ({ 
  guests, 
  onTogglePaid, 
  onRemoveGuest,
  isSearching = false
}) => {
  const handleRemoveGuest = (id: number) => {
    const guest = guests.find(g => g.id === id);
    
    Alert.alert(
      'Conferma Rimozione',
      `Vuoi rimuovere ${guest?.name || 'questo ospite'} dalla lista?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: () => onRemoveGuest(id),
        },
      ],
    );
  };

  if (guests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {isSearching ? 'Nessun risultato' : 'Nessun ospite in lista'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isSearching 
            ? 'Prova con un altro termine di ricerca'
            : 'Carica un file CSV/Excel o aggiungi ospiti manualmente'
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Lista Ospiti ({guests.length})
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {guests.map((guest) => (
          <GuestItem
            key={guest.id}
            guest={guest}
            onTogglePaid={onTogglePaid}
            onRemove={handleRemoveGuest}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl, // Extra space at bottom
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: typography.sizes.lg,
  },
});

export default GuestList;