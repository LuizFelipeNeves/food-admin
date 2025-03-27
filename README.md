# Melhorias na Formatação de Datas nos Gráficos

## Visão Geral

Implementamos melhorias significativas na forma como as datas são exibidas em todos os componentes de gráficos da aplicação. Estas melhorias garantem que as datas sejam exibidas de forma consistente e correta em todos os gráficos, independentemente do formato em que são recebidas.

## Componentes Atualizados

Os seguintes componentes foram atualizados para suportar formatação de datas:

- `components/ui/chart.tsx`
- `components/ui/chart-client.tsx`
- `components/dashboard/chart-component.tsx`
- `components/analytics/revenue-chart.tsx`

## Funcionalidades Implementadas

### 1. Formatação Consistente de Datas

- Suporte para datas em formato ISO (ex: `2023-05-15T14:30:00Z`)
- Suporte para timestamps e outros formatos de data
- Formatação localizada para português brasileiro (ptBR)
- Formatos personalizáveis por componente (ex: `dd/MM/yyyy`, `dd/MM HH:mm`, `MMM/yyyy`)

### 2. Validação e Tratamento de Dados

- Validação de strings de data ISO
- Tratamento de erros durante a formatação
- Fallback para o valor original quando a formatação falha
- Ordenação de dados por data quando disponível

### 3. Exibição Aprimorada

- Formatação de categorias no eixo X
- Formatação de datas nos tooltips
- Rotação de labels para melhor legibilidade
- Ocultação de labels sobrepostas

### 4. Configuração Flexível

- Parâmetro `dateFormat` para personalizar o formato de data
- Parâmetro `categories` para fornecer categorias personalizadas
- Integração com o sistema de temas (claro/escuro)

## Exemplo de Uso

```tsx
<Chart
  config={chartConfig}
  series={series}
  dateFormat="dd/MM/yyyy HH:mm"
  categories={data.map(item => item.date)}
/>
```

## Benefícios

- **Consistência Visual**: Todas as datas são exibidas no mesmo formato em toda a aplicação
- **Localização**: Suporte para formatos de data em português brasileiro
- **Legibilidade**: Melhor organização e apresentação de dados temporais
- **Robustez**: Tratamento adequado de diferentes formatos de entrada e situações de erro

# Sistema de Upload de Imagens (Cliente)

## Visão Geral

Implementamos um sistema completo de upload de imagens diretamente do cliente para o Cloudflare R2, permitindo o upload de logos da empresa nas configurações e fotos de produtos no cadastro de produtos, sem a necessidade de passar pelo servidor. O sistema inclui compressão automática de imagens para otimizar o tamanho dos arquivos.

## Componentes e Serviços Criados

1. **Componente de Upload de Imagem**
   - `components/ui/image-upload.tsx`: Componente reutilizável para upload de imagens com suporte para upload direto e compressão automática

2. **Serviço de Upload**
   - `lib/upload-service.ts`: Funções para upload direto para o Cloudflare R2 usando URLs pré-assinadas e exclusão de imagens

3. **API de URLs Pré-assinadas**
   - `app/api/r2/upload/route.ts`: Endpoint para gerar URLs pré-assinadas para upload seguro

4. **API de Exclusão**
   - `app/api/r2/delete/route.ts`: Endpoint para processar exclusões de imagens (requer autenticação)

5. **Integração com Cloudflare R2**
   - Upload direto do cliente para o Cloudflare R2 usando URLs pré-assinadas
   - Acesso público às imagens através de URL configurável

## Funcionalidades Implementadas

### 1. Interface de Upload Intuitiva

- Suporte para arrastar e soltar (drag and drop)
- Visualização prévia da imagem
- Botão para remoção da imagem
- Feedback visual durante o upload e compressão
- Mensagens de erro claras
- Modo de upload direto integrado

### 2. Compressão Automática de Imagens

- Compressão de imagens no navegador antes do upload
- Configuração de qualidade ajustável (0 a 1)
- Redimensionamento automático para dimensões máximas
- Limitação de tamanho máximo em MB
- Indicador de progresso durante a compressão
- Fallback para o arquivo original em caso de erro

