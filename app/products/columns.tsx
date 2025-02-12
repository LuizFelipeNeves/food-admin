'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Product, Category, Additional, AdditionalGroup } from '@/types'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage } from '@/components/ui/avatar'

interface ActionCellProps {
  row: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

function ActionCell({ row, onEdit, onDelete }: ActionCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(row.original._id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      cell: ({ row }) => row ? <Avatar><AvatarImage src={row.getValue('image')} /></Avatar> : null
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
      accessorKey: 'category',
      header: 'Categoria',
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
    },
    {
      accessorKey: 'stock',
      header: 'Estoque',
    },
    {
      accessorKey: 'active',
      header: 'Ativo',
      cell: ({ row }) => <Badge variant={row.getValue('active') ? 'success' : 'outline'}>{row.getValue('active') ? 'Sim' : 'Não'}</Badge>,
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
