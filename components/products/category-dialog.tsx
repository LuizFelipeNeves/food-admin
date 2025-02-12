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
  FormDescription,
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
  _id: z.string(),
  categoryId: z.string(),
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
  category: ProductCategory | null
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
      name: '',
      description: '',
      active: true,
      subcategories: [],
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        active: category.active,
        subcategories: category.subcategories || [],
      })
    } else {
      form.reset({
        name: '',
        description: '',
        active: true,
        subcategories: [],
      })
    }
  }, [category, form])

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    onSave({
      _id: category?._id || Math.random().toString(36).substring(7),
      name: data.name,
      description: data.description,
      active: data.active,
      subcategories: data.subcategories.map(sub => ({
        ...sub,
        _id: sub._id || Math.random().toString(36).substring(7),
        categoryId: category?._id || '',
      })),
    })
    onOpenChange(false)
  }

  const addSubcategory = () => {
    const subcategories = form.getValues('subcategories')
    form.setValue('subcategories', [
      ...subcategories,
      { 
        name: '', 
        description: '', 
        active: true, 
        _id: Math.random().toString(36).substring(7),
        categoryId: category?._id || '',
      },
    ])
  }

  const removeSubcategory = (index: number) => {
    const subcategories = form.getValues('subcategories')
    form.setValue(
      'subcategories',
      subcategories.filter((_, i) => i !== index)
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          <DialogDescription>
            {category ? 'Edite as informações da categoria.' : 'Adicione uma nova categoria ao catálogo.'}
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
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription>
                      Categoria disponível para uso
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Subcategorias</h4>
                <Button type="button" variant="outline" size="sm" onClick={addSubcategory}>
                  Adicionar
                </Button>
              </div>

              {form.watch('subcategories').map((_, index) => (
                <div key={index} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Subcategoria {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
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
                          <Input {...field} />
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subcategories.${index}.active`}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Subcategoria disponível para uso
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
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {category ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
