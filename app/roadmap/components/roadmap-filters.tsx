import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Filters = {
  status?: string
  category?: string
  priority?: string
}

interface RoadmapFiltersProps {
  filters: Filters
  onFilterChange: (key: keyof Filters, value: string) => void
}

export function RoadmapFilters({ filters, onFilterChange }: RoadmapFiltersProps) {
  return (
    <div className="flex gap-2">
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => onFilterChange('status', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="done">Concluído</SelectItem>
          <SelectItem value="progress">Em Progresso</SelectItem>
          <SelectItem value="planned">Planejado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category || 'all'}
        onValueChange={(value) => onFilterChange('category', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Categorias</SelectItem>
          <SelectItem value="core">Core</SelectItem>
          <SelectItem value="integration">Integração</SelectItem>
          <SelectItem value="mobile">Mobile</SelectItem>
          <SelectItem value="analytics">Analytics</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || 'all'}
        onValueChange={(value) => onFilterChange('priority', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Prioridades</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Média</SelectItem>
          <SelectItem value="low">Baixa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
