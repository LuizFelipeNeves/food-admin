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
import { useSession } from 'next-auth/react';

// Links baseados em permissões
const adminLinks = [
  {
    title: 'Usuários',
    href: '/settings/users',
    icon: Users,
    color: 'text-pink-700',
    roles: ['admin'],
  },
  {
    title: 'Roadmap',
    href: '/roadmap',
    icon: Map,
    roles: ['admin'],
  },
];

const employeeLinks = [
  {
    title: 'PDV',
    href: '/pos',
    icon: CreditCard,
    color: 'text-green-500',
    roles: ['admin', 'employee', 'user'],
  },
  {
    title: 'Pedidos',
    href: '/orders',
    icon: ShoppingCart,
    color: 'text-violet-500',
    roles: ['admin', 'employee', 'user'],
  },
  {
    title: 'Todos os Pedidos',
    href: '/all-orders',
    icon: Package,
    color: 'text-lime-500',
    roles: ['admin', 'employee', 'user'],
  },
  {
    title: 'Clientes',
    href: '/customers',
    icon: Users,
    color: 'text-pink-700',
    roles: ['admin', 'employee', 'user'],
  },
  {
    title: 'Produtos',
    href: '/products',
    icon: Package,
    color: 'text-violet-500',
    roles: ['admin', 'employee', 'user'],
  },
];

const generalLinks = [
  {
    title: 'Visão Geral',
    href: '/',
    icon: LayoutDashboard,
    color: 'text-sky-500',
    roles: ['admin', 'employee', 'user'],
  },
  {
    title: 'Dispositivos',
    href: '/devices',
    icon: Smartphone,
    color: 'text-blue-500',
    roles: ['admin', 'user'],
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: FileText,
    color: 'text-emerald-500',
    roles: ['admin', 'user'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    color: 'text-orange-500',
    roles: ['admin', 'user'],
  },
  {
    title: 'Assinatura',
    href: '/subscription',
    icon: CreditCard,
    color: 'text-yellow-500',
    roles: ['admin', 'user'],
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'user'],
  },
];

export const sidebarLinks = [...generalLinks, ...employeeLinks, ...adminLinks];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'user';

  // Função para verificar se o usuário tem acesso ao link
  const hasAccess = (roles: string[]) => {
    return roles.includes(userRole);
  };

  // Combinar todos os links e filtrar baseado na role do usuário
  const allLinks = [...generalLinks, ...employeeLinks, ...adminLinks]
    .filter(link => hasAccess(link.roles));

  return (
    <div
      className={cn(
        'border-r bg-card/90 h-screen relative transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
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
          {allLinks.map((route) => (
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