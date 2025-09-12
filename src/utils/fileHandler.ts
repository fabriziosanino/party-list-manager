import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Guest, FileUploadResult } from '../types';
import { generateQRCode } from './qrCodeGenerator';

/**
 * Carica e parsifica un file CSV/Excel
 */
export const uploadGuestsFile = async (): Promise<FileUploadResult> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, guestsAdded: 0, error: 'Operazione annullata' };
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    
    return parseGuestsFromCSV(fileContent);
  } catch (error) {
    console.error('Errore nel caricamento del file:', error);
    return { 
      success: false, 
      guestsAdded: 0, 
      error: 'Errore nella lettura del file. Assicurati che sia un CSV valido.' 
    };
  }
};

/**
 * Parsifica il contenuto CSV e crea gli ospiti
 */
const parseGuestsFromCSV = (csvContent: string): FileUploadResult => {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { success: false, guestsAdded: 0, error: 'File vuoto' };
    }

    const guests: Guest[] = [];
    let skippedLines = 0;

    // Salta la prima riga se sembra un header
    const startIndex = isHeaderRow(lines[0]) ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parsedGuest = parseGuestLine(line, Date.now() + i);
      if (parsedGuest) {
        guests.push(parsedGuest);
      } else {
        skippedLines++;
      }
    }

    if (guests.length === 0) {
      return { 
        success: false, 
        guestsAdded: 0, 
        error: 'Nessun ospite valido trovato nel file' 
      };
    }

    return { 
      success: true, 
      guestsAdded: guests.length,
      guests: guests,
      error: skippedLines > 0 ? `${skippedLines} righe saltate per errori di formato` : undefined
    };

  } catch (error) {
    console.error('Errore nel parsing del CSV:', error);
    return { 
      success: false, 
      guestsAdded: 0, 
      error: 'Formato file non valido' 
    };
  }
};

/**
 * Controlla se una riga è un header
 */
const isHeaderRow = (line: string): boolean => {
  const normalizedLine = line.toLowerCase().trim();
  return normalizedLine.includes('nome') || 
         normalizedLine.includes('name') || 
         normalizedLine.includes('pagato') || 
         normalizedLine.includes('paid');
};

/**
 * Parsifica una singola riga del CSV
 */
const parseGuestLine = (line: string, baseId: number): Guest | null => {
  try {
    // Gestisce CSV con virgole e punti e virgola
    const separators = [',', ';', '\t'];
    let parts: string[] = [];
    
    for (const separator of separators) {
      const testParts = line.split(separator);
      if (testParts.length >= 2) {
        parts = testParts;
        break;
      }
    }

    if (parts.length < 1) return null;

    const name = parts[0].replace(/['"]/g, '').trim();
    if (!name) return null;

    const paidStr = parts[1] ? parts[1].replace(/['"]/g, '').trim().toLowerCase() : '';
    const paid = paidStr === 'true' || paidStr === '1' || paidStr === 'sì' || paidStr === 'si' || paidStr === 'yes';

    const guest: Guest = {
      id: baseId,
      name,
      paid,
      qrCode: '', // QR code will be generated when guest is added to a party
      scanned: false,
      scanTime: null,
      listId: '', // Will be assigned to default list when added to party
    };
    
    return guest;
  } catch (error) {
    console.error('Errore nel parsing della riga:', line, error);
    return null;
  }
};

/**
 * Esporta la lista QR codes in formato CSV
 */
export const exportQRCodes = async (guests: Guest[]): Promise<boolean> => {
  try {
    if (guests.length === 0) {
      throw new Error('Nessun ospite da esportare');
    }

    const csvHeader = 'Nome,QR_Code,Pagato,Stato\n';
    const csvRows = guests.map(guest => {
      const status = guest.scanned ? 'Entrato' : 'Non entrato';
      return `"${guest.name}","${guest.qrCode}","${guest.paid ? 'Sì' : 'No'}","${status}"`
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const fileName = `qr_codes_festa_${formatDateForFileName(new Date())}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Condividi QR Codes',
        UTI: 'public.comma-separated-values-text',
      });
    }

    return true;
  } catch (error) {
    console.error('Errore nell\'esportazione QR codes:', error);
    return false;
  }
};

/**
 * Esporta un report dettagliato della festa
 */
export const exportPartyReport = async (guests: Guest[]): Promise<boolean> => {
  try {
    const stats = calculatePartyStats(guests);
    const reportContent = generateReportContent(guests, stats);
    
    const fileName = `report_festa_${formatDateForFileName(new Date())}.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, reportContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Condividi Report Festa',
      });
    }

    return true;
  } catch (error) {
    console.error('Errore nell\'esportazione del report:', error);
    return false;
  }
};

/**
 * Calcola le statistiche della festa
 */
const calculatePartyStats = (guests: Guest[]) => {
  const total = guests.length;
  const paid = guests.filter(g => g.paid).length;
  const scanned = guests.filter(g => g.scanned).length;
  const notPaid = total - paid;
  const notEntered = total - scanned;

  return {
    total,
    paid,
    scanned,
    notPaid,
    notEntered,
    paidPercentage: total > 0 ? Math.round((paid / total) * 100) : 0,
    attendancePercentage: total > 0 ? Math.round((scanned / total) * 100) : 0,
  };
};

/**
 * Genera il contenuto del report
 */
const generateReportContent = (guests: Guest[], stats: any): string => {
  const now = new Date().toLocaleString('it-IT');
  
  return `
🎉 REPORT FESTA - ${now}

📊 STATISTICHE GENERALI:
- Totale ospiti: ${stats.total}
- Hanno pagato: ${stats.paid} (${stats.paidPercentage}%)
- Non hanno pagato: ${stats.notPaid}
- Sono entrati: ${stats.scanned} (${stats.attendancePercentage}%)
- Non sono entrati: ${stats.notEntered}

👥 LISTA DETTAGLIATA OSPITI:
${guests.map((guest, index) => 
  `${index + 1}. ${guest.name}
     💰 Pagamento: ${guest.paid ? '✅ Pagato' : '❌ Non pagato'}
     🚪 Ingresso: ${guest.scanned ? `✅ Entrato (${guest.scanTime})` : '❌ Non entrato'}
     🔗 QR: ${guest.qrCode}
`).join('\n')}

📈 ANALISI:
- Tasso di partecipazione: ${stats.attendancePercentage}%
- Tasso di pagamento: ${stats.paidPercentage}%
- Ospiti paganti entrati: ${guests.filter(g => g.paid && g.scanned).length}
- Ospiti non paganti entrati: ${guests.filter(g => !g.paid && g.scanned).length}

Report generato automaticamente da Event List Manager
`;
};

/**
 * Formatta la data per il nome file
 */
const formatDateForFileName = (date: Date): string => {
  return date.toLocaleDateString('it-IT').replace(/\//g, '_');
};