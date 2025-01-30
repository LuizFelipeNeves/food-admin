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
    id: 'customerName',
    header: 'Cliente',
    accessorFn: (row) => row.customer.name,
  },
  {
    id: 'customerPhone',
    header: 'Telefone',
    accessorFn: (row) => row.customer.phone,
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
    id: 'paymentStatus',
    header: 'Pagamento',
    accessorFn: (row) => row.payment.status,
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as Order['payment']['status']
      const statusMap = {
        pending: { label: 'Pendente', variant: 'warning' },
        approved: { label: 'Aprovado', variant: 'success' },
        rejected: { label: 'Rejeitado', variant: 'destructive' },
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
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('Ver pedido:', order.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
