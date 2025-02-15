'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Product, Category, Additional, AdditionalGroup } from '@/types'
import { Button } from '@/components/ui/button'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash } from 'lucide-react'

interface ActionCellProps<T> {
  row: any;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}

const ActionCell = <T,>({ row, onEdit, onDelete }: ActionCellProps<T>) => {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(row.original)}
            >
              <PencilIcon className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive"
              onClick={() => onDelete(row.original._id)}
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Excluir</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

interface ColumnsProps {
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const baseUrl = 'https://piratafood.vercel.app/'

export function productColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Product>[] {
  return [
    {
      accessorKey: 'image',
      header: 'Imagem',
      cell: ({ row }) => row ? <Avatar><AvatarImage src={baseUrl + row.getValue('image')} /></Avatar> : null,
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('price'))
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price)
        return formatted
      },
    },
    {
      accessorKey: 'discountPercentage',
      header: 'Desconto (%)',
      cell: ({ row }) => {
        const discount = parseFloat(row.getValue('discountPercentage'))
        return discount ? `${discount}%` : '-'
      },
    },
    {
      accessorKey: 'stock',
      header: 'Estoque',
      cell: ({ row }) => {
        const stock = parseFloat(row.getValue('stock'))
        return stock || '-'
      },
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      enableHiding: true,
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      enableHiding: true,
    },
    {
      accessorKey: 'active',
      header: 'Ativo',
      cell: ({ row }) => <Badge variant={row.getValue('active') ? 'success' : 'outline'}>{row.getValue('active') ? 'Sim' : 'Não'}</Badge>,
    },
    {
      accessorKey: '_id',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="text-right">
            <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )
      },
    },
  ]
}

export function productCategoryColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Category>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      enableHiding: true,
    },
    {
      accessorKey: 'active',
      header: 'Ativo',
      cell: ({ row }) => <Badge variant={row.getValue('active') ? 'success' : 'outline'}>{row.getValue('active') ? 'Sim' : 'Não'}</Badge>,
    },
    {
      accessorKey: '_id',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="text-right">
            <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )
      },
    },
  ]
}

export function additionalColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Additional>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('price'))
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price)
        return formatted
      },
    },
    {
      accessorKey: 'active',
      header: 'Ativo',
      cell: ({ row }) => <Badge variant={row.getValue('active') ? 'success' : 'outline'}>{row.getValue('active') ? 'Sim' : 'Não'}</Badge>,
    },
    {
      accessorKey: '_id',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="text-right">
            <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )
      },
    },
  ]
}

export function additionalCategoryColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<AdditionalGroup>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      enableHiding: true,
    },
    {
      accessorKey: 'active',
      header: 'Ativo',
      cell: ({ row }) => <Badge variant={row.getValue('active') ? 'success' : 'outline'}>{row.getValue('active') ? 'Sim' : 'Não'}</Badge>,
    },
    {
      accessorKey: '_id',
      header: 'Ações',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="text-right">
            <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )
      },
    },
  ]
}

export const additionalGroupColumns = ({ onEdit, onDelete }: ColumnsProps) => [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "minQuantity",
    header: "Min.",
  },
  {
    accessorKey: "maxQuantity",
    header: "Max.",
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(item._id)}>
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
