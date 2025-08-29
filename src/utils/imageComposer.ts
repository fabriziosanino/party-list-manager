import * as FileSystem from 'expo-file-system';

// Funzione semplice per gestire condivisione multipla QR
export async function shareMultipleQRCodes(imageUris: string[], guestNames: string[]): Promise<{ uri: string; message: string }> {
  if (imageUris.length === 0) {
    throw new Error('Nessuna immagine da condividere');
  }
  
  if (imageUris.length === 1) {
    return {
      uri: imageUris[0],
      message: `QR Code - ${guestNames[0]}`
    };
  }
  
  // Per QR multipli, condividiamo il primo con un messaggio dettagliato
  const message = `QR Codes per ${imageUris.length} ospiti della festa:

${guestNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}

Questo è il QR code per ${guestNames[0]}. 
Per gli altri ospiti, usa la condivisione individuale dall'app.`;

  return {
    uri: imageUris[0],
    message
  };
}
