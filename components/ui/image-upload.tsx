'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { uploadImage } from '@/lib/upload-service';
import imageCompression from 'browser-image-compression';
import { getImageUrl } from '@/lib/upload-service';

export interface ImageUploadProps {
  onChange: (file: File | null, url?: string) => void;
  value?: string | null;
  maxSize?: number; // em bytes
  accept?: string[];
  className?: string;
  disabled?: boolean;
  previewClassName?: string;
  dropzoneClassName?: string;
  aspectRatio?: 'square' | 'wide' | 'tall';
  placeholder?: string;
  folder?: string;
  directUpload?: boolean;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onUploadError?: (error: Error) => void;
  id?: string;
  style?: React.CSSProperties;
  // Opções de compressão
  compression?: boolean;
  compressionQuality?: number; // 0 a 1, onde 1 é a melhor qualidade
  maxWidthOrHeight?: number; // dimensão máxima em pixels
  maxSizeMB?: number; // tamanho máximo em MB após compressão
  onDelete?: (url: string) => Promise<void>;
}

export function ImageUpload({
  onChange,
  value,
  maxSize = 5 * 1024 * 1024, // 5MB padrão
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  disabled = false,
  previewClassName,
  dropzoneClassName,
  aspectRatio = 'square',
  placeholder = 'Arraste uma imagem ou clique para selecionar',
  folder = 'general',
  directUpload = false,
  onUploadStart,
  onUploadEnd,
  onUploadError,
  id,
  style,
  // Opções de compressão
  compression = true,
  compressionQuality = 0.8,
  maxWidthOrHeight = 1920,
  maxSizeMB = 1,
  onDelete,
  ...props
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(value || null);
  const [error, setError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [compressionProgress, setCompressionProgress] = React.useState<number | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  // Função para comprimir a imagem
  const compressImage = async (file: File): Promise<File> => {
    if (!compression || !file.type.startsWith('image/')) {
      return file;
    }

    try {
      setCompressionProgress(0);
      
      const options = {
        maxSizeMB: maxSizeMB,
        maxWidthOrHeight: maxWidthOrHeight,
        useWebWorker: true,
        initialQuality: compressionQuality,
        onProgress: (progress: number) => {
          setCompressionProgress(Math.round(progress * 100));
        },
      };

      const compressedFile = await imageCompression(file, options);
      
      // Criar um novo File com o mesmo nome do original
      const newFile = new File([compressedFile], file.name, {
        type: compressedFile.type,
        lastModified: file.lastModified,
      });

      console.log(`Compressão: ${(file.size / (1024 * 1024)).toFixed(2)}MB -> ${(newFile.size / (1024 * 1024)).toFixed(2)}MB`);
      
      setCompressionProgress(null);
      return newFile;
    } catch (error) {
      console.error('Erro na compressão:', error);
      setCompressionProgress(null);
      return file; // Em caso de erro, retorna o arquivo original
    }
  };

  // Configurar o dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': accept,
    },
    maxSize,
    disabled: disabled || isUploading,
    onDrop: async (acceptedFiles) => {
      setError(null);
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Criar preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        
        if (directUpload) {
          try {
            setIsUploading(true);
            onUploadStart?.();
            
            // Comprimir a imagem antes do upload
            const processedFile = await compressImage(file);
            
            // Fazer upload direto
            const imageUrl = await uploadImage(processedFile, folder);
            
            // Notificar sobre o arquivo e URL
            onChange(processedFile, imageUrl);
          } catch (error) {
            console.error('Erro no upload direto:', error);
            setError('Erro ao fazer upload da imagem');
            onUploadError?.(error instanceof Error ? error : new Error('Erro desconhecido'));
          } finally {
            setIsUploading(false);
            onUploadEnd?.();
          }
        } else {
          try {
            // Comprimir a imagem mesmo sem upload direto
            const processedFile = await compressImage(file);
            
            // Apenas notificar sobre o arquivo
            onChange(processedFile);
          } catch (error) {
            console.error('Erro na compressão:', error);
            onChange(file); // Em caso de erro, usa o arquivo original
          }
        }
      }
    },
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError(`Arquivo muito grande. Tamanho máximo: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          setError(`Tipo de arquivo inválido. Aceitos: ${accept.join(', ')}`);
        } else {
          setError('Erro ao carregar arquivo');
        }
      }
    },
  });

  // Limpar o preview quando o componente for desmontado
  React.useEffect(() => {
    return () => {
      if (preview && !preview.startsWith('http')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Atualizar o preview quando o valor mudar externamente
  React.useEffect(() => {
    const url = value ? getImageUrl(value) : null;
    setPreview(url);
  }, [value]);

  // Função para remover a imagem
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('[ImageUpload] Botão de remover clicado', { 
      value, 
      hasOnDelete: !!onDelete,
      componentId: id || 'sem-id'
    });
    
    // Se temos um caminho de imagem e uma função onDelete, excluir a imagem
    if (value && onDelete) {
      try {
        setIsDeleting(true);
        setError(null);
        
        console.log('[ImageUpload] Iniciando exclusão da imagem', { 
          value,
          isUrl: value.startsWith('http'),
          folder
        });
        
        // Chamar a função onDelete fornecida pelo componente pai
        await onDelete(value);
        
        console.log('[ImageUpload] Imagem excluída com sucesso');
        
        // Limpar o preview e notificar o componente pai
        setPreview(null);
        onChange(null, undefined);
      } catch (error) {
        console.error('[ImageUpload] Erro ao excluir imagem:', error);
        setError('Erro ao excluir imagem');
        // Não limpar o preview ou notificar o componente pai em caso de erro
      } finally {
        setIsDeleting(false);
      }
    } else {
      // Se não temos um caminho de imagem ou função onDelete, apenas limpar o preview
      console.log('[ImageUpload] Sem caminho de imagem ou função onDelete, apenas limpando o preview', { 
        hasValue: !!value, 
        hasOnDelete: !!onDelete,
        value
      });
      
      // Mesmo sem onDelete, precisamos limpar o estado local e notificar o componente pai
      setPreview(null);
      onChange(null, undefined);
    }
    
    setError(null);
  };

  // Determinar classes de aspect ratio
  const aspectRatioClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]',
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          'flex flex-col items-center justify-center p-4 text-center',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          error ? 'border-destructive/50 bg-destructive/5' : '',
          (disabled || isUploading) ? 'opacity-50 cursor-not-allowed' : '',
          aspectRatioClasses[aspectRatio],
          dropzoneClassName
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className={cn('object-contain rounded-md', previewClassName)}
            />
            {!disabled && !isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm font-medium">
                    {compressionProgress !== null 
                      ? `Comprimindo: ${compressionProgress}%` 
                      : 'Enviando...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            {isDragActive ? (
              <>
                <Upload className="h-10 w-10 mb-2 text-primary" />
                <p className="text-sm font-medium">Solte a imagem aqui</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs">
                  Formatos: {accept.map(type => type.replace('image/', '.')).join(', ')}
                </p>
                <p className="text-xs">
                  Tamanho máximo: {(maxSize / (1024 * 1024)).toFixed(1)}MB
                </p>
                {compression && (
                  <p className="text-xs text-primary">
                    Com compressão automática
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
} 