### 3. Validação e Segurança

- Validação de tipos de arquivo (apenas imagens)
- Limite de tamanho configurável
- Tratamento de erros durante o upload
- Sanitização de nomes de arquivo
- Upload seguro usando URLs pré-assinadas com tempo limitado

### 4. Gerenciamento de Recursos

- Exclusão automática de imagens antigas ao atualizar
- Organização em pastas por tipo (logos, produtos)
- Geração de nomes únicos para evitar conflitos
- Controle de acesso granular

### 5. Integração com Formulários

- Compatibilidade com React Hook Form
- Validação via Zod
- Estado de carregamento e feedback visual
- Callbacks para eventos de upload (início, fim, erro)

### 6. Performance Melhorada

- Compressão de imagens no cliente antes do upload
- Upload direto do cliente para o Cloudflare R2 via URLs pré-assinadas
- Redução da carga no servidor
- Melhor experiência do usuário com uploads mais rápidos
- Processamento paralelo de uploads

## Configuração

Para configurar o sistema de upload, adicione as seguintes variáveis ao arquivo `.env.local`:

```
# Configurações do Cloudflare R2 (Servidor)
R2_ACCOUNT_ID=seu_account_id
R2_ACCESS_KEY_ID=sua_access_key
R2_SECRET_ACCESS_KEY=sua_secret_key
R2_BUCKET_NAME=nome_do_seu_bucket
NEXT_PUBLIC_R2_PUBLIC_URL=url_publica_do_bucket

# Configurações do Cloudflare R2 (Cliente)
NEXT_PUBLIC_R2_PUBLIC_URL=url_publica_do_bucket
```

### Configurando o Cloudflare R2

1. Crie um bucket no Cloudflare R2 através do dashboard do Cloudflare
2. Configure o acesso público ao bucket (opcional, mas recomendado)
3. Configure as políticas de CORS apropriadas para permitir uploads do seu domínio
4. Gere chaves de API com permissões adequadas
5. Configure um domínio personalizado para acessar seus arquivos (opcional)

## Exemplo de Uso

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

// Em um componente de formulário
<FormField
  control={form.control}
  name="image"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Imagem do Produto</FormLabel>
      <FormControl>
        <ImageUpload
          value={field.value || ''}
          onChange={(file, url) => {
            if (url) {
              // O upload direto foi bem-sucedido
              form.setValue('image', url);
            } else if (file === null) {
              // A imagem foi removida
              form.setValue('image', null);
            }
          }}
          aspectRatio="square"
          placeholder="Arraste ou clique para adicionar uma imagem"
          folder="products"
          directUpload={true}
          onUploadStart={() => setIsSubmitting(true)}
          onUploadEnd={() => setIsSubmitting(false)}
          onUploadError={(error) => {
            console.error('Erro no upload:', error);
            form.setError('image', { 
              message: 'Erro ao fazer upload da imagem' 
            });
          }}
          // Opções de compressão
          compression={true}
          compressionQuality={0.8}
          maxWidthOrHeight={1200}
          maxSizeMB={0.8}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Opções de Compressão

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `compression` | boolean | `true` | Ativa ou desativa a compressão de imagens |
| `compressionQuality` | number | `0.8` | Qualidade da imagem comprimida (0 a 1) |
| `maxWidthOrHeight` | number | `1920` | Dimensão máxima da imagem em pixels |
| `maxSizeMB` | number | `1` | Tamanho máximo da imagem em MB após compressão |

## Benefícios

- **Experiência do Usuário**: Interface intuitiva e responsiva para upload de imagens
- **Otimização de Imagens**: Compressão automática para reduzir o tamanho dos arquivos
- **Performance**: Upload direto do cliente para o Cloudflare R2 via URLs pré-assinadas
- **Segurança**: Validação de tipos e tamanhos de arquivo, URLs pré-assinadas com tempo limitado
- **Manutenção**: Código modular e reutilizável com callbacks para eventos
- **Escalabilidade**: Armazenamento em nuvem com Cloudflare R2 e organização por pastas 