'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCategory, AdditionalGroup, Product } from '@/data/products'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

const productSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  price: z.string().refine((val) => !isNaN(Number(val)), 'Preço inválido'),
  discountPercentage: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, 'Desconto inválido'),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Estoque inválido'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  subcategoryId: z.string().optional(),
  additionalGroups: z.array(z.string()).optional().default([]),
  active: z.boolean(),
})

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: ProductCategory[];
  additionalGroups: AdditionalGroup[];
  onSave: (product: Product) => void;
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
      name: product?.name || '',
      description: product?.description || '',
      price: (product?.price || 0).toString(),
      discountPercentage: (product?.discountPercentage || 0).toString(),
      stock: (product?.stock || 0).toString(),
      categoryId: product?.categoryId || '',
      subcategoryId: product?.subcategoryId || '',
      additionalGroups: product?.additionalGroups || [],
      active: product?.active ?? true,
    },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        price: String(product.price),
        discountPercentage: String(product.discountPercentage),
        stock: String(product.stock),
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || '',
        additionalGroups: product.additionalGroups || [],
        active: product.active,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        price: '0',
        discountPercentage: '0',
        stock: '0',
        categoryId: '',
        subcategoryId: '',
        additionalGroups: [],
        active: true,
      })
    }
  }, [product, form])

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    const formattedData = {
      ...(product?._id ? { _id: product._id } : {}),
      name: data.name,
      description: data.description,
      price: Number(data.price),
      discountPercentage: Number(data.discountPercentage),
      stock: Number(data.stock),
      category: data.categoryId,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || undefined,
      additionals: [],
      additionalGroups: data.additionalGroups || [],
      store: product?.store || '',
      active: data.active,
      image: product?.image
    }
    onSave(formattedData as Product)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Edite as informações do produto.' : 'Adicione um novo produto ao catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
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
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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
                    <Input type="number" step="0.01" {...field} />
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
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
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
                  <Select
                    onValueChange={(value) => {
                      const currentValues = field.value ?? []
                      if (currentValues.includes(value)) {
                        field.onChange(currentValues.filter((v) => v !== value))
                      } else {
                        field.onChange([...currentValues, value])
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione os grupos de adicionais" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {additionalGroups.map((group) => (
                        group._id ? (
                          <SelectItem key={group._id} value={group._id}>
                            {group.name}
                          </SelectItem>
                        ) : null
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(field.value ?? []).map((groupId) => {
                      const group = additionalGroups.find((g) => g._id === groupId)
                      if (!group) return null
                      return (
                        <div
                          key={groupId}
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                        >
                          <span>{group.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange((field.value ?? []).filter((v) => v !== groupId))
                            }}
                            className="text-sm hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
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

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {product ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
