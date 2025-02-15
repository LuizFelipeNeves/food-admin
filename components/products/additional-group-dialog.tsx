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
import { AdditionalGroup, Additional } from '@/data/products'

const additionalGroupSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  minQuantity: z.string().refine((val) => !isNaN(Number(val)), 'Quantidade inválida'),
  maxQuantity: z.string().refine((val) => !isNaN(Number(val)), 'Quantidade inválida'),
  active: z.boolean(),
  additionals: z.array(z.string()),
})

interface AdditionalGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: AdditionalGroup | null
  additionals: Additional[]
  onSave: (data: AdditionalGroup) => void
  storeId: string
}

export function AdditionalGroupDialog({
  open,
  onOpenChange,
  category,
  additionals,
  onSave,
  storeId
}: AdditionalGroupDialogProps) {
  const form = useForm<z.infer<typeof additionalGroupSchema>>({
    resolver: zodResolver(additionalGroupSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      minQuantity: category?.minQuantity?.toString() || '0',
      maxQuantity: category?.maxQuantity?.toString() || '1',
      active: category?.active ?? true,
      additionals: category?.additionals || [],
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        minQuantity: category.minQuantity.toString(),
        maxQuantity: category.maxQuantity.toString(),
        active: category.active,
        additionals: category.additionals,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        minQuantity: '0',
        maxQuantity: '1',
        active: true,
        additionals: [],
      })
    }
  }, [category, form])

  function onSubmit(values: z.infer<typeof additionalGroupSchema>) {
    onSave({
      _id: category?._id,
      store: storeId,
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
          <DialogTitle>{category ? 'Editar' : 'Nova'} Grupo de Adicionais</DialogTitle>
          <DialogDescription>
            {category ? 'Edite os dados do grupo' : 'Adicione um novo grupo de adicionais'}
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
                    <Input placeholder="Nome do grupo" {...field} />
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
                    <Textarea placeholder="Descrição do grupo" {...field} />
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
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Grupo disponível para seleção
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

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {category ? 'Salvar' : 'Criar'} Grupo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
