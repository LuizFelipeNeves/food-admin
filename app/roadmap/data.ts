export type RoadmapItem = {
  id: string
  title: string
  description: string
  status: 'done' | 'progress' | 'planned'
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number
  category: 'core' | 'integration' | 'mobile' | 'analytics' | 'marketing'
  priority: 'high' | 'medium' | 'low'
}

export const roadmapData: RoadmapItem[] = [
  {
    id: '1',
    title: 'Salvar Preço',
    description: 'Salvar price nos itens na criação do pedido',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Gestão de Produtos',
    description: 'Imagens, estoque, revalidação e campos adicionais',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Carrinho atualizado',
    description: 'Carrinho atualizado quando carregar a tela de produtos',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '4',
    title: 'Taxa de Entrega, Subtotal',
    description: 'Implementar cálculo de taxa de entrega e subtotal do pedido no cardápio digital',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '5',
    title: 'Notificações Pusher',	
    description: 'Implementar notificações em tempo real com Pusher',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'integration',
    priority: 'medium'
  },
  {
    id: '7',
    title: 'Autenticação',
    description: 'Sistema de cadastro, login, recuperação de senha e emails',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '8',
    title: 'Gestão de Dispositivos',
    description: 'APIs para criar dispositivo, gerenciar QR Code e histórico',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '10',
    title: 'Sistema de Assinaturas',
    description: 'Integração com gateway de pagamento, upgrade/downgrade de plano',
    status: 'planned',
    quarter: 'Q2',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '11',
    title: 'Analytics e Métricas',
    description: 'APIs de analytics, métricas mensais e relatórios',
    status: 'planned',
    quarter: 'Q3',
    year: 2025,
    category: 'analytics',
    priority: 'medium',
  },
  {
    id: '13',
    title: 'Gestão de Clientes',
    description: 'APIs para listagem, exclusão e bloqueio de clientes',
    status: 'planned',
    quarter: 'Q3',
    year: 2025,
    category: 'core',
    priority: 'low',
  },
  {
    id: '14',
    title: 'Sistema de Promoções',
    description: 'Implementação do sistema de promoções',
    status: 'planned',
    quarter: 'Q3',
    year: 2025,
    category: 'core',
    priority: 'low',
  },
  {
    id: '15',
    title: 'Integrações',
    description: 'Integração com iFood e 99Food',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'integration',
    priority: 'medium',
  },
  {
    id: '16',
    title: 'Marketing',
    description: 'Sistema de divulgação e automação de marketing',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'marketing',
    priority: 'low',
  },
  {
    id: '17',
    title: 'Programa de Fidelidade',
    description: 'Sistema de pontos e recompensas para clientes',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'core',
    priority: 'low',
  },
  {
    id: '18',
    title: 'Gestão de Pedidos',
    description: 'APIs para cancelamento, edição',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'core',
    priority: 'low',
  },
  {
    id: '20',
    title: 'Gestão de Estabelecimentos',
    description: 'APIs para listagem, exclusão e bloqueio de estabelecimentos',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'core',
    priority: 'low',
  }
]
