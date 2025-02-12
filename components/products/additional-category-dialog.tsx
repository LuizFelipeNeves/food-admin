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
import { AdditionalCategory, Additional } from '@/data/products'

const additionalCategorySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  minQuantity: z.string().refine((val) => !isNaN(Number(val)), 'Quantidade inválida'),
  maxQuantity: z.string().refine((val) => !isNaN(Number(val)), 'Quantidade inválida'),
  active: z.boolean(),
  additionals: z.array(z.string()),
})

interface AdditionalCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: AdditionalCategory | null
  additionals: Additional[]
  onSave: (data: AdditionalCategory) => void
}

export function AdditionalCategoryDialog({
  open,
  onOpenChange,
  category,
  additionals,
  onSave,
}: AdditionalCategoryDialogProps) {
  const form = useForm<z.infer<typeof additionalCategorySchema>>({
    resolver: zodResolver(additionalCategorySchema),
    defaultValues: {
      name: category?.name || '',
      minQuantity: category?.minQuantity?.toString() || '0',
      maxQuantity: category?.maxQuantity?.toString() || '1',
      additionals: category?.additionals || [],
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        minQuantity: category.minQuantity.toString(),
        maxQuantity: category.maxQuantity.toString(),
        additionals: category.additionals,
      })
    }
  }, [category, form])

  function onSubmit(values: z.infer<typeof additionalCategorySchema>) {
    if (!category) {
      return
    }

    onSave({
      _id: category._id,
      ...values,
      minQuantity: parseInt(values.minQuantity),
      maxQuantity: parseInt(values.maxQuantity),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar' : 'Nova'} Categoria de Adicionais</DialogTitle>
          <DialogDescription>
            {category ? 'Edite os dados da categoria' : 'Adicione uma nova categoria de adicionais'}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Mínima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Máxima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adicionais Disponíveis</FormLabel>
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
                        <SelectValue placeholder="Selecione os adicionais" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {additionals.map((additional) => (
                        <SelectItem key={additional._id} value={additional._id}>
                          {additional.name}
                          {field.value.includes(additional._id) && ' ✓'}
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
