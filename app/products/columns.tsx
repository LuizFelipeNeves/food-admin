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

const ActionCell = ({ 
  row, 
  onEdit, 
  onDelete 
}: { 
  row: any, 
  onEdit: (item: any) => void, 
  onDelete: (id: string) => void 
}) => {
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
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}

export const productColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Product>[] => [
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
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
]

export const productCategoryColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Category>[] => [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
]

export const additionalColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Additional>[] => [
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
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
]

export const additionalCategoryColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<AdditionalGroup>[] => [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
]
