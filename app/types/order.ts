export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderTime: Date;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  waitTime: number;
}