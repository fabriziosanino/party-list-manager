import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guest } from '../types';

const STORAGE_KEYS = {
  GUESTS: '@party_guests',
  APP_SETTINGS: '@app_settings',
  PARTY_CODE: '@party_code',
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