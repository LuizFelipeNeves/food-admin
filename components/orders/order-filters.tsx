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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

export function OrderFilters() {
  const [date, setDate] = useState<Date>()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-2">
        <Label>Cliente</Label>
        <Input
          type="search"
          placeholder="Buscar por nome..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Data do Pedido</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
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
        <Label>Status do Pagamento</Label>
        <Select defaultValue="all">
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
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="credit">Cartão de Crédito</SelectItem>
            <SelectItem value="debit">Cartão de Débito</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="money">Dinheiro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}