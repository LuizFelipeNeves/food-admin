'use client'

import { Layout } from '@/components/layout/layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { roadmapData } from './data'
import { useState } from 'react'
import { RoadmapFilters } from './components/roadmap-filters'
import { RoadmapList } from './components/roadmap-list'
import { RoadmapFlow } from './components/roadmap-flow'

export default function RoadmapPage() {
  const [filter, setFilter] = useState<{
    status?: string
    category?: string
    priority?: string
  }>({
    status: 'all',
    category: 'all',
    priority: 'all'
  })

  const filteredData = roadmapData.filter(item => {
    if (filter.status !== 'all' && item.status !== filter.status) return false
    if (filter.category !== 'all' && item.category !== filter.category) return false
    if (filter.priority !== 'all' && item.priority !== filter.priority) return false
    return true
  })

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Roadmap</h2>
          <RoadmapFilters 
            filters={filter} 
            onFilterChange={(key, value) => setFilter(f => ({ ...f, [key]: value }))} 
          />
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="flow">Fluxo</TabsTrigger>
          </TabsList>

          <TabsContent value="flow">
            <RoadmapFlow items={filteredData} />
          </TabsContent>

          <TabsContent value="list">
            <RoadmapList items={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
