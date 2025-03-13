import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Endpoint para gerar URLs de upload direto para o Cloudflare R2
 */
export async function POST(request: NextRequest) {
  try {
    // Obter dados da requisição
    const body = await request.json();
    const { fileName, fileType, folder = 'general' } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Nome do arquivo e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Configurações do R2
    const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
      console.error('Configurações do R2 não encontradas', {
        accountId: !!R2_ACCOUNT_ID,
        accessKeyId: !!R2_ACCESS_KEY_ID,
        secretAccessKey: !!R2_SECRET_ACCESS_KEY,
        bucketName: !!R2_BUCKET_NAME,
        publicUrl: !!R2_PUBLIC_URL
      });
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    // Gerar um nome de arquivo único
    const timestamp = Date.now();
    const sanitizedFileName = fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${sanitizedFileName}.${fileExt}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Configurar cliente S3 para Cloudflare R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    // Criar comando para upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
      ContentType: fileType,
    });

    // Gerar URL pré-assinada (válida por 1 hora)
    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });
    
    // URL pública do arquivo após o upload
    const publicUrl = `${R2_PUBLIC_URL}/${filePath}`;

    // Retornar URL de upload e URL final da imagem
    return NextResponse.json({
      uploadUrl,
      fileUrl: publicUrl,
      filePath,
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    });
  } catch (error) {
    console.error('Erro ao gerar URL de upload:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
} 