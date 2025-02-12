'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Settings,
  FileText,
  BarChart3,
  Smartphone,
  CreditCard,
  Map,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export const sidebarLinks = [
  {
    title: 'Visão Geral',
    href: '/',
    icon: LayoutDashboard,
    color: 'text-sky-500',
  },
  {
    title: 'Pedidos',
    href: '/orders',
    icon: ShoppingCart,
    color: 'text-violet-500',
  },
  {
    title: 'Todos os Pedidos',
    href: '/all-orders',
    icon: Package,
    color: 'text-lime-500',
  },
  {
    title: 'Clientes',
    href: '/customers',
    icon: Users,
    color: 'text-pink-700',
  },
  {
    title: 'Dispositivos',
    href: '/devices',
    icon: Smartphone,
    color: 'text-blue-500',
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: FileText,
    color: 'text-emerald-500',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    color: 'text-orange-500',
  },
  {
    title: 'Assinatura',
    href: '/subscription',
    icon: CreditCard,
    color: 'text-yellow-500',
  },
  {
    title: 'Roadmap',
    href: '/roadmap',
    icon: Map,
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
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
          {sidebarLinks.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={pathname === route.href ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  collapsed ? 'px-2' : 'px-4'
                )}
              >
                <route.icon className={cn('h-4 w-4', route.color)} />
                {!collapsed && <span className="ml-2">{route.title}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}