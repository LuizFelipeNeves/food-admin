import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      console.error('[R2 Delete] Erro: Configurações do R2 não encontradas', {
        accountId: !!R2_ACCOUNT_ID,
        accessKeyId: !!R2_ACCESS_KEY_ID,
        secretAccessKey: !!R2_SECRET_ACCESS_KEY,
        bucketName: !!R2_BUCKET_NAME
      });
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
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

    // Executar comando de exclusão
    await s3Client.send(deleteObjectCommand);

    console.log(`[R2 Delete] Arquivo '${filePath}' excluído com sucesso`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[R2 Delete] Erro ao excluir arquivo:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
} 