interface WhatsAppAPIConfig {
  baseUrl: string;
}

interface CreateDevicePayload {
  phoneNumber: string;
  name?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  statusWebhookUrl?: string;
  statusWebhookSecret?: string;
  autoStart?: boolean;
}

interface DeviceResponse {
  deviceHash: string;
  phoneNumber: string;
  name?: string;
  status: string;
  webhookUrl?: string;
  webhookSecret?: string;
  statusWebhookUrl?: string;
  statusWebhookSecret?: string;
}

interface DeviceInfo {
  id: number;
  deviceHash: string;
  phoneNumber: string;
  name?: string;
  status: string;
  processStatus: {
    status: string;
    containerId?: string;
  };
  qrCode?: string;
  lastSeen?: string;
  createdAt: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export class WhatsAppService {
  private config: WhatsAppAPIConfig;

  constructor(config: WhatsAppAPIConfig) {
    this.config = config;
  }

  private getAuthHeaders() {
    const token = process.env.WHATSAPP_API_TOKEN;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createDevice(payload: CreateDevicePayload): Promise<DeviceResponse> {
    const response = await fetch(`${this.config.baseUrl}/api/devices`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create device: ${error}`);
    }

    return response.json();
  }

  async getDeviceInfo(phoneNumber: string): Promise<DeviceInfo> {
    const response = await fetch(`${this.config.baseUrl}/api/devices/info`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get device info: ${error}`);
    }

    return response.json();
  }

  async listDevices(filters?: { status?: string; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (filters?.status) searchParams.set('status', filters.status);
    if (filters?.limit) searchParams.set('limit', filters.limit.toString());
    if (filters?.offset) searchParams.set('offset', filters.offset.toString());

    const url = `${this.config.baseUrl}/api/devices${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list devices: ${error}`);
    }

    return response.json();
  }

  async updateDevice(phoneNumber: string, updateData: Partial<CreateDevicePayload>) {
    const response = await fetch(`${this.config.baseUrl}/api/devices`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update device: ${error}`);
    }

    return response.json();
  }

  async deleteDevice(phoneNumber: string, force: boolean = false) {
    const searchParams = new URLSearchParams();
    if (force) searchParams.set('force', 'true');

    const url = `${this.config.baseUrl}/api/devices/delete${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete device: ${error}`);
    }

    return response.json();
  }

  async startDevice(phoneNumber: string) {
    const response = await fetch(`${this.config.baseUrl}/api/devices/start`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start device: ${error}`);
    }

    return response.json();
  }

  async stopDevice(phoneNumber: string) {
    const response = await fetch(`${this.config.baseUrl}/api/devices/stop`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to stop device: ${error}`);
    }

    return response.json();
  }

  async restartDevice(phoneNumber: string) {
    const response = await fetch(`${this.config.baseUrl}/api/devices/restart`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to restart device: ${error}`);
    }

    return response.json();
  }

  async getQRCode(phoneNumber: string): Promise<{ qrCode?: string }> {
    const response = await fetch(`${this.config.baseUrl}/api/app/login`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get QR code: ${error}`);
    }

    return response.json();
  }

  async logoutDevice(phoneNumber: string) {
    const response = await fetch(`${this.config.baseUrl}/api/app/logout`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': phoneNumber,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to logout device: ${error}`);
    }

    return response.json();
  }
}

const whatsappConfig: WhatsAppAPIConfig = {
  baseUrl: process.env.WHATSAPP_API_BASE_URL || 'http://localhost:3000',
};

export const whatsAppService = new WhatsAppService(whatsappConfig);