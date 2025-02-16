'use client'

import { useEffect } from 'react'
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
})

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: ProductCategory[]
  additionalGroups: AdditionalGroup[]
  onSave: (data: {
    _id?: string
    name: string
    description: string
    price: number
    stock: number
    active: boolean
    category: string
    additionalGroups: string[]
    store: string
    discountPercentage: number
    additionals: string[]
  }) => void
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  additionalGroups,
  onSave,
}: ProductDialogProps) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '0',
      stock: '0',
      active: true,
      category: {
        value: '',
        label: ''
      },
      additionalGroups: [],
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (product) {
      // Encontra e mapeia a categoria do produto
      const category = categories.find(c => c._id === product.category._id)
      console.log('category', category, product.category)

      // Mapeia os grupos de adicionais
      const selectedGroups = product.additionalGroups?.map(id => {
        const group = additionalGroups.find(g => g._id === id)
        return group ? {
          value: group._id,
          label: group.name
        } : null
      }).filter(Boolean) as Option[]

      // Reset do formulário com os valores corretos
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock?.toString() || '0',
        active: product.active,
        category: category ? {
          value: category._id,
          label: category.name
        } : {
          value: '',
          label: ''
        },
        additionalGroups: selectedGroups,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        price: '0',
        stock: '0',
        active: true,
        category: {
          value: '',
          label: ''
        },
        additionalGroups: [],
      })
    }
  }, [product, categories, additionalGroups, form])

  function onSubmit(values: z.infer<typeof productSchema>) {
    onSave({
      _id: product?._id,
      name: values.name,
      description: values.description,
      price: Number(values.price),
      stock: Number(values.stock),
      active: values.active,
      category: values.category.value,
      additionalGroups: values.additionalGroups.map(g => g.value),
      store: product?.store || '',
      discountPercentage: 0,
      additionals: [],
    })
    form.reset()
    onOpenChange(false)
  }

  const categoryOptions = categories
    .filter(category => category._id)
    .map(category => ({
      value: category._id as string,
      label: category.name
    }))

  const additionalGroupOptions = additionalGroups
    .filter(group => group._id)
    .map(group => ({
      value: group._id as string,
      label: group.name
    }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar' : 'Criar'} Produto</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-2">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value)
                            form.trigger('price')
                          }}
                        />
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
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value)
                            form.trigger('stock')
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.value}
                        onValueChange={(value) => {
                          const category = categories.find(c => c._id === value)
                          field.onChange({
                            value,
                            label: category?.name || ''
                          })
                        }}
                      >
                        <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value as string}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-red-500" />
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
                        options={additionalGroupOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione os grupos..."
                        emptyMessage="Nenhum grupo encontrado."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ativo
                      </FormLabel>
                      <FormDescription>
                        Este produto está disponível para venda
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    onOpenChange(false)
                  }}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {product ? 'Salvar' : 'Criar'} Produto
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
