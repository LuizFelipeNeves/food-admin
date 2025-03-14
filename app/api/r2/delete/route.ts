import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';

/**
 * Endpoint para excluir arquivos do Cloudflare R2
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    console.log('[R2 Delete] Solicitação de exclusão recebida para:', filePath);

    if (!filePath) {
      console.error('[R2 Delete] Erro: Caminho do arquivo não fornecido');
      return NextResponse.json(
        { error: 'Caminho do arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Configurações do R2
    const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

    // Verificar se todas as configurações necessárias estão presentes
    const missingConfigs = [];
    if (!R2_ACCOUNT_ID) missingConfigs.push('R2_ACCOUNT_ID');
    if (!R2_ACCESS_KEY_ID) missingConfigs.push('R2_ACCESS_KEY_ID');
    if (!R2_SECRET_ACCESS_KEY) missingConfigs.push('R2_SECRET_ACCESS_KEY');
    if (!R2_BUCKET_NAME) missingConfigs.push('R2_BUCKET_NAME');

    if (missingConfigs.length > 0) {
      const errorMessage = `Configurações ausentes: ${missingConfigs.join(', ')}`;
      console.error('[R2 Delete] Erro: ' + errorMessage);
      return NextResponse.json(
        { error: 'Erro de configuração do servidor', details: errorMessage },
        { status: 500 }
      );
    }

    console.log(`[R2 Delete] Tentando excluir arquivo '${filePath}' do bucket '${R2_BUCKET_NAME}'`);

    // Configurar cliente S3 para Cloudflare R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    // Criar comando para exclusão
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
    });

    try {
      // Executar comando de exclusão
      const result = await s3Client.send(deleteObjectCommand);
      console.log(`[R2 Delete] Arquivo '${filePath}' excluído com sucesso`, result);
      return NextResponse.json({ 
        success: true,
        message: `Arquivo '${filePath}' excluído com sucesso`,
        filePath
      });
    } catch (deleteError) {
      // Tratar erros específicos do S3
      if (deleteError instanceof S3ServiceException) {
        console.error('[R2 Delete] Erro do serviço S3:', {
          name: deleteError.name,
          message: deleteError.message,
          code: deleteError.$metadata?.httpStatusCode
        });
        
        // Retornar mensagem de erro específica baseada no código
        const statusCode = deleteError.$metadata?.httpStatusCode || 500;
        const errorCode = deleteError.name;
        
        let errorMessage = 'Erro ao excluir arquivo';
        if (errorCode === 'NoSuchKey' || errorCode === 'NotFound') {
          errorMessage = 'Arquivo não encontrado';
        } else if (errorCode === 'AccessDenied') {
          errorMessage = 'Acesso negado ao arquivo';
        } else if (errorCode === 'NoSuchBucket') {
          errorMessage = 'Bucket não encontrado';
        }
        
        return NextResponse.json(
          { 
            error: errorMessage, 
            code: errorCode,
            details: deleteError.message
          },
          { status: statusCode }
        );
      }
      
      // Erro genérico
      console.error('[R2 Delete] Erro ao excluir arquivo:', deleteError);
      return NextResponse.json(
        { 
          error: 'Erro ao excluir arquivo',
          details: deleteError instanceof Error ? deleteError.message : 'Erro desconhecido'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[R2 Delete] Erro interno:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno no servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 