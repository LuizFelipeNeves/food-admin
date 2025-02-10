'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ProductCategory, ProductSubcategory } from '@/data/products'
import { X } from 'lucide-react'

const subcategorySchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  active: z.boolean(),
})

const categorySchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  active: z.boolean(),
  subcategories: z.array(subcategorySchema),
})

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ProductCategory
  onSave: (data: ProductCategory) => void
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryDialogProps) {
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      active: category?.active ?? true,
      subcategories: category?.subcategories || [],
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
        active: category.active,
        subcategories: category.subcategories,
      })
    }
  }, [category, form])

  function onSubmit(values: z.infer<typeof categorySchema>) {
    onSave({
      _id: category?._id,
      ...values,
      subcategories: values.subcategories.map(sub => ({
        ...sub,
        _id: Math.random().toString(36).substr(2, 9),
        categoryId: category?._id || '',
      })),
    })
    onOpenChange(false)
  }

  const addSubcategory = () => {
    const subcategories = form.getValues('subcategories')
    form.setValue('subcategories', [
      ...subcategories,
      { name: '', description: '', active: true } as ProductSubcategory,
    ])
  }

  const removeSubcategory = (index: number) => {
    const subcategories = form.getValues('subcategories')
    form.setValue('subcategories', subcategories.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar' : 'Nova'} Categoria</DialogTitle>
          <DialogDescription>
            {category ? 'Edite os dados da categoria' : 'Adicione uma nova categoria de produtos'}
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
                    <Input placeholder="Nome da categoria" {...field} />
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
                    <Textarea placeholder="Descrição da categoria" {...field} />
                  </FormControl>
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
                      Categoria disponível para uso
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Subcategorias</h3>
                <Button type="button" onClick={addSubcategory}>
                  Adicionar Subcategoria
                </Button>
              </div>

              {form.watch('subcategories').map((_, index) => (
                <div key={index} className="space-y-4 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Subcategoria {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubcategory(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`subcategories.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da subcategoria" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subcategories.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição da subcategoria" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subcategories.${index}.active`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Ativo</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {category ? 'Salvar' : 'Criar'} Categoria
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
