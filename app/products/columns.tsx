'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Product, ProductCategory, Additional, AdditionalGroup } from '@/data/products'
import { Button } from '@/components/ui/button'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { getImageUrl } from '@/lib/upload-service'

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

export function productColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<Product>[] {
  return [
    {
      accessorKey: 'image',
      header: 'Imagem',
      cell: ({ row }) => {
        const imagePath = row.getValue('image') as string;
        return row && imagePath ? (
          <Avatar>
            <AvatarImage src={getImageUrl(imagePath)} />
          </Avatar>
        ) : null;
      },
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
      cell: ({ row }) => {
        return row.getValue('name')
      },
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
        return (
          <div className="text-right">
            <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )
      },
    },
  ]
}

export function productCategoryColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<ProductCategory>[] {
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
      accessorKey: 'stock',
      header: 'Estoque',
      cell: ({ row }) => {
        const stock = parseInt(row.getValue('stock'))
        return stock || '-'
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
    header: "Ações",
    cell: ({ row }: { row: any }) => {
      return (
        <div className="text-right">
            <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
          </div>
      )
    },
  },
]
