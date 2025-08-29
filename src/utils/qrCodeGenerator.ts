interface QRData {
  id: number;
  name: string;
  partyCode: string;
}

/**
 * Genera un codice QR unico per un ospite basato sul codice festa
 */
export const generateQRCode = (data: QRData): string => {
  // Usa il codice festa + ID per garantire univocità ma consistenza
  const uniqueId = `${data.partyCode}_${data.id}`;
  const encodedData = btoa(JSON.stringify({ 
    id: data.id, 
    name: data.name, 
    partyCode: data.partyCode,
    uniqueId 
  }));
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

    if (data.id && data.name && data.partyCode) {
      return {
        id: data.id,
        name: data.name,
        partyCode: data.partyCode,
      };
    }

    return null;
  } catch (error) {
    console.error('Errore nella decodifica del QR code:', error);
    return null;
  }
};

/**
 * Valida se un QR code ha il formato corretto
 */
export const validateQRCode = (qrCode: string): boolean => {
  return qrCode.startsWith('QR_') && qrCode.split('_').length >= 3;
};