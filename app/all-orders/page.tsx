'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { OrderFilters } from '@/components/orders/order-filters'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { mockOrders } from '@/data/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function AllOrdersPage() {
  const totalOrders = mockOrders.length
  const pendingOrders = mockOrders.filter(order => order.status === 'new').length
  const completedOrders = mockOrders.filter(order => order.status === 'completed').length
  const totalRevenue = mockOrders.reduce((acc, order) => acc + order.total, 0)

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-none space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie todos os pedidos em um só lugar
              </p>
            </div>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>

          <OrderFilters />
        </div>

        <div className="flex-1 overflow-auto border rounded-lg bg-card mx-4 md:mx-6">
          <DataTable
            columns={columns}
            data={mockOrders}
          />
        </div>
      </div>
    </Layout>
  )
}
