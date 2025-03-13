import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc as api } from '@/app/_trpc/client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { deleteImage } from '@/lib/upload-service'

const businessFormSchema = z.object({
  businessName: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(5, 'Descrição muito curta'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço muito curto'),
  logo: z.string().nullable().optional(),
})

export function BusinessSettings({ storeId }: { storeId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);

  const businessForm = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      logo: '',
    },
  })

  const { data: businessData, isLoading } = api.settings.getBusiness.useQuery({ storeId })
  const updateBusiness = api.settings.updateBusiness.useMutation({
    onSuccess: () => {
      toast.success('Informações da empresa atualizadas com sucesso', {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar informações: ${error.message}`, {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      })
    },
  })

  useEffect(() => {
    if (businessData) {
      businessForm.reset({
        businessName: businessData.businessName || '',
        description: businessData.description || '',
        email: businessData.email || '',
        phone: businessData.phone || '',
        address: businessData.address || '',
        logo: businessData.logo || '',
      })
      
      // Resetar a URL do logo carregado quando os dados do negócio mudarem
      setUploadedLogoUrl(null);
    }
  }, [businessData, businessForm])

  async function onBusinessSubmit(values: z.infer<typeof businessFormSchema>) {
    try {
      setIsSubmitting(true);
      
      // Se temos um logo anterior e um novo logo foi carregado, excluir o anterior
      if (businessData?.logo && uploadedLogoUrl && businessData.logo !== uploadedLogoUrl) {
        try {
          await deleteImage(businessData.logo);
        } catch (error) {
          console.error('Erro ao excluir logo anterior:', error);
          // Continuar mesmo se falhar a exclusão
        }
      }
      
      // Usar a URL do logo carregado ou o existente
      const logoUrl = uploadedLogoUrl || values.logo;
      
      // Atualizar os dados do negócio
      await updateBusiness.mutateAsync({
        storeId,
        businessName: values.businessName,
        description: values.description,
        phone: values.phone,
        address: values.address,
        logo: logoUrl || '',
      })
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar as configurações', {
        style: {
          borderRadius: '6px',
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Função para lidar com o upload de logo e receber a URL
  const handleLogoChange = async (file: File | null, url?: string) => {
    if (url) {
      // Se recebemos uma URL, significa que o upload direto foi bem-sucedido
      setUploadedLogoUrl(url);
      businessForm.setValue('logo', url);
    } else if (file === null) {
      // Se o arquivo for null, o usuário removeu o logo
      setUploadedLogoUrl(null);
      businessForm.setValue('logo', null);
    }
    // Se temos apenas o arquivo sem URL, o upload direto não está ativado
    // Nesse caso, não fazemos nada aqui, pois o upload seria feito no onSubmit
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Informações do Negócio</CardTitle>
        <CardDescription>
          Configure as informações básicas do seu negócio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...businessForm}>
          <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={businessForm.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Negócio</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da sua empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@seudominio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, bairro, cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={businessForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva seu negócio em poucas palavras"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessForm.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo da Empresa</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ''}
                          onChange={handleLogoChange}
                          aspectRatio="square"
                          className="max-w-[300px]"
                          placeholder="Arraste ou clique para adicionar a logo"
                          disabled={isSubmitting}
                          folder="logos"
                          directUpload={true}
                          onUploadStart={() => setIsSubmitting(true)}
                          onUploadEnd={() => setIsSubmitting(false)}
                          onUploadError={(error) => {
                            console.error('Erro no upload:', error);
                            businessForm.setError('logo', { 
                              message: 'Erro ao fazer upload da logo' 
                            });
                            toast.error('Erro ao fazer upload da logo', {
                              style: {
                                borderRadius: '6px',
                                background: '#333',
                                color: '#fff',
                              },
                            });
                          }}
                          compression={true}
                          compressionQuality={0.9}
                          maxWidthOrHeight={800}
                          maxSizeMB={0.5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || updateBusiness.isLoading || isSubmitting}
              className="w-full sm:w-auto"
            >
              {(updateBusiness.isLoading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
