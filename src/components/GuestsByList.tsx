import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Guest, GuestList as GuestListType } from '../types';
import GuestItem from './GuestItem';
import { colors, spacing, typography, borderRadius } from '../constants/styles';

interface GuestsByListProps {
  guests: Guest[];
  guestLists: GuestListType[];
  searchQuery: string;
  selectedGuests: Set<number>;
  multiSelectMode: boolean;
  onToggleGuest: (id: number) => void;
  onTogglePaid: (id: number) => void;
  onDeleteGuest: (id: number) => void;
  qrViewShotRefs: React.MutableRefObject<{ [key: number]: any }>;
}

interface SectionData {
  title: string;
  color: string;
  guestCount: number;
  data: Guest[];
}

const GuestsByList: React.FC<GuestsByListProps> = ({
  guests,
  guestLists,
  searchQuery,
  selectedGuests,
  multiSelectMode,
  onToggleGuest,
  onTogglePaid,
  onDeleteGuest,
  qrViewShotRefs,
}) => {
  const [selectedListId, setSelectedListId] = useState<string>('all');

  // Filter guests based on search query
  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter by selected list
  const displayedGuests = selectedListId === 'all' 
    ? filteredGuests 
    : selectedListId === 'orphaned'
      ? filteredGuests.filter(guest => 
          !guestLists.some(list => list.id === guest.listId)
        )
      : filteredGuests.filter(guest => guest.listId === selectedListId);

  // Sort guests alphabetically
  const sortedGuests = displayedGuests.sort((a, b) => a.name.localeCompare(b.name));

  // Calculate stats for tabs
  const allGuestsCount = filteredGuests.length;
  const listStats = guestLists.map(list => ({
    ...list,
    count: filteredGuests.filter(guest => guest.listId === list.id).length
  }));

  const orphanedCount = filteredGuests.filter(guest => 
    !guestLists.some(list => list.id === guest.listId)
  ).length;

  const renderGuest = ({ item }: { item: Guest }) => (
    <GuestItem
      guest={item}
      isSelected={selectedGuests.has(item.id)}
      isMultiSelectMode={multiSelectMode}
      onSelect={onToggleGuest}
      onLongPress={onToggleGuest}
      onTogglePaid={onTogglePaid}
      onRemove={onDeleteGuest}
      qrRef={{
        current: qrViewShotRefs.current[item.id]
      } as React.RefObject<any>}
    />
  );

  const renderTabButton = (listId: string, title: string, count: number, color?: string) => (
    <TouchableOpacity
      key={listId}
      style={[
        styles.tabButton,
        selectedListId === listId && styles.tabButtonActive
      ]}
      onPress={() => setSelectedListId(listId)}
    >
      <Text style={[
        styles.tabButtonText,
        selectedListId === listId && styles.tabButtonTextActive
      ]}>
        {title}
      </Text>
      <View style={[
        styles.tabBadge,
        selectedListId === listId && styles.tabBadgeActive
      ]}>
        <Text style={[
          styles.tabBadgeText,
          selectedListId === listId && styles.tabBadgeTextActive
        ]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="people-outline" 
        size={48} 
        color={colors.gray[400]} 
        style={styles.emptyIcon} 
      />
      <Text style={styles.emptyText}>
        {searchQuery 
          ? 'Nessun ospite trovato per la ricerca' 
          : selectedListId === 'all'
            ? 'Nessun ospite nella festa'
            : 'Nessun ospite in questa lista'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {renderTabButton('all', 'Tutti', allGuestsCount)}
        {listStats.map(list => 
          renderTabButton(list.id, list.name, list.count)
        )}
        {orphanedCount > 0 && renderTabButton('orphaned', 'Senza Lista', orphanedCount, colors.gray[400])}
      </ScrollView>

      {/* Guest List */}
      <FlatList
        data={sortedGuests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGuest}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sortedGuests.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.xs,
    minHeight: 32,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  tabButtonTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  tabBadge: {
    backgroundColor: colors.gray[300],
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    minWidth: 16,
    minHeight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: {
    backgroundColor: colors.white,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  tabBadgeTextActive: {
    color: colors.primary,
  },
  listContainer: {
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyListContainer: {
    flex: 1,
  },
});

export default GuestsByList;
