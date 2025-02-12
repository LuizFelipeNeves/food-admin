'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Order } from '@/data/orders'

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Número',
  },
  {
    accessorKey: 'customerName',
    header: 'Cliente',
  },
  {
    accessorKey: 'customerPhone',
    header: 'Telefone',
  },
  {
    accessorKey: 'orderDate',
    header: 'Data',
    cell: ({ row }) => {
      return new Date(row.getValue('orderDate')).toLocaleDateString('pt-BR')
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Order['status']
      const statusMap = {
        new: { label: 'Novo', variant: 'default' },
        confirmed: { label: 'Confirmado', variant: 'secondary' },
        preparing: { label: 'Preparando', variant: 'warning' },
        ready: { label: 'Pronto', variant: 'success' },
        delivering: { label: 'Entregando', variant: 'purple' },
        completed: { label: 'Concluído', variant: 'green' },
      }

      const { label, variant } = statusMap[status]
      return (
        <Badge variant={variant as any} className="capitalize">
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Status do Pagamento',
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus')
      return (
        <Badge variant={status === 'paid' ? 'success' : 'destructive'}>
          {status === 'paid' ? 'Pago' : 'Pendente'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total'))
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount)
    },
  },
  {
    accessorKey: '_id',
    header: 'Ações',
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('Ver pedido:', order._id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
