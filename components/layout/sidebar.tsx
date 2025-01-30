'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  FileText,
  BarChart3,
  Smartphone,
  ListOrdered,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    color: 'text-sky-500',
  },
  {
    label: 'Pedidos',
    icon: ShoppingCart,
    href: '/all-orders',
    color: 'text-violet-500',
  },
  {
    label: 'Gestão de Pedidos (Kanban)',
    icon: ListOrdered,
    href: '/orders',
    color: 'text-lime-500',
  },
  {
    label: 'Produtos',
    icon: Package,
    href: '/products',
    color: 'text-pink-700',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-orange-500',
  },
  {
    label: 'Relatórios',
    icon: FileText,
    href: '/reports',
    color: 'text-emerald-500',
  },
  {
    label: 'Dispositivos',
    icon: Smartphone,
    href: '/devices',
    color: 'text-blue-500',
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/settings',
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'border-r bg-background h-screen relative transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <span className="text-xl font-bold">Burger Admin</span>}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-all', collapsed && 'rotate-180')} />
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="space-y-2 p-2">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={pathname === route.href ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  collapsed ? 'px-2' : 'px-4'
                )}
              >
                <route.icon className={cn('h-4 w-4', route.color)} />
                {!collapsed && <span className="ml-2">{route.label}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}