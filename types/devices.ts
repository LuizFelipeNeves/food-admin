/**
 * Tipos para dispositivos WhatsApp
 */

export interface Device {
  _id: string;
  name: string;
  deviceHash: string;
  status: 'active' | 'registered' | 'error' | 'stopped';
  isMain?: boolean;
  autoStart: boolean;
  lastSeen?: Date | null;
  company: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
  // Campos temporários que podem vir da API WhatsApp
  qrCode?: string;
  processStatus?: {
    status: string;
    containerId?: string;
  };
}

export interface DeviceEvent {
  _id: string;
  device: string;
  eventType: 'connected' | 'disconnected' | 'error' | 'qr_generated' | 'authenticated' | 'ready' | 'message_received' | 'message_sent';
  status: 'active' | 'registered' | 'error' | 'stopped';
  message?: string;
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para inputs das queries/mutations tRPC
export interface DeviceListInput {
  storeId: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface DeviceCreateInput {
  name: string;
  storeId: string;
  isMain: boolean;
  autoStart: boolean;
}

export interface DeviceControlInput {
  id: string;
  storeId: string;
}

export interface DeviceUpdateInput extends DeviceControlInput {
  name?: string;
  isMain?: boolean;
  autoStart?: boolean;
}

export interface DeviceDeleteInput extends DeviceControlInput {
  force?: boolean;
}

export interface DeviceHistoryInput extends DeviceControlInput {
  limit?: number;
  offset?: number;
  eventType?: string;
}

export interface DeviceStatsInput extends DeviceControlInput {
  days?: number;
}

// Tipos de resposta das queries/mutations
export interface QRCodeResponse {
  qrCode?: string;
  status: string;
  message?: string;
}

export interface DeviceListResponse {
  devices: Device[];
  total: number;
  hasMore: boolean;
}

export interface DeviceHistoryResponse {
  events: DeviceEvent[];
  total: number;
  hasMore: boolean;
}

export interface DeviceStatsResponse {
  stats: Array<{
    _id: string;
    total: number;
    events: Array<{
      date: string;
      count: number;
    }>;
  }>;
  uptime: number;
  uptimePercentage: number;
  totalEvents: number;
}