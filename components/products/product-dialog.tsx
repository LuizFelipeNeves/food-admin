'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCategory, AdditionalGroup, Product } from '@/data/products'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { MultiSelect, Option } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { deleteImage } from '@/lib/upload-service'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStoreId } from '@/hooks/useStoreId'

const productSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  price: z.string().min(1, 'Preço é obrigatório').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Preço inválido'),
  stock: z.string().min(1, 'Estoque é obrigatório').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Quantidade inválida'),
  active: z.boolean(),
  category: z.object({
    value: z.string().min(1, 'Selecione uma categoria'),
    label: z.string()
  }).refine((data) => data.value !== '', 'Selecione uma categoria'),
  additionalGroups: z.array(z.object({
    value: z.string(),
    label: z.string()
  })),
  discountPercentage: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), 'Desconto inválido'),
  image: z.string().nullable().optional(),
})

// Definir interface para o tipo de produto
interface ProductData {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  category: string;
  additionalGroups: string[];
  store: string;
  discountPercentage: number;
  additionals: any[];
  image?: string | null;
}

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: ProductCategory[]
  additionalGroups: AdditionalGroup[]
  onSave: (data: ProductData) => void
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  additionalGroups,
  onSave,
}: ProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [hasUnsavedImage, setHasUnsavedImage] = useState(false);
  const storeId = useStoreId();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      active: true,
      category: { value: '', label: '' },
      additionalGroups: [],
      discountPercentage: '',
      image: null,
    },
  })

  useEffect(() => {
    if (product) {
      const selectedCategory = categories.find(c => c._id === (typeof product.category === 'string' ? product.category : product.category._id))
      const selectedAdditionalGroups = additionalGroups
        .filter(g => product.additionalGroups?.includes(g._id || ''))
        .map(g => ({ value: g._id || '', label: g.name }))

      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        active: product.active,
        category: selectedCategory ? { value: selectedCategory._id || '', label: selectedCategory.name } : { value: '', label: '' },
        additionalGroups: selectedAdditionalGroups,
        discountPercentage: product.discountPercentage?.toString() || '',
        image: product.image || null,
      })
      
      // Resetar o caminho da imagem carregada quando o produto mudar
      setUploadedImagePath(null);
    } else {
      form.reset({
        name: '',
        description: '',
        price: '',
        stock: '',
        active: true,
        category: { value: '', label: '' },
        additionalGroups: [],
        discountPercentage: '',
        image: null,
      })
      
      // Resetar o caminho da imagem carregada quando o produto for limpo
      setUploadedImagePath(null);
    }
  }, [product, categories, additionalGroups, form])

  // Função para lidar com o fechamento do modal
  const handleOpenChange = (open: boolean) => {
    // Se o modal está sendo fechado e temos uma imagem não salva
    if (!open && hasUnsavedImage && uploadedImagePath) {
      const formValues = form.getValues();
      
      // Verificar se os campos obrigatórios estão preenchidos
      if (formValues.name && formValues.price && formValues.stock && formValues.category.value) {
        // Salvar automaticamente antes de fechar
        console.log('[ProductDialog] Fechando modal com imagem não salva, salvando automaticamente');
        toast.success('Salvando produto antes de fechar...', { duration: 2000 });
        
        // Criar objeto de produto
        const productData: ProductData = {
          name: formValues.name,
          description: formValues.description,
          price: Number(formValues.price),
          stock: Number(formValues.stock),
          active: formValues.active,
          category: formValues.category.value,
          additionalGroups: formValues.additionalGroups.map(g => g.value),
          store: storeId, // ID fixo da loja
          discountPercentage: formValues.discountPercentage ? Number(formValues.discountPercentage) : 0,
          additionals: [], // Será preenchido pelo backend
          image: uploadedImagePath, // Usar o novo caminho da imagem
        };
        
        // Se estamos editando um produto existente, adicionar o ID
        if (product && product._id) {
          productData._id = product._id;
        }
        
        // Chamar a função onSave para salvar/atualizar o produto no banco de dados
        onSave(productData);
        
        // Mostrar feedback para o usuário
        toast.success('Produto salvo automaticamente!');
      } else {
        // Se os campos obrigatórios não estão preenchidos, avisar o usuário
        toast.error('Imagem carregada será perdida! Preencha todos os campos obrigatórios para salvar.');
      }
    }
    
    // Resetar o estado
    setHasUnsavedImage(false);
    
    // Chamar a função original
    onOpenChange(open);
  };

  // Função para lidar com o upload de imagem e receber o caminho relativo
  const handleImageChange = async (file: File | null, imagePath?: string) => {
    if (imagePath) {
      // Se recebemos um caminho, significa que o upload direto foi bem-sucedido
      setUploadedImagePath(imagePath);
      form.setValue('image', imagePath);
      setHasUnsavedImage(true);
      
      // Salvar automaticamente o produto após o upload da imagem
      try {
        setIsSubmitting(true);
        
        // Obter os valores atuais do formulário
        const formValues = form.getValues();
        
        // Se estamos editando um produto existente e ele já tem uma imagem, excluir a imagem anterior
        if (product?.image && product.image !== imagePath) {
          try {
            console.log('[ProductDialog] Excluindo imagem anterior do storage:', product.image);
            toast.success('Removendo imagem anterior...', { duration: 2000 });
            await deleteImage(product.image);
            console.log('[ProductDialog] Imagem anterior excluída com sucesso');
          } catch (deleteError) {
            console.error('[ProductDialog] Erro ao excluir imagem anterior:', deleteError);
            toast.error('Erro ao remover imagem anterior, mas o produto será atualizado');
            // Continuar mesmo se falhar a exclusão
          }
        }
        
        // Verificar se os campos obrigatórios estão preenchidos
        const camposObrigatorios = {
          nome: !!formValues.name,
          preco: !!formValues.price,
          estoque: !!formValues.stock,
          categoria: !!formValues.category.value
        };
        
        const todosPreenchidos = Object.values(camposObrigatorios).every(Boolean);
        
        if (!todosPreenchidos) {
          console.log('[ProductDialog] Alguns campos obrigatórios não preenchidos:', camposObrigatorios);
          toast.success('Imagem carregada! Preencha todos os campos obrigatórios para salvar o produto completo.');
          
          // Não tentamos salvar automaticamente se os campos obrigatórios não estiverem preenchidos
          // Mas mantemos a imagem carregada para que o usuário possa preencher os campos e salvar
          return;
        }
        
        // Criar objeto de produto
        const productData: ProductData = {
          name: formValues.name,
          description: formValues.description,
          price: Number(formValues.price),
          stock: Number(formValues.stock),
          active: formValues.active,
          category: formValues.category.value,
          additionalGroups: formValues.additionalGroups.map(g => g.value),
          store: storeId, // ID fixo da loja
          discountPercentage: formValues.discountPercentage ? Number(formValues.discountPercentage) : 0,
          additionals: [], // Será preenchido pelo backend
          image: imagePath, // Usar o novo caminho da imagem
        };
        
        // Se estamos editando um produto existente, adicionar o ID
        if (product && product._id) {
          productData._id = product._id;
        }
        
        console.log('[ProductDialog] Salvando produto automaticamente após upload da imagem:', productData);
        toast.success('Salvando produto...', { duration: 2000 });
        
        // Chamar a função onSave para salvar/atualizar o produto no banco de dados
        onSave(productData);
        
        // Mostrar feedback para o usuário
        const isNewProduct = !product;
        toast.success(
          isNewProduct 
            ? `Produto "${productData.name}" criado com sucesso!` 
            : `Produto "${productData.name}" atualizado com sucesso!`
        );
        
        // Fechar o modal apenas para novos produtos
        if (isNewProduct) {
          onOpenChange(false);
        }
        // Para produtos existentes, mantemos o modal aberto para permitir outras edições
        
        // Resetar o estado de imagem não salva
        setHasUnsavedImage(false);
      } catch (error) {
        console.error('[ProductDialog] Erro ao salvar produto após upload da imagem:', error);
        toast.error('Erro ao salvar produto. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (file === null) {
      // Se o arquivo for null, o usuário removeu a imagem
      // Não precisamos excluir a imagem aqui, pois isso será feito pelo componente ImageUpload
      setUploadedImagePath(null);
      form.setValue('image', null);
      setHasUnsavedImage(false);
    }
    // Se temos apenas o arquivo sem caminho, o upload direto não está ativado
    // Nesse caso, não fazemos nada aqui, pois o upload seria feito no onSubmit
  };

  // Função para excluir uma imagem
  const handleDeleteImage = async (imagePath: string): Promise<void> => {
    try {
      setIsDeleting(true);
      console.log('[ProductDialog] Iniciando exclusão da imagem:', imagePath);
      toast.success('Removendo imagem...', { duration: 2000 });
      
      // 1. Excluir a imagem do storage
      try {
        await deleteImage(imagePath);
        console.log('[ProductDialog] Imagem excluída do storage com sucesso');
      } catch (deleteError) {
        console.error('[ProductDialog] Erro ao excluir imagem do storage:', deleteError);
        toast.error(`Erro ao excluir imagem: ${deleteError instanceof Error ? deleteError.message : 'Erro desconhecido'}`);
        throw new Error(`Erro ao excluir imagem: ${deleteError instanceof Error ? deleteError.message : 'Erro desconhecido'}`);
      }
      
      // 2. Atualizar o produto no banco de dados (para produtos existentes e novos)
      console.log('[ProductDialog] Atualizando produto no banco de dados após remoção da imagem');
      
      // Obter os valores atuais do formulário
      const formValues = form.getValues();
      
      // Verificar se os campos obrigatórios estão preenchidos
      if (!formValues.name || !formValues.price || !formValues.stock || !formValues.category.value) {
        console.log('[ProductDialog] Campos obrigatórios não preenchidos, não salvando automaticamente');
        toast.error('Preencha todos os campos obrigatórios antes de remover a imagem');
        
        // Limpar o campo de imagem no formulário
        form.setValue('image', null);
        setUploadedImagePath(null);
        
        return Promise.resolve();
      }
      
      // Criar objeto de produto sem a imagem
      const productData: ProductData = {
        name: formValues.name,
        description: formValues.description,
        price: Number(formValues.price),
        stock: Number(formValues.stock),
        active: formValues.active,
        category: formValues.category.value,
        additionalGroups: formValues.additionalGroups.map(g => g.value),
        store: storeId, // ID fixo da loja
        discountPercentage: formValues.discountPercentage ? Number(formValues.discountPercentage) : 0,
        additionals: [], // Será preenchido pelo backend
        image: null, // Definir a imagem como null
      };
      
      // Se estamos editando um produto existente, adicionar o ID
      if (product && product._id) {
        productData._id = product._id;
      }
      
      try {
        // Chamar a função onSave para atualizar o produto no banco de dados
        console.log('[ProductDialog] Enviando atualização para o servidor:', productData);
        toast.success('Salvando produto sem imagem...', { duration: 2000 });
        onSave(productData);
        
        // Mostrar feedback para o usuário
        toast.success(`Produto atualizado sem imagem!`);
        
        // Fechar o modal após a atualização
        console.log('[ProductDialog] Fechando modal após atualização');
        onOpenChange(false);
      } catch (saveError) {
        console.error('[ProductDialog] Erro ao atualizar produto no banco de dados:', saveError);
        toast.error('Erro ao atualizar produto no banco de dados');
        throw new Error('Erro ao atualizar produto no banco de dados');
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('[ProductDialog] Erro ao excluir imagem:', error);
      throw error; // Propagar o erro para o componente ImageUpload
    } finally {
      setIsDeleting(false);
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      setIsSubmitting(true);
      
      // Se temos uma imagem anterior e uma nova imagem foi carregada, excluir a anterior
      if (product?.image && uploadedImagePath && product.image !== uploadedImagePath) {
        try {
          console.log('[ProductDialog] Excluindo imagem anterior do storage:', product.image);
          toast.success('Removendo imagem anterior...', { duration: 2000 });
          await deleteImage(product.image);
          console.log('[ProductDialog] Imagem anterior excluída com sucesso');
        } catch (error) {
          console.error('[ProductDialog] Erro ao excluir imagem anterior:', error);
          toast.error('Erro ao remover imagem anterior, mas o produto será atualizado');
          // Continuar mesmo se falhar a exclusão
        }
      }
      
      // Usar o caminho da imagem carregada ou o existente
      const imagePath = uploadedImagePath || values.image;
      
      // Criar objeto de produto
      const productData: ProductData = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        stock: Number(values.stock),
        active: values.active,
        category: values.category.value,
        additionalGroups: values.additionalGroups.map(g => g.value),
        store: storeId, // ID fixo da loja
        discountPercentage: values.discountPercentage ? Number(values.discountPercentage) : 0,
        additionals: [], // Será preenchido pelo backend
        image: imagePath,
      };
      
      // Se estamos editando um produto existente, adicionar o ID
      if (product && product._id) {
        productData._id = product._id;
      }
      
      console.log('[ProductDialog] Salvando produto pelo botão de submit:', productData);
      toast.success('Salvando produto...', { duration: 2000 });
      
      // Chamar a função onSave para salvar/atualizar o produto no banco de dados
      onSave(productData);
      
      // Mostrar feedback para o usuário
      const isNewProduct = !product;
      toast.success(
        isNewProduct 
          ? `Produto "${productData.name}" criado com sucesso!` 
          : `Produto "${productData.name}" atualizado com sucesso!`
      );
      
      // Resetar o estado de imagem não salva
      setHasUnsavedImage(false);
      
      // Fechar o modal
      onOpenChange(false);
    } catch (error) {
      console.error('[ProductDialog] Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden w-[95vw]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Edite as informações do produto' : 'Adicione um novo produto ao catálogo'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque</FormLabel>
                      <FormControl>
                        <Input placeholder="Quantidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                          Produto disponível para venda
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={(value: string) => {
                          if (typeof value === 'string') {
                          const category = categories.find(c => c._id === value)
                          field.onChange({
                            value,
                              label: category ? category.name : '' 
                          })
                          }
                        }}
                        value={field.value.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id || 'no-id'} value={category._id || ''}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalGroups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupos de Adicionais</FormLabel>
                    <FormControl>
                      <MultiSelect
                          options={additionalGroups
                            .filter(g => g._id) // Filtra apenas grupos com ID válido
                            .map(g => ({ 
                              value: g._id || '', 
                              label: g.name 
                            }))}
                        selected={field.value}
                        onChange={field.onChange}
                          placeholder="Selecione os grupos"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                  name="description"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                    <FormControl>
                        <Textarea
                          placeholder="Descreva o produto..."
                          className="min-h-[80px]"
                          {...field}
                      />
                    </FormControl>
                      <FormMessage />
                  </FormItem>
                )}
              />
                
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem do Produto</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ''}
                          onChange={handleImageChange}
                          onDelete={handleDeleteImage}
                          aspectRatio="square"
                          placeholder="Arraste ou clique para adicionar uma imagem"
                          disabled={isSubmitting || isDeleting}
                          folder="products"
                          directUpload={true}
                          onUploadStart={() => {
                            setIsSubmitting(true);
                            toast.success('Enviando imagem...', { duration: 2000 });
                          }}
                          onUploadEnd={() => setIsSubmitting(false)}
                          onUploadError={(error) => {
                            console.error('Erro no upload:', error);
                            toast.error(`Erro ao fazer upload da imagem: ${error.message}`);
                            form.setError('image', { 
                              message: 'Erro ao fazer upload da imagem' 
                            });
                          }}
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
              </div>
            </div>

              <DialogFooter>
                <Button
                type="button" 
                  variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isDeleting}
                >
                  Cancelar
                </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || isDeleting}
              >
                {(isSubmitting || isDeleting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Atualizar' : 'Criar'} Produto
                </Button>
              </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
