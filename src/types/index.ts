export interface Guest {
  id: number;
  name: string;
  paid: boolean;
  qrCode: string;
  scanned: boolean;
  scanTime: string | null;
  listId: string;
}

export interface NewGuest {
  name: string;
  paid: boolean;
  listId: string;
}

export interface GuestList {
  id: string;
  name: string;
  color: string;
  partyId: string;
  createdAt: string;
  guestCount: number;
}

export interface ScanResult {
  status: 'success' | 'payment' | 'invalid' | 'used';
  message: string;
  guest: string | null;
  listName?: string;
}

export interface GuestStats {
  total: number;
  paid: number;
  scanned: number;
  unpaid: number;
}

export interface Party {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  lastModified: string;
  guestCount: number;
  paidCount: number;
  unpaidCount: number;
  scannedCount: number;
  lists: GuestList[];
  eventPhoto?: string; // URI della foto dell'evento
  startTime?: string; // Orario di inizio dell'evento (formato ISO string)
}

export type RootStackParamList = {
  Home: undefined;
  Scanner: undefined;
  PartiesOverview: undefined;
};

export interface FileUploadResult {
  success: boolean;
  guestsAdded: number;
  guests?: Guest[];
  error?: string;
}