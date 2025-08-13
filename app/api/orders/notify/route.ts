import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/server/services/order-service'

export async function POST(request: NextRequest) {
  try {
    // Verificar credencial de autorização
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, error: 'Token de autorização é obrigatório' },
        { status: 401 }
      )
    }

    // Verificar se o token está no formato correto (Bearer token)
    const [bearer, token] = authorization.split(' ')
    
    if (bearer !== 'Bearer' || !token) {
      return NextResponse.json(
        { success: false, error: 'Formato de token inválido. Use: Bearer <token>' },
        { status: 401 }
      )
    }

    // Verificar se o token está correto
    const validToken = process.env.NOTIFICATION_API_TOKEN
    
    if (!validToken) {
      console.error('NOTIFICATION_API_TOKEN não configurado no .env')
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor inválida' },
        { status: 500 }
      )
    }

    if (token !== validToken) {
      return NextResponse.json(
        { success: false, error: 'Token de autorização inválido' },
        { status: 401 }
      )
    }

    // Extrair dados do body
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }

    // Enviar notificação usando o OrderService
    const result = await orderService.sendOrderNotification(orderId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notificação enviada com sucesso',
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || result.message || 'Falha ao enviar notificação'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na rota de notificação:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Método GET para verificar se a rota está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'API de notificação de pedidos',
    usage: 'POST /api/orders/notify com { "orderId": "ID_DO_PEDIDO" }',
    auth: 'Requer header Authorization: Bearer <token>'
  })
}