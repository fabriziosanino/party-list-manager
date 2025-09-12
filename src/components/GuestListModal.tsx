import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuestList } from '../types';
import { colors, spacing, typography, borderRadius } from '../constants/styles';

interface GuestListModalProps {
  visible: boolean;
  onClose: () => void;
  partyId: string;
  guestLists: GuestList[];
  onSaveGuestLists: (lists: GuestList[]) => void;
}

const GuestListModal: React.FC<GuestListModalProps> = ({
  visible,
  onClose,
  partyId,
  guestLists,
  onSaveGuestLists,
}) => {
  const [localLists, setLocalLists] = useState<GuestList[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    setLocalLists(guestLists);
  }, [guestLists]);

  const handleAddList = () => {
    const newList: GuestList = {
      id: Date.now().toString(),
      name: 'Nuova Lista',
      color: colors.primary,
      partyId,
      createdAt: new Date().toISOString(),
      guestCount: 0,
    };
    setLocalLists(prev => [...prev, newList]);
    setEditingId(newList.id);
    setEditingName(newList.name);
  };

  const handleDeleteList = (listId: string) => {
    if (localLists.length === 1) {
      Alert.alert('Errore', 'Impossibile eliminare l\'ultima lista. Ogni festa deve avere almeno una lista.');
      return;
    }

    Alert.alert(
      'Elimina Lista',
      'Sei sicuro di voler eliminare questa lista? Tutti gli ospiti in questa lista verranno spostati nella prima lista disponibile.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            setLocalLists(prev => prev.filter(list => list.id !== listId));
          }
        }
      ]
    );
  };

  const handleSaveName = () => {
    if (editingId && editingName.trim()) {
      setLocalLists(prev =>
        prev.map(list =>
          list.id === editingId ? { ...list, name: editingName.trim() } : list
        )
      );
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleSave = () => {
    onSaveGuestLists(localLists);
    onClose();
  };

  const renderListItem = ({ item }: { item: GuestList }) => (
    <View style={styles.listItem}>
      {editingId === item.id ? (
        <TextInput
          style={styles.nameInput}
          value={editingName}
          onChangeText={setEditingName}
          onBlur={handleSaveName}
          onSubmitEditing={handleSaveName}
          autoFocus
          selectTextOnFocus
        />
      ) : (
        <TouchableOpacity
          style={styles.nameContainer}
          onPress={() => {
            setEditingId(item.id);
            setEditingName(item.name);
          }}
        >
          <Text style={styles.listName}>{item.name}</Text>
        </TouchableOpacity>
      )}

      {localLists.length > 1 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteList(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Annulla</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Gestisci Liste</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Salva</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <FlatList
            data={localLists}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddList}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.addButtonText}>Aggiungi Nuova Lista</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  cancelText: {
    fontSize: typography.sizes.md,
    color: colors.danger,
  },
  saveText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  nameContainer: {
    flex: 1,
  },
  listName: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  nameInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  colorPicker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

export default GuestListModal;
