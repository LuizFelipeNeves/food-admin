/**
 * Serviço para upload de imagens diretamente do cliente para o Cloudflare R2
 * usando URLs pré-assinadas
 */

// Função para obter uma URL de upload pré-assinada
export async function getUploadUrl(file: File, folder: string = 'general'): Promise<{
  uploadUrl: string;
  fileUrl: string;
  filePath: string;
}> {
  try {
    // Verificar se o arquivo é válido
    if (!file || !file.name || !file.type) {
      throw new Error('Arquivo inválido');
    }

    // Solicitar URL de upload ao servidor
    const response = await fetch('/api/r2/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder,
      }),
    });

    // Se a resposta não for ok, tentar obter detalhes do erro
    if (!response.ok) {
      let errorMessage = 'Erro ao obter URL de upload';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.error('Erro ao analisar resposta de erro:', parseError);
      }
      throw new Error(errorMessage);
    }

    // Analisar a resposta
    const data = await response.json();
    
    // Verificar se os dados necessários estão presentes
    if (!data.uploadUrl || !data.fileUrl || !data.filePath) {
      throw new Error('Resposta inválida do servidor');
    }
    
    return {
      uploadUrl: data.uploadUrl,
      fileUrl: data.fileUrl,
      filePath: data.filePath,
    };
  } catch (error) {
    console.error('Erro ao obter URL de upload:', error);
    throw error;
  }
}

// Função para fazer upload de uma imagem diretamente para o Cloudflare R2
// Retorna apenas o caminho relativo da imagem, não a URL completa
export async function uploadImage(file: File, folder: string = 'general'): Promise<string> {
  try {
    // Verificar se o arquivo é válido
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }
    
    // Verificar se o tipo do arquivo é uma imagem
    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo deve ser uma imagem');
    }

    // Obter URL de upload pré-assinada
    const { uploadUrl, filePath } = await getUploadUrl(file, folder);

    // Fazer upload diretamente para o R2 usando a URL pré-assinada
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      let errorMessage = 'Erro ao fazer upload da imagem';
      try {
        // Tentar obter detalhes do erro, se disponíveis
        const text = await uploadResponse.text();
        if (text) {
          errorMessage += `: ${text}`;
        }
      } catch (textError) {
        // Ignorar erros ao tentar ler o texto da resposta
      }
      throw new Error(errorMessage);
    }

    // Retornar apenas o caminho relativo da imagem
    return filePath;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}

// Função para excluir uma imagem
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    if (!imagePath) {
      console.error('deleteImage: Caminho da imagem não fornecido');
      throw new Error('Caminho da imagem não fornecido');
    }
    
    console.log('deleteImage: Tentando excluir imagem:', imagePath);
    
    // Se for uma URL completa, extrair o caminho
    const filePath = isFullUrl(imagePath) ? extractFilePath(imagePath) : imagePath;
    
    if (!filePath) {
      console.error('deleteImage: Caminho da imagem inválido ou não reconhecido:', imagePath);
      throw new Error('Caminho da imagem inválido ou não reconhecido');
    }

    console.log('deleteImage: Caminho processado para exclusão:', filePath);

    // Como a exclusão requer autenticação, precisamos chamar um endpoint no servidor
    const deleteUrl = `/api/r2/delete?filePath=${encodeURIComponent(filePath)}`;
    console.log('deleteImage: Chamando endpoint de exclusão:', deleteUrl);
    
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${deleteUrl}&_t=${timestamp}`;
    
    const response = await fetch(urlWithTimestamp, {
      method: 'DELETE',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    console.log('deleteImage: Resposta do servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      let errorMessage = 'Erro ao excluir a imagem';
      let errorDetails = {};
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        errorDetails = errorData;
        console.error('deleteImage: Resposta de erro do servidor:', errorData);
      } catch (parseError) {
        console.error('deleteImage: Erro ao analisar resposta de erro:', parseError);
        
        // Tentar obter o texto da resposta se não conseguir analisar como JSON
        try {
          const errorText = await response.text();
          errorDetails = { text: errorText };
          console.error('deleteImage: Texto da resposta de erro:', errorText);
        } catch (textError) {
          console.error('deleteImage: Não foi possível obter texto da resposta:', textError);
        }
      }
      
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }
    
    // Tentar obter a resposta de sucesso
    try {
      const successData = await response.json();
      console.log('deleteImage: Resposta de sucesso:', successData);
    } catch (parseError) {
      console.log('deleteImage: Não foi possível analisar resposta de sucesso como JSON');
    }
    
    console.log('deleteImage: Imagem excluída com sucesso:', filePath);
  } catch (error) {
    console.error('deleteImage: Erro ao excluir imagem:', error);
    throw error;
  }
}

// Verifica se uma string é uma URL completa
export function isFullUrl(path: string): boolean {
  try {
    return path.startsWith('http://') || path.startsWith('https://');
  } catch {
    return false;
  }
}

// Converte um caminho relativo para URL completa
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) {
    return null;
  }
  
  // Se já for uma URL completa, retornar como está
  if (isFullUrl(imagePath)) return imagePath;
  
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!R2_PUBLIC_URL) {
    console.error('Variável de ambiente R2_PUBLIC_URL não definida');
    return '';
  }
  
  // Montar a URL completa
  const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
  return `${baseUrl}${imagePath}`;
}

// Função auxiliar para extrair o caminho do arquivo da URL do R2
function extractFilePath(url: string): string | null {
  try {
    if (!url) return null;
    
    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (!R2_PUBLIC_URL) {
      console.error('Variável de ambiente NEXT_PUBLIC_R2_PUBLIC_URL não definida');
      return null;
    }
    
    // Remover a base da URL para obter o caminho relativo
    const basePath = R2_PUBLIC_URL.endsWith('/') 
      ? R2_PUBLIC_URL 
      : `${R2_PUBLIC_URL}/`;
      
    if (url.startsWith(basePath)) {
      return url.substring(basePath.length);
    }
    
    // Tentar extrair o caminho de uma URL genérica
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/') 
        ? urlObj.pathname.substring(1) 
        : urlObj.pathname;
    } catch (urlError) {
      console.error('Erro ao analisar URL:', urlError);
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair caminho do arquivo:', error);
    return null;
  }
} 