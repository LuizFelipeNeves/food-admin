'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Phone } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Order, PAYMENT_STATUS } from '@/types/order'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PAYMENT_METHOD_NAMES } from '@/constants/payments'

interface TableMeta { 
  onRowClick: (row: { original: Order }) => void; selectedRow: Order | null
}
export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderId',
    header: 'Número',
    cell: ({ row }) => {
      const orderNumber = row.getValue('_id') as string
      
      return (
        <div className="space-y-1">
          <div className="font-medium">#{orderNumber.slice(-8).toUpperCase()}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'customer.name',
    header: 'Cliente',
    cell: ({ row }) => {
      const customer = row.original.user
      return (
        <div className="flex items-center gap-2">
          <span className="truncate">{customer.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden md:inline-flex"
            onClick={() => window.open(`tel:${customer.phone}`)}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableHiding: true,
  },
  {
    id: 'phone',
    accessorFn: row => row.user.phone,
    header: 'Telefone',
    cell: ({ row }) => {
      const phone = row.original.user.phone
      return (
        <div className="flex items-center gap-2">
          <span className="hidden md:inline">{phone}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => window.open(`tel:${phone}`)}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: 'Data',
    cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy HH:mm', {
        locale: ptBR,
      })
    },
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Order['status']
      const statusMap = {
        pending: { label: 'Novo', variant: 'default' },
        confirmed: { label: 'Confirmado', variant: 'secondary' },
        preparing: { label: 'Preparando', variant: 'warning' },
        ready: { label: 'Pronto', variant: 'success' },
        delivering: { label: 'Entregando', variant: 'secondary' },
        completed: { label: 'Concluído', variant: 'success' },
      } as const

      const { label, variant } = statusMap[status as keyof typeof statusMap] ?? {
        label: status,
        variant: 'default',
      }

      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Forma de Pagamento',
    cell: ({ row }) => {
      const paymentMethod = row.getValue('paymentMethod') as Order['paymentMethod']
      return PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Status Pagamento',
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as keyof typeof PAYMENT_STATUS
      return (
        <Badge
          variant={
            status === 'approved'
              ? 'success'
              : status === 'rejected'
              ? 'destructive'
              : 'warning'
          }
        >
          {PAYMENT_STATUS[status].label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const amount = row.getValue('total') as number

      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount)
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const order = row.original
      const meta = table.options.meta as TableMeta

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => meta.onRowClick({ original: order })}>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('edit-order', { detail: order }))}>
              Editar pedido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
