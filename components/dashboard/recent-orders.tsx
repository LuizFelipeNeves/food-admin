'use client';

import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const recentOrders = [
  {
    _id: '1',
    customer: 'John Doe',
    order: '#12345',
    total: '$32.50',
    status: 'preparing',
  },
  {
    _id: '2',
    customer: 'Jane Smith',
    order: '#12346',
    total: '$28.00',
    status: 'pending',
  },
  {
    _id: '3',
    customer: 'Bob Johnson',
    order: '#12347',
    total: '$45.75',
    status: 'ready',
  },
];

export function RecentOrders() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {recentOrders.map((order) => (
          <div
            key={order._id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <div className="w-full h-full flex items-center justify-center bg-primary">
                  {order.customer[0]}
                </div>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{order.customer}</p>
                <p className="text-sm text-muted-foreground">{order.order}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm font-medium">{order.total}</p>
              <span
                className={`px-2 py-1 rounded-full text-xs capitalize ${
                  order.status === 'preparing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.status === 'ready'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}