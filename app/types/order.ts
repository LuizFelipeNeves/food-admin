export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  orderTime: Date;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  waitTime: number;
}