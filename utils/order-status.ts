export function getStatusDescription(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'Pedido recebido',
    accepted: 'Pedido aceito',
    preparing: 'Pedido em preparo',
    ready: 'Pedido pronto',
    delivering: 'Pedido em entrega',
    delivered: 'Pedido finalizado',
    completed: 'Pedido concluído'
  }
  return statusMap[status] || 'Status atualizado'
}
