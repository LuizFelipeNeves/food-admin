export interface OrderItem {
  _id: string
  name: string
  quantity: number
  price: number
  notes?: string
  additionals: {
    _id: string
    name: string
    price: number
  }[]
}

export interface Address {
  street: string
  neighborhood: string
  city: string
  state: string
  cep: string
  complement?: string
}

export interface Customer {
  _id: string
  name: string
  phone: string
  email: string
  address: Address
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed'
export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'money'
export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export interface Payment {
  method: PaymentMethod
  status: PaymentStatus
  total: number
  change?: number
}

export interface OrderEvent {
  _id: string
  date: string
  status: OrderStatus
  description: string
}

export interface Order {
  _id: string
  user: {
    _id: string
    name: string
    phone: string
    email: string
  }
  deliveryType: string
  address?: Address
  paymentMethod: string
  paymentStatus: string
  change?: string
  observation?: string
  items: OrderItem[]
  store: string // MongoDB ObjectId as string
  deliveryFee: number
  subtotal: number
  total: number
  status: string
  createdAt: string
  updatedAt: string
  events: OrderEvent[]
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
}

export const COLUMNS = {
  pending: {
    id: 'pending',
    title: 'Novos',
    color: 'bg-gray-100 dark:bg-gray-500/20'
  },
  preparing: {
    id: 'preparing',
    title: 'Em Preparo',
    color: 'bg-yellow-100 dark:bg-yellow-500/20'
  },
  ready: {
    id: 'ready',
    title: 'Prontos',
    color: 'bg-green-100 dark:bg-green-500/20'
  },
  delivering: {
    id: 'delivering',
    title: 'Em Entrega',
    color: 'bg-purple-100 dark:bg-purple-500/20'
  },
  completed: {
    id: 'completed',
    title: 'Concluídos',
    color: 'bg-gray-100 dark:bg-gray-500/20'
  }
};

export const PAYMENT_METHODS = {
  credit: { label: 'Cartão de Crédito', icon: 'credit-card' },
  debit: { label: 'Cartão de Débito', icon: 'credit-card' },
  pix: { label: 'PIX', icon: 'qr-code' },
  money: { label: 'Dinheiro', icon: 'banknotes' }
}

export const PAYMENT_STATUS = {
  pending: { label: 'Pendente', color: 'yellow' },
  approved: { label: 'Aprovado', color: 'green' },
  rejected: { label: 'Rejeitado', color: 'red' }
}

export interface IOrder {
  paymentStatus: string;
  paymentMethod: string;
  observation: string;
  events: Array<{
      date: Date;
      description: string;
  }>;
}