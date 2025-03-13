'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect, useState } from "react"
import { PAYMENT_METHOD_NAMES } from "@/constants/payments"
import { cn } from "@/lib/utils"

interface OrderFiltersProps {
  onFiltersChange: (filters: {
    customerName?: string;
    date?: Date;
    paymentStatus?: string;
    paymentMethod?: string;
    orderStatus?: string;
  }) => void;
}

export function OrderFilters({ onFiltersChange }: OrderFiltersProps) {
  const [customerName, setCustomerName] = useState('')
  const [date, setDate] = useState<Date>()
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [orderStatus, setOrderStatus] = useState('all')

  useEffect(() => {
    onFiltersChange({
      customerName: customerName || undefined,
      date,
      paymentStatus: paymentStatus === 'all' ? undefined : paymentStatus,
      paymentMethod: paymentMethod === 'all' ? undefined : paymentMethod,
      orderStatus: orderStatus === 'all' ? undefined : orderStatus,
    })
  }, [customerName, date, paymentStatus, paymentMethod, orderStatus, onFiltersChange])

  const clearFilters = () => {
    setCustomerName('')
    setDate(undefined)
    setPaymentStatus('all')
    setPaymentMethod('all')
    setOrderStatus('all')
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-2">
          <Label>Data do Pedido</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Status do Pedido</Label>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Novo</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="preparing">Preparando</SelectItem>
              <SelectItem value="ready">Pronto</SelectItem>
              <SelectItem value="delivering">Em Entrega</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Status do Pagamento</Label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Método de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(PAYMENT_METHOD_NAMES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="text-xs"
        >
          <X className="mr-2 h-3 w-3" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  )
}