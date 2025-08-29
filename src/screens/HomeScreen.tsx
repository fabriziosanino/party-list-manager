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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Guest, NewGuest, ScanResult } from '../types';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { saveGuests, loadGuests, clearAllGuests, savePartyCode, loadPartyCode, clearPartyCode } from '../utils/storage';
import { uploadGuestsFile, exportQRCodes, exportPartyReport } from '../utils/fileHandler';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Components
import StatsCard from '../components/StatsCard';
import GuestList from '../components/GuestList';
import AddGuestModal from '../components/AddGuestModal';
import Scanner from '../components/Scanner';
import PartyCodeModal from '../components/PartyCodeModal';

import { colors, spacing, typography, borderRadius, globalStyles } from '../constants/styles';

const HomeScreen: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [partyCode, setPartyCode] = useState<string | null>(null);
  const [showPartyCodeModal, setShowPartyCodeModal] = useState(false);
  const [partyCodeInitialized, setPartyCodeInitialized] = useState(false);
  const qrViewShotRefs = useRef<{ [key: number]: ViewShot | null }>({});

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
      // Prima carica il codice festa
      const savedPartyCode = await loadPartyCode();
      
      if (!savedPartyCode) {
        // Se non c'è un codice festa, mostra il modal una sola volta
        if (!partyCodeInitialized) {
          setShowPartyCodeModal(true);
          setPartyCodeInitialized(true);
        }
        setIsInitialLoad(false);
        return;
      }
      
      setPartyCode(savedPartyCode);
      setPartyCodeInitialized(true);
      
      // Poi carica gli ospiti
      const savedGuests = await loadGuests();
      setGuests(savedGuests);
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      setIsInitialLoad(false);
    }
  };

  const saveData = async () => {
    try {
      await saveGuests(guests);
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  };

  const handleFileUpload = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await uploadGuestsFile();
      
      if (result.success) {
        // Parse the uploaded guests and add them to the current list
        Alert.alert(
          'Successo!',
          `Aggiunti ${result.guestsAdded} ospiti alla lista${result.error ? `\n\n${result.error}` : ''}`,
          [{ text: 'OK' }]
        );
        
        // Reload data to get the new guests
        await loadData();
      } else {
        Alert.alert('Errore', result.error || 'Impossibile caricare il file');
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il caricamento del file');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = (newGuest: NewGuest) => {
    if (!partyCode) {
      Alert.alert('Errore', 'Codice festa mancante');
      return;
    }

    const guest: Guest = {
      id: Date.now(),
      name: newGuest.name,
      paid: newGuest.paid,
      qrCode: '',
      scanned: false,
      scanTime: null,
    };
    
    guest.qrCode = generateQRCode({ 
      id: guest.id, 
      name: guest.name, 
      partyCode: partyCode 
    });
    
    setGuests(prev => [...prev, guest]);
  };

  const handlePartyCodeConfirm = async (code: string) => {
    try {
      await savePartyCode(code);
      setPartyCode(code);
      setShowPartyCodeModal(false);
      
      Alert.alert(
        'Codice Festa Salvato!', 
        `Festa: ${code}\n\nOra puoi iniziare ad aggiungere ospiti.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Errore', 'Impossibile salvare il codice festa');
    }
  };

  const handlePartyCodeCancel = () => {
    setShowPartyCodeModal(false);
    Alert.alert(
      'Codice Festa Richiesto',
      'Per utilizzare l\'app devi inserire un codice festa.',
      [
        { 
          text: 'Inserisci Codice', 
          onPress: () => setShowPartyCodeModal(true) 
        }
      ]
    );
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

  // Funzione per filtrare gli ospiti in base alla ricerca
  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      'Vuoi cancellare TUTTI i dati? Questa operazione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Cancella Tutto',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearPartyCode(); // Cancella anche il codice festa
              setGuests([]); // Svuota l'array, l'useEffect si occuperà del salvataggio
              setPartyCode(null);
              setPartyCodeInitialized(false); // Reset del flag
              setShowPartyCodeModal(true); // Richiedi nuovo codice festa
              Alert.alert('Completato', 'Tutti i dati sono stati cancellati.\nInserisci un nuovo codice festa.');
            } catch (error) {
              Alert.alert('Errore', 'Impossibile cancellare completamente i dati');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>🎉 Party List Manager</Text>
        {partyCode && (
          <Text style={styles.partyCodeText}>
            Festa: {partyCode}
          </Text>
        )}
      </View>

      {/* Stats */}
      <StatsCard guests={guests} />

      {/* Main Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.primaryButton]}
            onPress={handleFileUpload}
            disabled={loading}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
            <Text style={styles.buttonText}>
              {loading ? 'Caricamento...' : 'Carica Lista'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.secondaryButton]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Aggiungi</Text>
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

      {/* Guest List */}
      <GuestList
        guests={filteredGuests}
        onTogglePaid={handleTogglePaid}
        onRemoveGuest={handleRemoveGuest}
        isSearching={searchQuery.length > 0}
      />

      {/* Bottom Actions */}
      {guests.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleExportReport}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.bottomButtonText}>Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleResetScans}
          >
            <Ionicons name="refresh-outline" size={18} color={colors.warning} />
            <Text style={[styles.bottomButtonText, { color: colors.warning }]}>
              Reset Scansioni
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleClearAllData}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.bottomButtonText, { color: colors.danger }]}>
              Cancella Tutto
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <PartyCodeModal
        visible={showPartyCodeModal}
        onConfirm={handlePartyCodeConfirm}
        onCancel={partyCode ? handlePartyCodeCancel : undefined}
      />

      <AddGuestModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGuest}
      />

      <Scanner
        visible={showScanner}
        guests={guests}
        partyCode={partyCode}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Hidden ViewShots for QR code sharing */}
      {guests.map((guest) => (
        <ViewShot
          key={`qr-${guest.id}`}
          ref={(ref) => { qrViewShotRefs.current[guest.id] = ref; }}
          options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
          style={{ position: 'absolute', left: -9999, width: 300, height: 380, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 20 }}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 24, textAlign: 'center' }}>{guest.name}</Text>
          <QRCode
            value={guest.qrCode}
            size={200}
            backgroundColor="#fff"
          />
        </ViewShot>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
    justifyContent: 'space-around',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  bottomButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary,
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
});

export default HomeScreen;