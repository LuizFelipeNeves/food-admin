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
import { Additional, AdditionalGroup } from '@/data/products'

const additionalSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string(),
  price: z.string().refine((val) => !isNaN(Number(val)), 'Preço inválido'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  active: z.boolean(),
})

interface AdditionalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  additional: Additional | null
  additionalGroups: AdditionalGroup[]
  onSave: (data: Additional) => void
}

export function AdditionalDialog({
  open,
  onOpenChange,
  additional,
  additionalGroups,
  onSave,
}: AdditionalDialogProps) {
  const form = useForm<z.infer<typeof additionalSchema>>({
    resolver: zodResolver(additionalSchema),
    defaultValues: {
      name: additional?.name || '',
      description: additional?.description || '',
      price: additional?.price?.toString() || '',
      categoryId: additional?.categoryId || '',
      active: additional?.active ?? true,
    },
  })

  useEffect(() => {
    if (additional) {
      form.reset({
        name: additional.name,
        description: additional.description,
        price: additional.price.toString(),
        categoryId: additional.categoryId,
        active: additional.active,
      })
    }
  }, [additional, form])

  function onSubmit(values: z.infer<typeof additionalSchema>) {
    if (!additional) {
      return
    }

    onSave({
      _id: additional?._id,
      ...values,
      price: parseFloat(values.price),
    })
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do adicional" {...field} />
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

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {additionalGroups.map((group) => (
                          <SelectItem key={group._id} value={group._id as string}>
                            {group.name}
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
