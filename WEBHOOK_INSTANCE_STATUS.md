
## 📊 Eventos Suportados

| Evento | Código | Descrição | Quando Ocorre |
|--------|--------|-----------|---------------|
| `login_success` | `LOGIN_SUCCESS` | Dispositivo autenticado com sucesso | Após login via QR Code ou sessão existente |
| `connected` | `LIST_DEVICES` | Dispositivo conectado e pronto | Quando o dispositivo está online e operacional |
| `disconnected` | `LIST_DEVICES` | Dispositivo desconectado | Perda de conexão ou logout |
| `auth_failed` | `AUTH_FAILURE` | Falha na autenticação | Credenciais inválidas ou sessão expirada |
| `container_event` | `GENERIC` | Outros eventos do container | Eventos diversos do processo WhatsApp |

## 📦 Formato do Payload

### Estrutura Base
```json
{
  "device": {
    "deviceHash": "string"
  },
  "event": {
    "type": "string",
    "code": "string",
    "message": "string",
    "data": "object|null"
  },
  "timestamp": "string (ISO 8601)"
}
```

### Campos Detalhados

#### Device Object
- `deviceHash`: Hash único do dispositivo (formato: `a1b2c3d4e5f67890`)
- `status`: Status atual do dispositivo (ver tabela de status abaixo)

#### Status do Dispositivo
| Status | Descrição | Quando Ocorre | Contexto |
|--------|-----------|---------------|----------|
| `connected` | WhatsApp conectado | Dispositivo autenticado e funcional | Status WhatsApp |
| `disconnected` | WhatsApp desconectado | Perda de conexão com WhatsApp | Status WhatsApp |
| `active` | Dispositivo ativo | Container + WhatsApp funcionando | Status Dispositivo |
| `running` | Container rodando | Processo WhatsApp em execução | Status Container |
| `stopped` | Container parado | Processo WhatsApp finalizado | Status Container |
| `error` | Erro no sistema | Falha no container ou autenticação | Status Geral |

#### Event Object  
- `type`: Tipo do evento (ver tabela de eventos)
- `code`: Código interno do evento
- `message`: Descrição legível do evento
- `data`: Dados adicionais específicos do evento (opcional)

## 🔐 Segurança

### Verificação de Assinatura
Se você configurou um `statusWebhookSecret`, todas as requisições incluirão o header `X-Webhook-Signature`:

```
X-Webhook-Signature: a1b2c3d4e5f6...
```

### Validação (Node.js)
```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Uso
app.post('/webhook/status', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!validateWebhook(payload, signature, 'meu-secret')) {
    return res.status(401).send('Unauthorized');
  }
  
  // Processar webhook...
  res.status(200).send('OK');
});
```

### Validação (Python)
```python
import hmac
import hashlib

def validate_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

## 💡 Exemplos Práticos

### 1. Login Bem-sucedido
```json
{
  "device": {
    "deviceHash": "a1b2c3d4e5f67890",
    "status": "connected"
  },
  "event": {
    "type": "login_success",
    "code": "LOGIN_SUCCESS",
    "message": "Successfully pair with WhatsApp device",
    "device_info": {
      "id": "device-12@s.whatsapp.net"
    }
  },
  "timestamp": "2025-08-12T15:30:45.123Z"
}
```

### 2. Dispositivo Conectado
```json
{
  "device": {
    "deviceHash": "a1b2c3d4e5f67890",
    "status": "connected"
  },
  "event": {
    "type": "connected",
    "code": "LIST_DEVICES", 
    "message": "Device connected and ready",
    "devices": [
      {
        "device": "device-12@s.whatsapp.net"
      }
    ]
  },
  "timestamp": "2025-08-12T15:30:50.456Z"
}
```

### 3. Dispositivo Desconectado
```json
{
  "device": {
    "deviceHash": "a1b2c3d4e5f67890",
    "status": "disconnected"
  },
  "event": {
    "type": "disconnected", 
    "code": "LIST_DEVICES",
    "message": "Device disconnected",
    "devices": []
  },
  "timestamp": "2025-08-12T16:45:12.345Z"
}
```

### 4. Falha de Autenticação
```json
{
  "device": {
    "deviceHash": "a1b2c3d4e5f67890",
    "status": "error"
  },
  "event": {
    "type": "auth_failed",
    "code": "AUTH_FAILURE", 
    "message": "Authentication failed - session expired",
    "error": {
      "reason": "session_expired",
      "details": "WhatsApp session has expired"
    }
  },
  "timestamp": "2025-08-12T14:20:15.678Z"
}
```

### 5. Container Iniciado
```json
{
  "device": {
    "deviceHash": "a1b2c3d4e5f67890",
    "status": "running"
  },
  "event": {
    "type": "container_event",
    "code": "CONTAINER_START",
    "message": "WhatsApp container started successfully",
    "data": {
      "container_id": "whatsapp-a1b2c3d4e5f67890",
      "port": 8000
    }
  },
  "timestamp": "2025-08-12T15:25:00.123Z"
}
```

### 6. Container Parado
```json
{
  "device": {
    "deviceHash": "a1b2c3d4e5f67890",
    "status": "stopped"
  },
  "event": {
    "type": "container_event",
    "code": "CONTAINER_STOP",
    "message": "WhatsApp container stopped",
    "data": {
      "reason": "manual_stop",
      "exit_code": 0
    }
  },
  "timestamp": "2025-08-12T16:30:45.456Z"
}
```