'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
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
import { MultiSelect, Option } from "@/components/ui/multi-select"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AdditionalGroup, Additional } from '@/data/products'

const additionalGroupSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  additionals: z.array(z.object({
    value: z.string(),
    label: z.string()
  })),
  active: z.boolean(),
})

interface AdditionalGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: AdditionalGroup | null
  additionals: Additional[]
  onSave: (data: {
    _id?: string
    name: string
    additionals: string[]
    active: boolean
    store: string
    minQuantity: number
    maxQuantity: number
  }) => void
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
      name: '',
      additionals: [],
      active: true,
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (category) {
      const selectedAdditionals = category.additionals?.map(id => {
        const additional = additionals.find(a => a._id === id)
        return additional ? {
          value: additional._id,
          label: additional.name
        } : null
      }).filter(Boolean) as Option[]

      form.reset({
        name: category.name,
        additionals: selectedAdditionals,
        active: category.active,
      })
    } else {
      form.reset({
        name: '',
        additionals: [],
        active: true,
      })
    }
  }, [category, additionals, form])

  function onSubmit(values: z.infer<typeof additionalGroupSchema>) {
    onSave({
      _id: category?._id,
      name: values.name,
      additionals: values.additionals.map(a => a.value),
      active: values.active,
      store: storeId,
      minQuantity: 0,
      maxQuantity: 1,
    })
    form.reset()
    onOpenChange(false)
  }

  const additionalOptions = additionals
    .filter(additional => additional._id)
    .map(additional => ({
      value: additional._id as string,
      label: additional.name
    }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar' : 'Criar'} Grupo de Adicionais</DialogTitle>
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
                      <Input placeholder="Nome do grupo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adicionais Disponíveis</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={additionalOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione os adicionais..."
                        emptyMessage="Nenhum adicional encontrado."
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
                        Este grupo de adicionais está disponível para seleção
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
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
                  {category ? 'Salvar' : 'Criar'} Grupo
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
