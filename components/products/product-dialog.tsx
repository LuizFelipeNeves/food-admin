'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Product, ProductCategory, AdditionalCategory } from '@/data/products'

const productSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  price: z.string().refine((val) => !isNaN(Number(val)), 'Preço inválido'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  subcategoryId: z.string().optional(),
  active: z.boolean(),
  additionalCategories: z.array(z.string()),
})

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  categories: ProductCategory[]
  additionalCategories: AdditionalCategory[]
  onSave: (data: Product) => void
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  additionalCategories,
  onSave,
}: ProductDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState(product?.categoryId || '')

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price?.toString() || '',
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
        description: product.description,
        price: product.price.toString(),
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        active: product.active ?? true,
        additionalCategories: product.additionalCategories || [],
      })
      setSelectedCategory(product.categoryId)
    }
  }, [product, form])

  const subcategories = categories
    .find(cat => cat.id === selectedCategory)
    ?.subcategories || []

  function onSubmit(values: z.infer<typeof productSchema>) {
    onSave({
      _id: product?._id,
      ...values,
      price: parseFloat(values.price),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar' : 'Novo'} Produto</DialogTitle>
          <DialogDescription>
            {product ? 'Edite os dados do produto' : 'Adicione um novo produto ao cardápio'}
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

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedCategory(value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
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
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma subcategoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorias de Adicionais</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const current = new Set(field.value)
                      if (current.has(value)) {
                        current.delete(value)
                      } else {
                        current.add(value)
                      }
                      field.onChange(Array.from(current))
                    }}
                    value={field.value[field.value.length - 1] || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione as categorias de adicionais" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {additionalCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                          {field.value.includes(category.id) && ' ✓'}
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
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Produto disponível para venda
                    </div>
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

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {product ? 'Salvar' : 'Criar'} Produto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
