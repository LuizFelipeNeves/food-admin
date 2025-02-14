export interface OrderItem {
  _id: string
  name: string
  quantity: number
  price: number
  additionals: {
    name: string
    price: number
  }[]
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface Customer {
  _id: string
  name: string
  phone: string
  email: string
  address: Address
}

export interface Payment {
  method: 'credit' | 'debit' | 'pix' | 'money'
  status: 'pending' | 'approved' | 'rejected'
  total: number
  change?: number // Troco para pagamento em dinheiro
}

export interface OrderEvent {
  _id: string
  date: string
  status: Order['status']
  description: string
}

export interface Order {
  _id: string
  orderNumber: string
  customer: Customer
  orderDate: string
  status: 'new' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed'
  subtotal: number
  deliveryFee: number
  total: number
  items: OrderItem[]
  payment: Payment
  waitTime?: number
  events: OrderEvent[]
}

export const mockOrders: Order[] = [
  {
    _id: '1',
    orderNumber: '#12345',
    customer: {
      _id: '1',
      name: 'Maria Santos',
      phone: '(11) 98765-4321',
      email: 'maria@email.com',
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Jardim Europa',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      }
    },
    orderDate: '2025-02-14T06:20:00-03:00',
    status: 'new',
    subtotal: 79.90,
    deliveryFee: 10.00,
    total: 89.90,
    waitTime: 15,
    payment: {
      method: 'credit',
      status: 'approved',
      total: 89.90
    },
    items: [
      { 
        _id: '1', 
        name: 'X-Burger', 
        quantity: 2, 
        price: 18.90,
        additionals: []
      },
      { 
        _id: '2', 
        name: 'Batata Frita', 
        quantity: 1, 
        price: 12.90,
        additionals: []
      }
    ],
    events: [
      {
        _id: '1',
        date: '2025-02-14T06:20:00-03:00',
        status: 'new',
        description: 'Pedido recebido'
      }
    ]
  },
  {
    _id: '2',
    orderNumber: '#12346',
    customer: {
      _id: '2',
      name: 'João Silva',
      phone: '(11) 91234-5678',
      email: 'joao@email.com',
      address: {
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      }
    },
    orderDate: '2025-02-14T06:15:00-03:00',
    status: 'preparing',
    subtotal: 35.80,
    deliveryFee: 10.00,
    total: 45.80,
    waitTime: 20,
    payment: {
      method: 'pix',
      status: 'approved',
      total: 45.80
    },
    items: [
      { 
        _id: '3', 
        name: 'X-Salada', 
        quantity: 1, 
        price: 16.90,
        additionals: []
      },
      { 
        _id: '4', 
        name: 'Coca-Cola', 
        quantity: 2, 
        price: 7.90,
        additionals: []
      }
    ],
    events: [
      {
        _id: '1',
        date: '2025-02-14T06:15:00-03:00',
        status: 'new',
        description: 'Pedido recebido'
      },
      {
        _id: '2',
        date: '2025-02-14T06:17:00-03:00',
        status: 'preparing',
        description: 'Pedido em preparo'
      }
    ]
  },
  {
    _id: '3',
    orderNumber: '#12347',
    customer: {
      _id: '3',
      name: 'Ana Oliveira',
      phone: '(11) 97777-6666',
      email: 'ana@email.com',
      address: {
        street: 'Rua dos Pinheiros',
        number: '456',
        neighborhood: 'Pinheiros',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05422-001'
      }
    },
    orderDate: '2025-02-14T06:10:00-03:00',
    status: 'preparing',
    subtotal: 146.70,
    deliveryFee: 10.00,
    total: 156.70,
    waitTime: 25,
    payment: {
      method: 'debit',
      status: 'approved',
      total: 156.70
    },
    items: [
      { 
        _id: '5', 
        name: 'Pizza Grande', 
        quantity: 1, 
        price: 89.90,
        additionals: []
      },
      { 
        _id: '6', 
        name: 'Refrigerante 2L', 
        quantity: 2, 
        price: 12.90,
        additionals: []
      }
    ],
    events: [
      {
        _id: '1',
        date: '2025-02-14T06:10:00-03:00',
        status: 'new',
        description: 'Pedido recebido'
      },
      {
        _id: '2',
        date: '2025-02-14T06:12:00-03:00',
        status: 'preparing',
        description: 'Pedido em preparo'
      }
    ]
  },
  {
    _id: '4',
    orderNumber: '#12348',
    customer: {
      _id: '4',
      name: 'Pedro Costa',
      phone: '(11) 96666-3333',
      email: 'pedro@email.com',
      address: {
        street: 'Av. Brigadeiro Faria Lima',
        number: '2000',
        neighborhood: 'Itaim Bibi',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01451-000'
      }
    },
    orderDate: '2025-02-14T06:05:00-03:00',
    status: 'ready',
    subtotal: 57.80,
    deliveryFee: 10.00,
    total: 67.80,
    waitTime: 0,
    payment: {
      method: 'money',
      status: 'pending',
      total: 67.80
    },
    items: [
      { 
        _id: '7', 
        name: 'X-Tudo', 
        quantity: 2, 
        price: 25.90,
        additionals: []
      },
      { 
        _id: '8', 
        name: 'Milk Shake', 
        quantity: 1, 
        price: 16.00,
        additionals: []
      }
    ],
    events: [
      {
        _id: '1',
        date: '2025-02-14T06:05:00-03:00',
        status: 'new',
        description: 'Pedido recebido'
      },
      {
        _id: '2',
        date: '2025-02-14T06:07:00-03:00',
        status: 'preparing',
        description: 'Pedido em preparo'
      },
      {
        _id: '3',
        date: '2025-02-14T06:09:00-03:00',
        status: 'ready',
        description: 'Pedido pronto'
      }
    ]
  },
  {
    _id: '5',
    orderNumber: '#12349',
    customer: {
      _id: '5',
      name: 'Mariana Lima',
      phone: '(11) 95555-2222',
      email: 'mariana@email.com',
      address: {
        street: 'Rua dos Bandeirantes',
        number: '789',
        neighborhood: 'Vila Olímpia',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04578-000'
      }
    },
    orderDate: '2025-02-14T06:00:00-03:00',
    status: 'delivering',
    subtotal: 88.70,
    deliveryFee: 10.00,
    total: 98.70,
    waitTime: 15,
    payment: {
      method: 'credit',
      status: 'approved',
      total: 98.70
    },
    items: [
      { 
        _id: '9', 
        name: 'Combo Família', 
        quantity: 1, 
        price: 89.90,
        additionals: []
      },
      { 
        _id: '10', 
        name: 'Sobremesa', 
        quantity: 1, 
        price: 8.80,
        additionals: []
      }
    ],
    events: [
      {
        _id: '1',
        date: '2025-02-14T06:00:00-03:00',
        status: 'new',
        description: 'Pedido recebido'
      },
      {
        _id: '2',
        date: '2025-02-14T06:02:00-03:00',
        status: 'preparing',
        description: 'Pedido em preparo'
      },
      {
        _id: '3',
        date: '2025-02-14T06:04:00-03:00',
        status: 'ready',
        description: 'Pedido pronto'
      },
      {
        _id: '4',
        date: '2025-02-14T06:06:00-03:00',
        status: 'delivering',
        description: 'Pedido em entrega'
      }
    ]
  },
  {
    _id: '6',
    orderNumber: '#12350',
    customer: {
      _id: '6',
      name: 'Carlos Souza',
      phone: '(11) 94444-1111',
      email: 'carlos@email.com',
      address: {
        street: 'Av. São Gabriel',
        number: '1234',
        neighborhood: 'Chácara Santo Antônio',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04716-000'
      }
    },
    orderDate: '2025-02-14T05:55:00-03:00',
    status: 'completed',
    subtotal: 35.90,
    deliveryFee: 10.00,
    total: 45.90,
    waitTime: 0,
    payment: {
      method: 'debit',
      status: 'approved',
      total: 45.90
    },
    items: [
      { 
        _id: '11', 
        name: 'X-Bacon', 
        quantity: 1, 
        price: 22.90,
        additionals: []
      },
      { 
        _id: '12', 
        name: 'Refrigerante', 
        quantity: 2, 
        price: 11.50,
        additionals: []
      }
    ],
    events: [
      {
        _id: '1',
        date: '2025-02-14T05:55:00-03:00',
        status: 'new',
        description: 'Pedido recebido'
      },
      {
        _id: '2',
        date: '2025-02-14T05:57:00-03:00',
        status: 'preparing',
        description: 'Pedido em preparo'
      },
      {
        _id: '3',
        date: '2025-02-14T05:59:00-03:00',
        status: 'ready',
        description: 'Pedido pronto'
      },
      {
        _id: '4',
        date: '2025-02-14T06:01:00-03:00',
        status: 'delivering',
        description: 'Pedido em entrega'
      },
      {
        _id: '5',
        date: '2025-02-14T06:03:00-03:00',
        status: 'completed',
        description: 'Pedido entregue'
      }
    ]
  }
]

export const COLUMNS = {
  new: {
    id: 'new',
    title: 'Novos',
    color: 'bg-gray-100 dark:bg-gray-500/20'
  },
  confirmed: {
    id: 'confirmed',
    title: 'Confirmados',
    color: 'bg-blue-100 dark:bg-blue-500/20'
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
