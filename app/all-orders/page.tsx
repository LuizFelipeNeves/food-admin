'use client'

import { SetStateAction, useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { OrderFilters } from '@/components/orders/order-filters'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { mockOrders, type Order } from '@/data/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { OrderDetails } from '@/components/orders/order-details'
import { useMediaQuery } from '@/hooks/use-media-query'

export default function AllOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const totalOrders = mockOrders.length
  const pendingOrders = mockOrders.filter(order => order.payment.status === 'pending').length
  const completedOrders = mockOrders.filter(order => order.status === 'completed').length
  const totalRevenue = mockOrders.reduce((acc, order) => {
    if (order.payment.status === 'approved') {
      return acc + order.total
    }
    return acc
  }, 0)

  const visibleColumns = columns.filter(column => {
    if (!isMobile) return true
    return !column.enableHiding
  })

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-none space-y-4 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie todos os pedidos em um só lugar
              </p>
            </div>

            <Button className="w-full sm:w-auto whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
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

        <div className="flex-1 min-h-0 p-4 md:p-6">
          <div className="h-full overflow-auto rounded-md border">
            <DataTable
              columns={visibleColumns}
              data={mockOrders}
              meta={{
                onRowClick: (row: { original: SetStateAction<Order | null> }) => setSelectedOrder(row.original),
                selectedRow: selectedOrder,
              }}
            />
          </div>
        </div>
      </div>

      <OrderDetails
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </Layout>
  )
}
