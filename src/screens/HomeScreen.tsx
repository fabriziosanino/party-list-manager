import React, { useState, useEffect, useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  TextInput,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Guest, NewGuest, ScanResult, Party, GuestList as GuestListType } from '../types';
import { generateQRCode, migrateQRCodes } from '../utils/qrCodeGenerator';
import { 
  savePartyGuests, 
  loadPartyGuests, 
  saveParty,
  updatePartyStats,
  loadPartyGuestLists,
  savePartyGuestLists,
  updateGuestListStats
} from '../utils/storage';
import { exportQRCodes, exportPartyReport } from '../utils/fileHandler';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Conditional import for react-native-share
let Share: any = null;
try {
  Share = require('react-native-share').default;
} catch (e) {
  console.log('react-native-share not available, using expo-sharing fallback');
}

// Components
import StatsCard from '../components/StatsCard';
import GuestsByList from '../components/GuestsByList';
import AddGuestModal from '../components/AddGuestModal';
import GuestListModal from '../components/GuestListModal';
import Scanner from '../components/Scanner';

import { colors, spacing, typography, borderRadius, globalStyles } from '../constants/styles';

interface HomeScreenProps {
  party: Party;
  onBackToParties: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ party, onBackToParties }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestLists, setGuestLists] = useState<GuestListType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showGuestListModal, setShowGuestListModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<Set<number>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const qrViewShotRefs = useRef<{ [key: number]: ViewShot | null }>({});

  // Swipe gesture configuration
  const screenWidth = Dimensions.get('window').width;
  const swipeThreshold = screenWidth * 0.3; // 30% of screen width
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes from the left edge
        const { dx, dy } = gestureState;
        const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
        const isFromLeftEdge = evt.nativeEvent.pageX < 50; // Start from left 50px
        const isSwipeRight = dx > 10;
        
        return isHorizontalSwipe && isFromLeftEdge && isSwipeRight;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Optional: Add visual feedback here if needed
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        
        // If swipe distance exceeds threshold, go back
        if (dx > swipeThreshold) {
          onBackToParties();
        }
      },
    })
  ).current;

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever guests change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      saveData();
    }
  }, [guests, isInitialLoad]);

  const loadData = async () => {
    try {
      const [savedGuests, savedGuestLists] = await Promise.all([
        loadPartyGuests(party.id),
        loadPartyGuestLists(party.id)
      ]);
      
      // Migra QR code esistenti al nuovo formato sicuro
      const migratedGuests = migrateQRCodes(savedGuests, party.code);
      
      // Se sono stati migrati dei QR code, salva i dati aggiornati
      if (JSON.stringify(savedGuests) !== JSON.stringify(migratedGuests)) {
        await savePartyGuests(party.id, migratedGuests);
        console.log('QR codes migrati al nuovo formato sicuro');
      }
      
      setGuests(migratedGuests);
      setGuestLists(savedGuestLists);
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      setIsInitialLoad(false);
    }
  };

  const saveData = async () => {
    try {
      await savePartyGuests(party.id, guests);
      await updateGuestListStats(party.id, guests);
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  };

  // Populate QR ViewShot refs for all guests
  useEffect(() => {
    guests.forEach(guest => {
      if (!qrViewShotRefs.current[guest.id]) {
        qrViewShotRefs.current[guest.id] = null;
      }
    });
  }, [guests]);

  const handleAddGuest = (newGuest: NewGuest) => {
    const guest: Guest = {
      id: Date.now(),
      name: newGuest.name,
      paid: newGuest.paid,
      qrCode: '',
      scanned: false,
      scanTime: null,
      listId: newGuest.listId,
    };
    
    guest.qrCode = generateQRCode({ 
      id: guest.id, 
      name: guest.name, 
      partyCode: party.code 
    });
    
    setGuests(prev => [...prev, guest]);
  };

  const handleSaveGuestLists = async (lists: GuestListType[]) => {
    try {
      await savePartyGuestLists(party.id, lists);
      setGuestLists(lists);
      
      // Migrate guests assigned to deleted lists to the first available list
      const listIds = new Set(lists.map(l => l.id));
      const updatedGuests = guests.map(guest => {
        if (!listIds.has(guest.listId)) {
          return { ...guest, listId: lists[0]?.id || '' };
        }
        return guest;
      });
      
      if (JSON.stringify(guests) !== JSON.stringify(updatedGuests)) {
        setGuests(updatedGuests);
      }
      
      // Update guest list statistics
      await updateGuestListStats(party.id, updatedGuests);
    } catch (error) {
      console.error('Error saving guest lists:', error);
      Alert.alert('Errore', 'Impossibile salvare le liste degli ospiti');
    }
  };

  const handleTogglePaid = (id: number) => {
    const guest = guests.find(g => g.id === id);
    if (!guest) return;

    const newStatus = !guest.paid;
    const action = newStatus ? 'pagato' : 'non pagato';
    
    Alert.alert(
      'Conferma Modifica',
      `Vuoi segnare "${guest.name}" come ${action}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          onPress: () => {
            setGuests(prev =>
              prev.map(g =>
                g.id === id ? { ...g, paid: newStatus } : g
              )
            );
          },
        },
      ]
    );
  };

  const handleRemoveGuest = (id: number) => {
    setGuests(prev => prev.filter(guest => guest.id !== id));
  };

  // Multi-select functions
  const handleLongPressGuest = (id: number) => {
    const guest = guests.find(g => g.id === id);
    if (!guest?.scanned && !isMultiSelectMode) {
      setIsMultiSelectMode(true);
      setSelectedGuests(new Set([id]));
    }
  };

  const handleSelectGuest = (id: number) => {
    const guest = guests.find(g => g.id === id);
    if (isMultiSelectMode && !guest?.scanned) {
      setSelectedGuests(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        
        // Exit multi-select mode if no guests are selected
        if (newSet.size === 0) {
          setIsMultiSelectMode(false);
        }
        
        return newSet;
      });
    }
  };

  const handleCancelMultiSelect = () => {
    setIsMultiSelectMode(false);
    setSelectedGuests(new Set());
  };

  const handleShareMultipleQR = async () => {
    if (selectedGuests.size === 0) return;

    setLoading(true);
    try {
      const selectedGuestList = guests.filter(guest => selectedGuests.has(guest.id));
      const qrImages: string[] = [];

      // Generate QR codes for all selected guests
      const qrPromises = selectedGuestList.map(async (guest) => {
        const qrRef = qrViewShotRefs.current[guest.id];
        if (qrRef && qrRef.capture) {
          try {
            const uri = await qrRef.capture();
            return uri;
          } catch (error) {
            console.error(`Error generating QR for ${guest.name}:`, error);
            return null;
          }
        }
        return null;
      });

      const results = await Promise.all(qrPromises);
      const validUris = results.filter(uri => uri !== null) as string[];

      if (validUris.length === 0) {
        Alert.alert('Errore', 'Impossibile generare i codici QR');
        return;
      }

      // Share using react-native-share or fallback to expo-sharing
      if (Share) {
        // Use react-native-share for multiple images
        const shareOptions = {
          urls: validUris,
          type: 'image/png',
        };
        await Share.open(shareOptions);
      } else {
        // Fallback: share images one by one with expo-sharing
        for (const uri of validUris) {
          await Sharing.shareAsync(uri);
        }
      }
      
      // Exit multi-select mode after sharing
      handleCancelMultiSelect();

    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing QR codes:', error);
        Alert.alert('Errore', 'Impossibile condividere i codici QR');
      }
    } finally {
      setLoading(false);
    }
  };

  // Funzione per filtrare e ordinare gli ospiti
  const filteredGuests = guests
    .filter(guest => 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Prima separare scansionati da non scansionati
      if (a.scanned && !b.scanned) return 1; // a scansionato va dopo
      if (!a.scanned && b.scanned) return -1; // a non scansionato va prima
      
      if (a.scanned && b.scanned) {
        // Entrambi scansionati: ordine per data di scansione decrescente (più recenti prima)
        if (!a.scanTime && !b.scanTime) return 0;
        if (!a.scanTime) return 1;
        if (!b.scanTime) return -1;
        
        // Confronta le date di scansione
        const dateA = new Date(a.scanTime.split(', ').reverse().join(' '));
        const dateB = new Date(b.scanTime.split(', ').reverse().join(' '));
        return dateB.getTime() - dateA.getTime(); // Decrescente
      }
      
      // Entrambi non scansionati: ordine alfabetico per nome
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

  const handleExportQRCodes = async () => {
    if (guests.length === 0) {
      Alert.alert('Attenzione', 'Non ci sono ospiti da esportare');
      return;
    }

    const success = await exportQRCodes(guests);
    if (!success) {
      Alert.alert('Errore', 'Impossibile esportare i QR codes');
    }
  };

  const handleExportReport = async () => {
    if (guests.length === 0) {
      Alert.alert('Attenzione', 'Non ci sono dati da esportare');
      return;
    }

    const success = await exportPartyReport(guests);
    if (!success) {
      Alert.alert('Errore', 'Impossibile generare il report');
    }
  };

  const handleScanSuccess = (guest: Guest, result: ScanResult) => {
    if (result.status === 'success' || result.status === 'payment') {
      // Mark guest as scanned
      const now = new Date().toLocaleString('it-IT');
      setGuests(prev =>
        prev.map(g =>
          g.id === guest.id ? { ...g, scanned: true, scanTime: now } : g
        )
      );
    }
  };

  const handleResetScans = () => {
    const scannedGuests = guests.filter(g => g.scanned);
    
    if (scannedGuests.length === 0) {
      Alert.alert('Info', 'Non ci sono scansioni da resettare');
      return;
    }

    Alert.alert(
      'Conferma Reset',
      `Vuoi resettare tutte le ${scannedGuests.length} scansioni? Questa operazione non può essere annullata.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setGuests(prev =>
              prev.map(guest => ({ ...guest, scanned: false, scanTime: null }))
            );
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    if (guests.length === 0) {
      Alert.alert('Info', 'Non ci sono dati da cancellare');
      return;
    }

    Alert.alert(
      'Attenzione!',
      'Vuoi cancellare TUTTI gli ospiti di questa festa? Questa operazione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Cancella Tutto',
          style: 'destructive',
          onPress: () => {
            setGuests([]); // Svuota l'array, l'useEffect si occuperà del salvataggio
            Alert.alert('Completato', 'Tutti gli ospiti sono stati cancellati.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>{party.name}</Text>
        <Text style={styles.partyCodeText}>
          Codice: {party.code}
        </Text>
      </View>

      {/* Stats */}
      <StatsCard guests={guests} />

      {/* Main Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.secondaryButton]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Aggiungi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.infoButton]}
            onPress={() => setShowGuestListModal(true)}
          >
            <Ionicons name="list-outline" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Liste</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.warningButton]}
            onPress={() => setShowScanner(true)}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Scanner</Text>
          </TouchableOpacity>

          {guests.length > 0 && (
            <TouchableOpacity
              style={[styles.controlButton, styles.infoButton]}
              onPress={handleExportReport}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.white} />
              <Text style={styles.buttonText}>Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar */}
      {guests.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cerca ospiti per nome..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray[400]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Multi-select Action Bar */}
      {isMultiSelectMode && (
        <View style={styles.multiSelectBar}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelMultiSelect}
          >
            <Ionicons name="close" size={20} color={colors.gray[600]} />
            <Text style={styles.cancelButtonText}>Annulla</Text>
          </TouchableOpacity>
          
          <Text style={styles.selectedCountText}>
            {selectedGuests.size} selezionati
          </Text>
          
          <TouchableOpacity
            style={[
              styles.shareButton,
              selectedGuests.size === 0 && styles.shareButtonDisabled
            ]}
            onPress={handleShareMultipleQR}
            disabled={selectedGuests.size === 0 || loading}
          >
            <Ionicons 
              name="share-outline" 
              size={20} 
              color={selectedGuests.size === 0 ? colors.gray[400] : colors.white} 
            />
            <Text style={[
              styles.shareButtonText,
              selectedGuests.size === 0 && styles.shareButtonTextDisabled
            ]}>
              {loading ? 'Generando...' : 'Condividi QR'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Guest List */}
      <GuestsByList
        guests={filteredGuests}
        guestLists={guestLists}
        searchQuery={searchQuery}
        selectedGuests={selectedGuests}
        multiSelectMode={isMultiSelectMode}
        onToggleGuest={isMultiSelectMode ? handleSelectGuest : handleLongPressGuest}
        onTogglePaid={handleTogglePaid}
        onDeleteGuest={handleRemoveGuest}
        qrViewShotRefs={qrViewShotRefs}
      />

      {/* Modals */}
      <AddGuestModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGuest}
        guestLists={guestLists}
        existingGuests={guests}
      />

      <GuestListModal
        visible={showGuestListModal}
        onClose={() => setShowGuestListModal(false)}
        partyId={party.id}
        guestLists={guestLists}
        onSaveGuestLists={handleSaveGuestLists}
      />

      <Scanner
        visible={showScanner}
        guests={guests}
        partyCode={party.code}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Hidden ViewShots for QR code sharing */}
      {guests.map((guest) => (
        <ViewShot
          key={`qr-${guest.id}`}
          ref={(ref) => { qrViewShotRefs.current[guest.id] = ref; }}
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
      ))}

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={onBackToParties}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  floatingBackButton: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlsContainer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.success,
  },
  successButton: {
    backgroundColor: colors.primary,
  },
  warningButton: {
    backgroundColor: colors.warning,
  },
  infoButton: {
    backgroundColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  partyCodeText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.gray[800],
    paddingVertical: spacing.xs,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  // Multi-select styles
  multiSelectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
  },
  selectedCountText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.gray[800],
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  shareButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  shareButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  shareButtonTextDisabled: {
    color: colors.gray[400],
  },
});

export default HomeScreen;