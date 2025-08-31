import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guest, Party } from '../types';

const STORAGE_KEYS = {
  GUESTS: '@party_guests',
  APP_SETTINGS: '@app_settings',
  PARTY_CODE: '@party_code',
  PARTIES: '@parties_list',
  PARTY_GUESTS_PREFIX: '@party_guests_',
} as const;

/**
 * Save the guest list in AsyncStorage
 */
export const saveGuests = async (guests: Guest[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(guests);
    await AsyncStorage.setItem(STORAGE_KEYS.GUESTS, jsonData);
  } catch (error) {
    console.error('Errore nel salvataggio degli ospiti:', error);
    throw new Error('Impossibile salvare i dati');
  }
};

/**
 * Load the guest list from AsyncStorage
 */
export const loadGuests = async (): Promise<Guest[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.GUESTS);
    if (jsonData === null) {
      return [];
    }
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Errore nel caricamento degli ospiti:', error);
    return [];
  }
};

/**
 * Delete all guest data from AsyncStorage
 */
export const clearAllGuests = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GUESTS);
  } catch (error) {
    console.error('Errore nella cancellazione dei dati:', error);
    throw new Error('Impossibile cancellare i dati');
  }
};

/**
 * Save app settings in AsyncStorage
 */
export const saveAppSettings = async (settings: Record<string, any>): Promise<void> => {
  try {
    const jsonData = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, jsonData);
  } catch (error) {
    console.error('Errore nel salvataggio delle impostazioni:', error);
  }
};

/**
 * Load app settings from AsyncStorage
 */
export const loadAppSettings = async (): Promise<Record<string, any>> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (jsonData === null) {
      return {};
    }
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Errore nel caricamento delle impostazioni:', error);
    return {};
  }
};


/**
 * Calculate the total storage size used by AsyncStorage (in KB)
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    }

    return Math.round(totalSize / 1024); // Ritorna in KB
  } catch (error) {
    console.error('Errore nel calcolo della dimensione storage:', error);
    return 0;
  }
};

/**
 * Save party code in AsyncStorage
 */
export const savePartyCode = async (partyCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PARTY_CODE, partyCode);
  } catch (error) {
    console.error('Errore nel salvataggio del codice festa:', error);
    throw new Error('Impossibile salvare il codice festa');
  }
};

/**
 * Load party code from AsyncStorage
 */
export const loadPartyCode = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PARTY_CODE);
  } catch (error) {
    console.error('Errore nel caricamento del codice festa:', error);
    return null;
  }
};

/**
 * Clear party code from AsyncStorage
 */
export const clearPartyCode = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PARTY_CODE);
  } catch (error) {
    console.error('Errore nella cancellazione del codice festa:', error);
    throw new Error('Impossibile cancellare il codice festa');
  }
};

// ========== MULTI-PARTY MANAGEMENT ==========

/**
 * Save a party to the parties list
 */
export const saveParty = async (party: Party): Promise<void> => {
  try {
    const parties = await loadAllParties();
    const existingIndex = parties.findIndex(p => p.id === party.id);
    
    if (existingIndex >= 0) {
      parties[existingIndex] = { ...party, lastModified: new Date().toISOString() };
    } else {
      parties.unshift(party);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
  } catch (error) {
    console.error('Errore nel salvataggio della festa:', error);
    throw new Error('Impossibile salvare la festa');
  }
};

/**
 * Load all parties from AsyncStorage
 */
export const loadAllParties = async (): Promise<Party[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.PARTIES);
    if (jsonData === null) {
      return [];
    }
    const parties = JSON.parse(jsonData);
    
    // Migrazione: aggiungi unpaidCount se mancante
    let needsSave = false;
    const migratedParties = parties.map((party: any) => {
      if (party.unpaidCount === undefined) {
        needsSave = true;
        return {
          ...party,
          unpaidCount: Math.max(0, party.guestCount - party.paidCount)
        };
      }
      return party;
    });
    
    // Salva se abbiamo fatto migrazioni
    if (needsSave) {
      await AsyncStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(migratedParties));
    }
    
    return migratedParties;
  } catch (error) {
    console.error('Errore nel caricamento delle feste:', error);
    return [];
  }
};

/**
 * Delete a party and all its associated data
 */
export const deleteParty = async (partyId: string): Promise<void> => {
  try {
    // Remove party from parties list
    const parties = await loadAllParties();
    const updatedParties = parties.filter(p => p.id !== partyId);
    await AsyncStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(updatedParties));
    
    // Remove party guests data
    await AsyncStorage.removeItem(`${STORAGE_KEYS.PARTY_GUESTS_PREFIX}${partyId}`);
  } catch (error) {
    console.error('Errore nella cancellazione della festa:', error);
    throw new Error('Impossibile cancellare la festa');
  }
};

/**
 * Save guests for a specific party
 */
export const savePartyGuests = async (partyId: string, guests: Guest[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(guests);
    await AsyncStorage.setItem(`${STORAGE_KEYS.PARTY_GUESTS_PREFIX}${partyId}`, jsonData);
    
    // Update party stats
    await updatePartyStats(partyId, guests);
  } catch (error) {
    console.error('Errore nel salvataggio degli ospiti della festa:', error);
    throw new Error('Impossibile salvare i dati degli ospiti');
  }
};

/**
 * Load guests for a specific party
 */
export const loadPartyGuests = async (partyId: string): Promise<Guest[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(`${STORAGE_KEYS.PARTY_GUESTS_PREFIX}${partyId}`);
    if (jsonData === null) {
      return [];
    }
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Errore nel caricamento degli ospiti della festa:', error);
    return [];
  }
};

/**
 * Update party statistics based on guests data
 */
export const updatePartyStats = async (partyId: string, guests: Guest[]): Promise<void> => {
  try {
    const parties = await loadAllParties();
    const partyIndex = parties.findIndex(p => p.id === partyId);
    
    if (partyIndex >= 0) {
      parties[partyIndex] = {
        ...parties[partyIndex],
        guestCount: guests.length,
        paidCount: guests.filter(g => g.paid).length,
        unpaidCount: guests.filter(g => !g.paid).length,
        scannedCount: guests.filter(g => g.scanned).length,
        lastModified: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
    }
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle statistiche della festa:', error);
  }
};