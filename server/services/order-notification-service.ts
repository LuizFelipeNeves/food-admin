
interface OrderNotificationMessage {
  message: string
}

export class OrderNotificationService {
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  private formatAddress(order: any): string {
    if (order.deliveryType === 'delivery' && order.address) {
      const { street, complement, neighborhood, city } = order.address
      let address = `${street}`
      if (complement) address += ` - ${complement}`
      address += `, ${neighborhood}, ${city}`
      return address
    }
    return ''
  }

  private formatItems(order: any): string {
    return order.items.map((item: any) => {
      let itemText = `➡ ⁠ ${item.quantity}x ${item.name} ⁠\n`
      
      if (item.additionals && item.additionals.length > 0) {
        item.additionals.forEach((additional: any) => {
          itemText += `      + ${additional.name}\n`
        })
      }
      
      return itemText
    }).join('')
  }

  private getPaymentMethodText(paymentMethod: string): string {
    const methods: { [key: string]: string } = {
      'card': '💳 Cartão (Débito/Crédito)',
      'pix': '📱 PIX',
      'cash': '💵 Dinheiro',
      'voucher': '🎫 Vale Refeição'
    }
    return methods[paymentMethod] || paymentMethod
  }

  private getDeliveryText(order: any): string {
    if (order.deliveryType === 'delivery') {
      const fee = order.deliveryFee || 0
      const feeText = fee > 0 ? ` (taxa de: ${this.formatCurrency(fee)})` : ''
      return `🛵 Delivery${feeText}\n🏠 ${this.formatAddress(order)}\n(Estimativa: entre 20~60 minutos)`
    } else {
      return '🏪 Retirada no local'
    }
  }

  createOrderMessage(order: any): OrderNotificationMessage {
    const items = this.formatItems(order)
    const paymentMethod = this.getPaymentMethodText(order.paymentMethod)
    const delivery = this.getDeliveryText(order)
    const total = this.formatCurrency(order.total)

    const message = `Pedido Criado
--------------
Pedido nº ${order._id?.toString().slice(-6) || 'N/A'}

Itens:
${items}
${paymentMethod}

${delivery}

Total: ${total}

Obrigado pela preferência, se precisar de algo é só chamar! 😉`

    return { message }
  }

  createStatusUpdateMessage(status: string): OrderNotificationMessage {
    const statusMessages: { [key: string]: string } = {
      'in_production': `Em Producao
----------

Agora vai! Seu pedido já está em produção 🥳`,
      'out_for_delivery': `----------

Tô chegando! Seu pedido já está na rota de entrega 🛵`,
      'completed': `----------

Seu pedido foi entregue! Esperamos que tenha gostado! 😊`,
      'cancelled': `----------

Pedido cancelado. Entre em contato conosco se tiver dúvidas.`
    }

    const message = statusMessages[status] || `Status atualizado: ${status}`
    
    return { message }
  }
}

export const orderNotificationService = new OrderNotificationService()