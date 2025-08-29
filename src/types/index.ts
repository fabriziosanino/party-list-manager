export interface Guest {
  id: number;
  name: string;
  paid: boolean;
  qrCode: string;
  scanned: boolean;
  scanTime: string | null;
}

export interface NewGuest {
  name: string;
  paid: boolean;
}

export interface ScanResult {
  status: 'success' | 'payment' | 'invalid' | 'used';
  message: string;
  guest: string | null;
}

export interface GuestStats {
  total: number;
  paid: number;
  scanned: number;
}

export interface Party {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  lastModified: string;
  guestCount: number;
  paidCount: number;
  scannedCount: number;
}

export type RootStackParamList = {
  Home: undefined;
  Scanner: undefined;
  PartiesOverview: undefined;
};

export interface FileUploadResult {
  success: boolean;
  guestsAdded: number;
  error?: string;
}