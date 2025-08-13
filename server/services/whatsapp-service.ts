interface WhatsAppAPIConfig {
  baseUrl: string;
}

interface CreateDevicePayload {
  name?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  statusWebhookUrl?: string;
  statusWebhookSecret?: string;
  autoStart?: boolean;
}

interface DeviceResponse {
  success: boolean;
  message: string;
  data: {
    deviceHash: string;
    phoneHash: string;
    name?: string;
    status: string;
    processInfo?: {
      pid: number;
      status: string;
      running: boolean;
      startedAt: string;
      port: number;
      deviceHash: string;
      sessionPath: string;
    };
  };
}

interface DeviceInfo {
  id: number;
  deviceHash: string;
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

  private async handleApiError(response: Response, operation: string): Promise<never> {
    let errorMessage = `Erro ao ${operation}`;
    
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        
        // Tenta extrair mensagem de erro de diferentes formatos possíveis
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error.message || errorMessage;
        } else if (errorData.details) {
          errorMessage = errorData.details;
        }
      } else {
        const textError = await response.text();
        if (textError) {
          errorMessage = textError;
        }
      }
    } catch {
      // Se falhar ao ler o erro, usa mensagens baseadas no status HTTP
      switch (response.status) {
        case 400:
          errorMessage = `Dados inválidos para ${operation}`;
          break;
        case 401:
          errorMessage = 'Token de autenticação inválido ou expirado';
          break;
        case 403:
          errorMessage = 'Acesso negado para esta operação';
          break;
        case 404:
          errorMessage = 'Dispositivo não encontrado';
          break;
        case 409:
          errorMessage = 'Conflito: dispositivo já existe ou está em uso';
          break;
        case 429:
          errorMessage = 'Muitas requisições. Tente novamente em alguns minutos';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor WhatsApp';
          break;
        case 503:
          errorMessage = 'Serviço WhatsApp temporariamente indisponível';
          break;
        default:
          errorMessage = `Erro ${response.status}: ${operation}`;
      }
    }

    throw new Error(errorMessage);
  }

  private getAuthHeaders() {
    const token = process.env.WHATSAPP_API_TOKEN;
    return {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createDevice(payload: CreateDevicePayload): Promise<DeviceResponse> {
    console.log('WhatsApp API - Creating device with payload:', payload);
    
    const response = await fetch(`${this.config.baseUrl}/api/devices`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    console.log('WhatsApp API - Response status:', response.status);
    console.log('WhatsApp API - Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      await this.handleApiError(response, 'criar dispositivo');
    }

    const result = await response.json();
    console.log('WhatsApp API - Response body:', result);
    
    return result;
  }

  async getDeviceInfo(deviceHash: string): Promise<DeviceInfo> {
    const response = await fetch(`${this.config.baseUrl}/api/devices/info`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
    });

    if (!response.ok) {
      await this.handleApiError(response, 'obter informações do dispositivo');
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
      await this.handleApiError(response, 'listar dispositivos');
    }

    return response.json();
  }

  async updateDevice(deviceHash: string, updateData: Partial<CreateDevicePayload>) {
    const response = await fetch(`${this.config.baseUrl}/api/devices`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      await this.handleApiError(response, 'atualizar dispositivo');
    }

    return response.json();
  }

  async deleteDevice(deviceHash: string, force: boolean = false) {
    const searchParams = new URLSearchParams();
    if (force) searchParams.set('force', 'true');

    const url = `${this.config.baseUrl}/api/devices/delete${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
    });

    if (!response.ok) {
      await this.handleApiError(response, 'remover dispositivo');
    }

    return response.json();
  }

  async startDevice(deviceHash: string) {
    const response = await fetch(`${this.config.baseUrl}/api/devices/start`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
    });

    if (!response.ok) {
      await this.handleApiError(response, 'iniciar dispositivo');
    }

    return response.json();
  }

  async stopDevice(deviceHash: string) {
    const response = await fetch(`${this.config.baseUrl}/api/devices/stop`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
    });

    if (!response.ok) {
      await this.handleApiError(response, 'parar dispositivo');
    }

    return response.json();
  }

  async restartDevice(deviceHash: string) {
    const response = await fetch(`${this.config.baseUrl}/api/devices/restart`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
    });

    if (!response.ok) {
      await this.handleApiError(response, 'reiniciar dispositivo');
    }

    return response.json();
  }

  async getQRCode(deviceHash: string): Promise<{ qrCode?: string }> {
    const response = await fetch(`${this.config.baseUrl}/api/app/login`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
    });

    if (!response.ok) {
      await this.handleApiError(response, 'obter código QR');
    }

    return response.json();
  }

  async logoutDevice(deviceHash: string) {
    const response = await fetch(`${this.config.baseUrl}/api/app/logout`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'x-instance-id': deviceHash,
      },
    });

    if (!response.ok) {
      await this.handleApiError(response, 'desconectar dispositivo');
    }

    return response.json();
  }
}

const whatsappConfig: WhatsAppAPIConfig = {
  baseUrl: process.env.WHATSAPP_API_BASE_URL || 'http://localhost:3000',
};

export const whatsAppService = new WhatsAppService(whatsappConfig);