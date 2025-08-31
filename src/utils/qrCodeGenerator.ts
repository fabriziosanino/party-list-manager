interface QRData {
  id: number;
  name: string;
  partyCode: string;
}

// Chiave segreta per la firma (in produzione dovrebbe essere più sicura)
const SECRET_KEY = 'PartyManager2024Secret';

/**
 * Genera una firma crittografica per i dati del QR
 */
const generateSignature = (data: QRData, timestamp: number): string => {
  const payload = `${data.id}|${data.name}|${data.partyCode}|${timestamp}`;
  // Simulazione di hash con btoa (in produzione usare crypto.subtle)
  return btoa(`${payload}|${SECRET_KEY}`).slice(0, 16);
};

/**
 * Verifica la firma crittografica
 */
const verifySignature = (data: QRData, timestamp: number, signature: string): boolean => {
  const expectedSignature = generateSignature(data, timestamp);
  return signature === expectedSignature;
};

/**
 * Genera un codice QR unico per un ospite basato sul codice festa
 */
export const generateQRCode = (data: QRData): string => {
  const timestamp = Date.now();
  const signature = generateSignature(data, timestamp);
  
  const uniqueId = `${data.partyCode}_${data.id}`;
  const secureData = { 
    id: data.id, 
    name: data.name, 
    partyCode: data.partyCode,
    uniqueId,
    timestamp,
    signature
  };
  
  const encodedData = btoa(JSON.stringify(secureData));
  return `QR_${encodedData}`;
};

/**
 * Decodifica un codice QR e restituisce i dati dell'ospite
 */
export const decodeQRCode = (qrCode: string): QRData | null => {
  try {
    if (!qrCode.startsWith('QR_')) {
      return null;
    }

    // Estrae la parte codificata dal QR code
    const parts = qrCode.split('_');
    if (parts.length < 2) {
      return null;
    }

    const encodedData = parts[1];
    const decodedString = atob(encodedData);
    const data = JSON.parse(decodedString);

    // Verifica che tutti i campi necessari siano presenti
    if (!data.id || !data.name || !data.partyCode || !data.timestamp || !data.signature) {
      return null;
    }

    // Verifica la firma crittografica
    const qrData: QRData = {
      id: data.id,
      name: data.name,
      partyCode: data.partyCode,
    };

    if (!verifySignature(qrData, data.timestamp, data.signature)) {
      console.warn('QR Code con firma non valida:', data);
      return null;
    }

    return qrData;
  } catch (error) {
    console.error('Errore nella decodifica del QR code:', error);
    return null;
  }
};

/**
 * Valida se un QR code ha il formato corretto
 */
export const validateQRCode = (qrCode: string): boolean => {
  const decoded = decodeQRCode(qrCode);
  return decoded !== null;
};

/**
 * Migra i QR code esistenti al nuovo formato sicuro
 */
export const migrateQRCodes = (guests: any[], partyCode: string): any[] => {
  return guests.map(guest => {
    // Se il QR code non è valido con il nuovo formato, rigeneralo
    if (!validateQRCode(guest.qrCode)) {
      const newQRCode = generateQRCode({
        id: guest.id,
        name: guest.name,
        partyCode: partyCode
      });
      return {
        ...guest,
        qrCode: newQRCode
      };
    }
    return guest;
  });
};