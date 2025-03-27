# Guia de Configuração e Uso do Sistema de Upload de Imagens

Este guia explica como configurar e utilizar o sistema de upload de imagens que permite o envio direto do cliente para o Cloudflare R2, sem passar pelo servidor.

## 1. Configuração do Cloudflare R2

### 1.1 Criar uma conta no Cloudflare e configurar o R2

1. Acesse [cloudflare.com](https://cloudflare.com/) e crie uma conta ou faça login
2. Ative o serviço R2 no seu painel do Cloudflare
3. Crie um bucket para armazenar as imagens da sua aplicação

### 1.2 Configurar um Worker para gerenciar uploads

Para permitir uploads diretos do cliente para o R2, você precisará criar um Worker que:

1. No dashboard do Cloudflare, vá para **Workers & Pages**
2. Clique em **Create a Service**
3. Crie um novo Worker que:
   - Receba arquivos via POST
   - Valide o tipo e tamanho do arquivo
   - Faça upload para o seu bucket R2
   - Retorne a URL do arquivo enviado
   - Implemente autenticação adequada

Exemplo simplificado de um Worker para upload:

```js
export default {
  async fetch(request, env) {
    // Verificar método e autenticação
    if (request.method !== 'POST') {
      return new Response('Método não permitido', { status: 405 });
    }
    
    try {
      // Processar o FormData
      const formData = await request.formData();
      const file = formData.get('file');
      const path = formData.get('path');
      
      if (!file || !path) {
        return new Response('Arquivo ou caminho não fornecido', { status: 400 });
      }
      
      // Upload para o R2
      await env.MY_BUCKET.put(path, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });
      
      // Retornar sucesso
      return new Response(JSON.stringify({ 
        success: true,
        url: `${env.PUBLIC_URL_BASE}/${path}`
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(`Erro: ${error.message}`, { status: 500 });
    }
  }
};
```

### 1.3 Configurar as políticas de CORS

Para permitir uploads do seu domínio:

1. No seu Worker, adicione os cabeçalhos CORS apropriados:

```js
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://seu-dominio.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Adicione esses cabeçalhos às suas respostas
```

### 1.4 Configurar as variáveis de ambiente

Adicione as seguintes variáveis ao arquivo `.env.local` na raiz do projeto:

```
# Configurações do Cloudflare R2 (Servidor)
R2_API_URL=seu_r2_api_url
R2_ACCESS_KEY=sua_r2_access_key
R2_SECRET_KEY=sua_r2_secret_key

# Configurações do Cloudflare R2 (Cliente)
NEXT_PUBLIC_R2_PUBLIC_URL_BASE=seu_r2_public_url_base
```

Substitua os valores pelos dados da sua conta Cloudflare:
- `seu_r2_api_url`: URL da API do seu Worker para operações no R2
- `sua_r2_access_key` e `sua_r2_secret_key`: Credenciais de API geradas no Cloudflare
- `seu_r2_upload_url`: URL pública do seu Worker para uploads
- `seu_r2_public_url_base`: URL base para acessar os arquivos (ex: seu domínio personalizado ou URL do R2)

## 2. Como o Sistema Funciona

### 2.1 Componentes Principais

O sistema de upload é composto por três componentes principais:

1. **Componente de Interface (ImageUpload)**
   - Localizado em: `components/ui/image-upload.tsx`
   - Fornece a interface de arrastar e soltar para upload de imagens

2. **Serviço de Upload**
   - Localizado em: `lib/upload-service.ts`
   - Gerencia o upload direto para o Cloudflare R2 e a exclusão de imagens

3. **API de Exclusão**
   - Localizado em: `app/api/r2/delete/route.ts`
   - Endpoint para excluir imagens do R2 (requer autenticação)

### 2.2 Fluxo de Upload

1. O usuário seleciona ou arrasta uma imagem para o componente `ImageUpload`
2. O componente captura o arquivo e o armazena temporariamente
3. Quando o formulário é enviado, o arquivo é enviado diretamente para o Worker do Cloudflare
4. O Worker processa o arquivo e o armazena no bucket R2
5. A URL da imagem retornada é salva no banco de dados

### 2.3 Fluxo de Exclusão

1. Quando uma imagem é substituída ou removida, o sistema identifica a URL da imagem antiga
2. O sistema extrai o caminho do arquivo da URL
3. Uma requisição é enviada para o endpoint de exclusão no servidor
4. O servidor usa as credenciais seguras para excluir a imagem do R2

## 3. Usando o Componente ImageUpload

### 3.1 Propriedades do Componente

```tsx
<ImageUpload
  value={string | null}       // URL atual da imagem (se existir)
  onChange={(file) => void}   // Função chamada quando uma imagem é selecionada
  aspectRatio="square"        // Proporção: "square", "wide" ou "tall"
  maxSize={5 * 1024 * 1024}   // Tamanho máximo em bytes (5MB padrão)
  accept={['image/jpeg', 'image/png', 'image/webp']} // Tipos aceitos
  disabled={boolean}          // Desabilitar o componente
  placeholder="Texto aqui"    // Texto de placeholder
  className="..."             // Classes CSS adicionais
/>
```

### 3.2 Exemplo de Implementação em um Formulário

```tsx
import { useState } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { uploadImage, deleteImage } from '@/lib/upload-service';

// No seu componente
const [imageFile, setImageFile] = useState<File | null>(null);
const [isUploading, setIsUploading] = useState(false);

// Função para lidar com a mudança de imagem
const handleImageChange = (file: File | null) => {
  setImageFile(file);
};

// No envio do formulário
async function onSubmit(values) {
  try {
    setIsUploading(true);
    
    // Se tiver um novo arquivo de imagem para upload
    let imageUrl = values.image;
    
    if (imageFile) {
      // Se já existir uma imagem, excluir a anterior
      if (values.image) {
        try {
          await deleteImage(values.image);
        } catch (error) {
          console.error('Erro ao excluir imagem anterior:', error);
        }
      }
      
      // Fazer upload da nova imagem
      imageUrl = await uploadImage(imageFile, 'pasta_destino');
    }
    
    // Salvar os dados com a URL da imagem
    await saveData({
      ...values,
      image: imageUrl,
    });
    
    // Limpar o arquivo após o upload bem-sucedido
    setImageFile(null);
  } catch (error) {
    console.error('Erro ao salvar:', error);
  } finally {
    setIsUploading(false);
  }
}

// No seu JSX
return (
  <FormField
    control={form.control}
    name="image"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Imagem</FormLabel>
        <FormControl>
          <ImageUpload
            value={field.value || ''}
            onChange={handleImageChange}
            aspectRatio="square"
            placeholder="Arraste ou clique para adicionar uma imagem"
            disabled={isUploading}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
```

## 4. Personalizações Avançadas

### 4.1 Personalizar o Componente ImageUpload

Você pode personalizar a aparência do componente modificando as classes CSS em `components/ui/image-upload.tsx`.

### 4.2 Configurar um Domínio Personalizado

Para melhorar a experiência do usuário e a segurança, você pode configurar um domínio personalizado para seus arquivos R2:

1. No dashboard do Cloudflare, vá para **R2** > seu bucket
2. Clique em **Settings** > **Public Access**
3. Configure um domínio personalizado ou use o domínio fornecido pelo Cloudflare
4. Atualize a variável `NEXT_PUBLIC_R2_PUBLIC_URL_BASE` com este domínio

### 4.3 Organização em Pastas

O sistema já organiza as imagens em pastas por tipo. Você pode modificar essa estrutura em `lib/upload-service.ts`:

```typescript
// Exemplo de modificação para adicionar subpastas por ID de loja
const path = `store/${storeId}/${folder}/${fullFileName}`;
```

## 5. Solução de Problemas

### 5.1 Erros Comuns

- **Erro de CORS**: Verifique se as políticas de CORS estão configuradas corretamente no seu Worker
- **Erro de Autenticação**: Verifique se as chaves de API estão corretas e têm as permissões necessárias
- **Tamanho de Arquivo**: Verifique se o arquivo não excede o limite configurado
- **Formato de Arquivo**: Verifique se o formato do arquivo é permitido

### 5.2 Depuração

Para depurar problemas de upload, você pode adicionar logs adicionais:

```typescript
// Em lib/upload-service.ts
console.log('Iniciando upload para R2', {
  uploadUrl: R2_UPLOAD_URL,
  hasPublicUrlBase: !!R2_PUBLIC_URL_BASE,
  fileSize: file.size,
  fileType: file.type,
  path: path
});

// Após a resposta
console.log('Resposta do R2:', response);
```

## 6. Considerações de Segurança

- **Autenticação**: Implemente autenticação adequada no seu Worker
- **Validação**: Sempre valide os tipos e tamanhos de arquivo no cliente E no servidor
- **Limites**: Configure limites de tamanho e quantidade de uploads
- **Monitoramento**: Monitore o uso do R2 para evitar abusos
- **Permissões**: Configure permissões adequadas para seu bucket R2

## 7. Recursos Adicionais

- [Documentação do Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Documentação de Workers](https://developers.cloudflare.com/workers/)
- [Guia de CORS no Cloudflare](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [Segurança no Cloudflare R2](https://developers.cloudflare.com/r2/data-access/public-buckets/) 