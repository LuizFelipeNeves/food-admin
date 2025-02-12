import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { RoadmapItem } from '../data'

interface RoadmapListProps {
  items: RoadmapItem[]
}

export function RoadmapList({ items }: RoadmapListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge variant="success">Concluído</Badge>
      case 'progress':
        return <Badge variant="default">Em Progresso</Badge>
      default:
        return <Badge variant="secondary">Planejado</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    const className = priority === 'high'
      ? 'bg-red-100 text-red-800 border-red-200'
      : priority === 'medium'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
      : 'bg-green-100 text-green-800 border-green-200'

    return (
      <Badge variant="outline" className={className}>
        {priority}
      </Badge>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Trimestre</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.category}</Badge>
              </TableCell>
              <TableCell>{getPriorityBadge(item.priority)}</TableCell>
              <TableCell>{item.quarter} {item.year}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
