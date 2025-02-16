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
import { Switch } from '@/components/ui/switch'
import { Additional } from '@/data/products'

const additionalSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  price: z.string()
    .min(1, 'Preço é obrigatório')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0, 
      'Preço deve ser maior ou igual a 0'
    ),
  stock: z.string()
    .min(1, 'Estoque é obrigatório')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0, 
      'Estoque deve ser maior ou igual a 0'
    ),
  active: z.boolean(),
})

interface AdditionalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  additional: Additional | null
  onSave: (data: Additional) => void
}

export function AdditionalDialog({
  open,
  onOpenChange,
  additional,
  onSave,
}: AdditionalDialogProps) {
  const form = useForm<z.infer<typeof additionalSchema>>({
    resolver: zodResolver(additionalSchema),
    defaultValues: {
      name: '',
      price: '0',
      stock: '0',
      active: true,
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (additional) {
      form.reset({
        name: additional.name,
        price: additional.price.toString(),
        active: additional.active,
        stock: additional.stock?.toString() || '0',
      })
    } else {
      form.reset({
        name: '',
        price: '0',
        stock: '0',
        active: true,
      })
    }
  }, [additional, form])

  function onSubmit(values: z.infer<typeof additionalSchema>) {
    if (!form.formState.isValid) return;
    
    onSave({
      _id: additional?._id,
      name: values.name,
      price: Number(values.price),
      stock: Number(values.stock),
      active: values.active,
    })
    
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{additional ? 'Editar' : 'Novo'} Adicional</DialogTitle>
          <DialogDescription>
            {additional ? 'Edite os dados do adicional' : 'Adicione um novo adicional ao cardápio'}
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
                    <Input placeholder="Nome do adicional" {...field} />
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
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Adicional disponível para venda
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
                {additional ? 'Salvar' : 'Criar'} Adicional
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
