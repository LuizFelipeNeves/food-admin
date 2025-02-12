'use client'

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { RoadmapCard } from './roadmap-card'
import { RoadmapItem } from '../data'
import { Card } from '@/components/ui/card'
import { useEffect } from 'react'

const nodeTypes = {
  custom: RoadmapCard,
}

interface RoadmapFlowProps {
  items: RoadmapItem[]
}

function generateFlowData(data: RoadmapItem[]) {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Add quarter groups
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
  quarters.forEach((quarter, index) => {
    nodes.push({
      id: `${quarter}-2025`,
      type: 'group',
      position: { x: index * 450, y: 0 },
      style: {
        width: 400,
        height: 1000,
        backgroundColor: 'rgba(240, 240, 240, 0.1)',
        border: '1px dashed #ccc',
        borderRadius: '8px',
        padding: '16px',
      },
      data: { 
        label: `${quarter} 2025`,
      },
    })
  })

  // Group items by quarter
  const itemsByQuarter = quarters.reduce((acc, quarter) => {
    acc[quarter] = data.filter(item => item.quarter === quarter)
      .sort((a, b) => {
        // Sort by status first (done -> progress -> planned)
        const statusOrder = { done: 0, progress: 1, planned: 2 }
        const statusDiff = statusOrder[a.status] - statusOrder[b.status]
        if (statusDiff !== 0) return statusDiff
        
        // Then by priority (high -> medium -> low)
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    return acc
  }, {} as Record<string, RoadmapItem[]>)

  // Add items to their respective quarters with proper spacing
  quarters.forEach((quarter) => {
    const quarterItems = itemsByQuarter[quarter] || []
    quarterItems.forEach((item, index) => {
      nodes.push({
        id: item.id,
        type: 'custom',
        position: { x: 25, y: 80 + index * 220 },
        parentNode: `${quarter}-2025`,
        data: item,
        style: {
          width: 350,
        },
      })

      // Connect to the next item in the same quarter
      const nextItem = quarterItems[index + 1]
      if (nextItem) {
        edges.push({
          id: `e${item.id}-${nextItem.id}`,
          source: item.id,
          target: nextItem.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#999' },
        })
      }

      // Connect to the first item in the next quarter if this is a high priority item
      const nextQuarter = quarters[quarters.indexOf(quarter) + 1]
      if (nextQuarter && item.priority === 'high') {
        const nextQuarterItems = itemsByQuarter[nextQuarter]
        const nextHighPriority = nextQuarterItems?.find(i => i.priority === 'high')
        if (nextHighPriority) {
          edges.push({
            id: `e${item.id}-${nextHighPriority.id}`,
            source: item.id,
            target: nextHighPriority.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#999' },
          })
        }
      }
    })
  })

  return { nodes, edges }
}

export function RoadmapFlow({ items }: RoadmapFlowProps) {
  const { nodes: initialNodes, edges: initialEdges } = generateFlowData(items)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Atualiza o fluxo quando os itens mudarem (filtros)
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateFlowData(items)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [items, setNodes, setEdges])

  return (
    <div className="h-[800px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const data = node.data as RoadmapItem
            if (!data) return '#eee'
            return data.status === 'done' 
              ? '#22c55e' 
              : data.status === 'progress'
              ? '#3b82f6'
              : '#9ca3af'
          }}
          maskColor="rgba(240, 240, 240, 0.2)"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        
        <Panel position="top-center" className="bg-background/60 backdrop-blur-sm p-2 rounded-lg shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-sm">Planejado</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
