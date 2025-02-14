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
    const prioritys = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa'
    }

    const className = priority === 'high'
      ? 'bg-red-100 text-red-800 border-red-200'
      : priority === 'medium'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
      : 'bg-green-100 text-green-800 border-green-200'

    return (
      <Badge variant="outline" className={className}>
        {prioritys[priority as keyof typeof prioritys]}
      </Badge>
    )
  }

  const getCategoryBadge = (category: string) => {
    const categorys = {
      core: 'Core',
      integration: 'Integração',
      mobile: 'Mobile',
      analytics: 'Analytics',
      marketing: 'Marketing'
    }
    return (categorys[category as keyof typeof categorys] || 'Desconhecido')
  }

  const getQuarterBadge = (quarter: string) => {
    const quarters = {
      Q1: '1º Trimestre',
      Q2: '2º Trimestre',
      Q3: '3º Trimestre',
      Q4: '4º Trimestre'
    }
    return (quarters[quarter as keyof typeof quarters] || 'Desconhecido')
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
        <TableBody className="space-y-4">
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Badge variant="outline">{getCategoryBadge(item.category)}</Badge>
              </TableCell>
              <TableCell>{getPriorityBadge(item.priority)}</TableCell>
              <TableCell>{getQuarterBadge(item.quarter)} {item.year}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
