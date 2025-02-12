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
import { ProductCategory, AdditionalCategory } from '@/data/products'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

const productSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  price: z.string().refine((val) => !isNaN(Number(val)), 'Preço inválido'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  subcategoryId: z.string().optional(),
  active: z.boolean(),
  additionalCategories: z.array(z.string()),
})

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  categoryId: string;
  subcategoryId?: string;
  additionalCategories?: string[];
  additionals?: string[];
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories: ProductCategory[];
  additionalCategories: AdditionalCategory[];
  onSave: (product: Product) => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  additionalCategories,
  onSave,
}: ProductDialogProps) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price.toString() || '',
      categoryId: product?.categoryId || '',
      subcategoryId: product?.subcategoryId || '',
      active: product?.active ?? true,
      additionalCategories: product?.additionalCategories || [],
    },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || '',
        active: product.active,
        additionalCategories: product.additionalCategories || [],
      })
    } else {
      form.reset({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        subcategoryId: '',
        active: true,
        additionalCategories: [],
      })
    }
  }, [product, form])

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    onSave({
      _id: product?._id || Math.random().toString(36).substring(7),
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      active: data.active,
      additionalCategories: data.additionalCategories,
      additionals: product?.additionals || [],
    })
    onOpenChange(false)
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
              name="additionalCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorias de Adicionais</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const currentValues = field.value || []
                      if (currentValues.includes(value)) {
                        field.onChange(currentValues.filter((v) => v !== value))
                      } else {
                        field.onChange([...currentValues, value])
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione as categorias" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {additionalCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((categoryId) => {
                      const category = additionalCategories.find((c) => c._id === categoryId)
                      if (!category) return null
                      return (
                        <div
                          key={categoryId}
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                        >
                          <span>{category.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value?.filter((v) => v !== categoryId))
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
