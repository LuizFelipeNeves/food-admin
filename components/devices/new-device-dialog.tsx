'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  isMain: z.boolean(),
})

interface NewDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: z.infer<typeof formSchema>) => void
  hasMainDevice: boolean
}

export function NewDeviceDialog({
  open,
  onOpenChange,
  onSave,
  hasMainDevice,
}: NewDeviceDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      isMain: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Dispositivo</DialogTitle>
          <DialogDescription>
            Adicione um novo dispositivo ao sistema
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Dispositivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Caixa Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isMain"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Dispositivo Principal</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {hasMainDevice
                        ? 'Já existe um dispositivo principal. Marcar este como principal irá remover o status do outro dispositivo.'
                        : 'Marque esta opção para definir este como o dispositivo principal'}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Dispositivo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
