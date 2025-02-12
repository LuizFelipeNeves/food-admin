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
    title: 'Sistema de Assinaturas',
    description: 'Implementação do sistema de assinaturas com diferentes planos',
    status: 'done',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Integração com PIX',
    description: 'Adicionar suporte a pagamentos via PIX',
    status: 'progress',
    quarter: 'Q1',
    year: 2025,
    category: 'integration',
    priority: 'high',
  },
  {
    id: '3',
    title: 'App Mobile',
    description: 'Desenvolvimento do aplicativo mobile para iOS e Android',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'mobile',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'API de Pedidos',
    description: 'Substituir dados mockados por API real na tela de pedidos',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '5',
    title: 'API de Clientes',
    description: 'Integrar tela de clientes com API real',
    status: 'planned',
    quarter: 'Q1',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '6',
    title: 'Analytics em Tempo Real',
    description: 'Substituir dados aleatórios por métricas reais na tela de analytics',
    status: 'planned',
    quarter: 'Q2',
    year: 2025,
    category: 'analytics',
    priority: 'medium',
  },
  {
    id: '7',
    title: 'Integração com iFood',
    description: 'Sincronização automática com pedidos do iFood',
    status: 'planned',
    quarter: 'Q2',
    year: 2025,
    category: 'integration',
    priority: 'high',
  },
  {
    id: '8',
    title: 'Gestão de Estoque',
    description: 'Sistema avançado de controle de estoque',
    status: 'planned',
    quarter: 'Q2',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
  {
    id: '9',
    title: 'Sistema de Delivery',
    description: 'Gerenciamento de entregadores e rotas',
    status: 'planned',
    quarter: 'Q3',
    year: 2025,
    category: 'core',
    priority: 'medium',
  },
  {
    id: '10',
    title: 'Programa de Fidelidade',
    description: 'Sistema de pontos e recompensas',
    status: 'planned',
    quarter: 'Q3',
    year: 2025,
    category: 'marketing',
    priority: 'low',
  },
  {
    id: '11',
    title: 'Chat com Cliente',
    description: 'Chat em tempo real com clientes',
    status: 'planned',
    quarter: 'Q3',
    year: 2025,
    category: 'core',
    priority: 'low',
  },
  {
    id: '12',
    title: 'IA para Previsões',
    description: 'Previsão de demanda usando IA',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'analytics',
    priority: 'low',
  },
  {
    id: '13',
    title: 'Marketing Automation',
    description: 'Automação de campanhas de marketing',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'marketing',
    priority: 'medium',
  },
  {
    id: '14',
    title: 'Cardápio Digital',
    description: 'Cardápio digital interativo',
    status: 'planned',
    quarter: 'Q4',
    year: 2025,
    category: 'core',
    priority: 'high',
  },
]
