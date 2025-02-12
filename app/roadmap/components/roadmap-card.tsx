import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoadmapItem } from '../data'
import { Calendar, CheckCircle2, CircleDashed, Clock } from 'lucide-react'

type StatusInfo = {
  color: string
  textColor: string
  bgColor: string
  icon: React.ElementType
  label: string
}

type StyleInfo = {
  bg: string
  text: string
  border: string
  label: string
}

export function RoadmapCard({ data }: { data: RoadmapItem }) {
  const getStatusInfo = (status: string): StatusInfo => {
    switch (status) {
      case 'done':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          icon: CheckCircle2,
          label: 'Concluído'
        }
      case 'progress':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          icon: Clock,
          label: 'Em Progresso'
        }
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: CircleDashed,
          label: 'Planejado'
        }
    }
  }

  const getPriorityInfo = (priority: string): StyleInfo => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          label: 'Alta'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          label: 'Média'
        }
      default:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          label: 'Baixa'
        }
    }
  }

  const getCategoryInfo = (category: string): StyleInfo => {
    switch (category) {
      case 'core':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-purple-200',
          label: 'Core'
        }
      case 'integration':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-800',
          border: 'border-indigo-200',
          label: 'Integração'
        }
      case 'mobile':
        return {
          bg: 'bg-cyan-100',
          text: 'text-cyan-800',
          border: 'border-cyan-200',
          label: 'Mobile'
        }
      case 'analytics':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          label: 'Analytics'
        }
      default:
        return {
          bg: 'bg-pink-100',
          text: 'text-pink-800',
          border: 'border-pink-200',
          label: 'Marketing'
        }
    }
  }

  const statusInfo = getStatusInfo(data.status)
  const priorityInfo = getPriorityInfo(data.priority)
  const categoryInfo = getCategoryInfo(data.category)
  const StatusIcon = statusInfo.icon

  return (
    <Card className={`p-4 min-w-[300px] border-l-4 ${
      data.status === 'done' 
        ? 'border-l-green-500' 
        : data.status === 'progress'
        ? 'border-l-blue-500'
        : 'border-l-gray-500'
    } hover:shadow-md transition-shadow`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0 gap-1`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
          <Badge 
            variant="outline" 
            className={`${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
          >
            {priorityInfo.label}
          </Badge>
        </div>

        <div>
          <h3 className="font-semibold text-lg leading-tight mb-1">{data.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{data.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge 
            variant="outline" 
            className={`${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}`}
          >
            {categoryInfo.label}
          </Badge>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            {data.quarter} {data.year}
          </div>
        </div>
      </div>
    </Card>
  )
}
