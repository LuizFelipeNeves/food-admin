import { User } from '@/models';
import { PaymentMethod } from '@/constants/payments';

const mockUsers = [
  {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 91234-5678',
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 99876-5432',
  },
  {
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 97654-3210',
  },
  {
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    phone: '(11) 96543-2109',
  }
];

let cachedUsers: any[] | null = null;

async function getOrCreateUsers() {
  if (cachedUsers) return cachedUsers;

  const users = await Promise.all(
    mockUsers.map(async (mockUser) => {
      // Procura usuário existente ou cria um novo
      let user = await User.findOne({ email: mockUser.email });
      if (!user) {
        user = await User.create(mockUser);
      }
      return user;
    })
  );

  cachedUsers = users;
  return users;
}

export function generateRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateRandomPrice(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

export function generateRandomQuantity(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomDeliveryTime(minMinutes = 20, maxMinutes = 60): number {
  return Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
}

export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function generateRandomOrder(
  store: string,
  products: any[],
  categories: any[],
  date: Date = new Date()
) {
  const users = await getOrCreateUsers();
  const user = pickRandom(users);

  const itemsCount = generateRandomQuantity(1, 5);
  const items = Array.from({ length: itemsCount }, () => {
    const product = pickRandom(products);
    const quantity = generateRandomQuantity(1, 3);
    return {
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      quantity,
      notes: '',
      additionals: []
    };
  });

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = generateRandomPrice(5, 15);
  const total = subtotal + deliveryFee;
  const paymentMethods: PaymentMethod[] = ['credit', 'debit', 'pix', 'money', 'vrRefeicao'];
  const status = 'completed';
  const deliveryTime = generateRandomDeliveryTime(20, 60);

  return {
    user: user._id,
    store,
    items,
    deliveryType: 'delivery',
    paymentMethod: pickRandom(paymentMethods),
    paymentStatus: 'approved',
    deliveryFee,
    subtotal,
    total,
    status,
    deliveryTime,
    createdAt: date,
    events: [
      {
        date: date,
        status,
        description: 'Pedido entregue com sucesso'
      }
    ]
  };
}

export async function generateOrdersForTimeRange(
  storeId: string,
  items: any[],
  categories: any[],
  startDate: Date,
  endDate: Date,
  minOrdersPerHour: number,
  maxOrdersPerHour: number
): Promise<any[]> {
  const orders = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Para cada hora do dia
    for (let hour = 0; hour < 24; hour++) {
      currentDate.setHours(hour);
      
      // Gerar um número aleatório de pedidos para esta hora
      const numOrders = Math.floor(Math.random() * (maxOrdersPerHour - minOrdersPerHour + 1)) + minOrdersPerHour;
      
      // Gerar os pedidos para esta hora
      for (let i = 0; i < numOrders; i++) {
        const order = await generateRandomOrder(storeId, items, categories, new Date(currentDate));
        orders.push(order);
      }
    }
    
    // Avançar para o próximo dia
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }

  return orders;
} 