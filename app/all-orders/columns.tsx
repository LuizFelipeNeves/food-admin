'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Phone } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Order, PAYMENT_STATUS } from '@/data/orders'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Número',
    cell: ({ row }) => {
      const orderNumber = row.getValue('orderNumber') as string
      const customer = row.original.customer
      
      return (
        <div className="space-y-1">
          <div className="font-medium">{orderNumber}</div>
          <div className="text-sm text-muted-foreground hidden md:block">
            {customer.name}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'customer.name',
    header: 'Cliente',
    cell: ({ row }) => {
      const customer = row.original.customer
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
    accessorFn: row => row.customer.phone,
    header: 'Telefone',
    cell: ({ row }) => {
      const phone = row.original.customer.phone
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
    accessorKey: 'orderDate',
    header: 'Data',
    cell: ({ row }) => {
      return format(new Date(row.getValue('orderDate')), 'dd/MM/yyyy HH:mm', {
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
        new: { label: 'Novo', variant: 'default' },
        confirmed: { label: 'Confirmado', variant: 'secondary' },
        preparing: { label: 'Preparando', variant: 'warning' },
        ready: { label: 'Pronto', variant: 'success' },
        delivering: { label: 'Entregando', variant: 'secondary' },
        completed: { label: 'Concluído', variant: 'success' },
      } as const

      const { label, variant } = statusMap[status] ?? {
        label: status,
        variant: 'default',
      }

      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: 'payment',
    header: 'Pagamento',
    cell: ({ row }) => {
      const payment = row.getValue('payment') as Order['payment']
      const status = payment.status

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
    accessorKey: '_id',
    header: '',
    cell: ({ row, table }) => {
      const order = row.original
      const meta = table.options.meta as { openOrderDetails: (order: Order) => void }

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
            <DropdownMenuItem onClick={() => meta?.openOrderDetails(order)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
