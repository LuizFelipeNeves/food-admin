'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { OrderFilters } from '@/components/orders/order-filters'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { OrderDetails } from '@/components/orders/order-details'
import { useMediaQuery } from '@/hooks/use-media-query'
import { trpc } from '@/app/_trpc/client'
import { type Order } from '@/types/order'
import { EditOrderModal } from '@/components/orders/edit-order-modal'
import useCurrentStore from '@/hooks/useCurrentStore'

type OrderStats = {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
}

type Filters = {
  customerName?: string
  date?: Date
  paymentStatus?: string
  paymentMethod?: string
  orderStatus?: string
}

interface OrdersResponse {
  data: Order[]
  pagination: {
    total: number
    page: number
    perPage: number
    pageCount: number
  }
}

const defaultStats: OrderStats = {
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalRevenue: 0
}

export default function AllOrdersPage() {
  const { storeId } = useCurrentStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [filters, setFilters] = useState<Filters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const handleEditOrder = (event: CustomEvent<Order>) => {
      setEditingOrder(event.detail)
    }

    window.addEventListener('edit-order', handleEditOrder as EventListener)
    return () => window.removeEventListener('edit-order', handleEditOrder as EventListener)
  }, [])
  
  const { data: ordersData, refetch, isLoading } = trpc.orders.getAll.useQuery({
    ...filters,
    page: currentPage,
    perPage: pageSize,
    storeId
  }, {
    enabled: !!storeId,
  }) as { data: OrdersResponse | undefined, refetch: () => void, isLoading: boolean }

  const { data: stats = defaultStats, isLoading: statsLoading } = trpc.orders.getStats.useQuery({
    storeId
  }, {
    enabled: !!storeId,
  })

  const visibleColumns = columns.filter(column => {
    if (!isMobile) return true
    return !column.enableHiding
  })

  // Reset para primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page)
    setPageSize(pageSize)
  }

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
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="animate-pulse h-8 w-16 bg-muted rounded" />
                  ) : (
                    stats.totalOrders
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="animate-pulse h-8 w-16 bg-muted rounded" />
                  ) : (
                    stats.pendingOrders
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="animate-pulse h-8 w-16 bg-muted rounded" />
                  ) : (
                    stats.completedOrders
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="animate-pulse h-8 w-24 bg-muted rounded" />
                  ) : (
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stats.totalRevenue)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <OrderFilters onFiltersChange={setFilters} />
        </div>

        <div className="flex-1 min-h-0 p-4 md:p-6">
          <div className="h-full overflow-auto rounded-md border">
            <DataTable<Order, { onRowClick: (row: { original: Order }) => void; selectedRow: Order | null }>
              columns={visibleColumns}
              data={ordersData?.data ?? []}
              meta={{
                onRowClick: (row: { original: Order }) => setSelectedOrder(row.original),
                selectedRow: selectedOrder,
              }}
              pageCount={ordersData?.pagination.pageCount ?? 1}
              onPaginationChange={handlePaginationChange}
              enablePagination
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <OrderDetails
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />

      <EditOrderModal
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
        onOrderUpdated={() => {
          refetch()
          setEditingOrder(null)
        }}
      />
    </Layout>
  )
}
