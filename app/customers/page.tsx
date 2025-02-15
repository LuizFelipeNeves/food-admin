'use client';

import { Layout } from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMediaQuery } from '@/hooks/use-media-query';

const customers = [
  {
    _id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    totalOrders: 5,
    lastOrder: '2024-01-25',
  },
  {
    _id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 91234-5678',
    totalOrders: 3,
    lastOrder: '2024-01-28',
  },
  {
    _id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 99876-5432',
    totalOrders: 8,
    lastOrder: '2024-01-30',
  },
];

export default function CustomersPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus clientes e visualize seus pedidos
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar clientes..." className="pl-8" />
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    {!isMobile && <TableHead>Email</TableHead>}
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                    {!isMobile && <TableHead>Último Pedido</TableHead>}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{customer.name}</div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground truncate">
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {!isMobile && <TableCell>{customer.email}</TableCell>}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(`tel:${customer.phone}`)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div>{customer.totalOrders}</div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground">
                              {formatDate(customer.lastOrder)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Bloquear</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
