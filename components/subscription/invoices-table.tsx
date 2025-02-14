import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, Download, CreditCard, AlertCircle, Search, Receipt } from 'lucide-react'
import { useState } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Invoice {
  id: string
  date: string
  dueDate: string
  plan: string
  amount: string
  paymentMethod: string
  status: 'paid' | 'overdue'
  downloadUrl: string
}

interface InvoicesTableProps {
  invoices: Invoice[]
  onPayInvoice: () => void
}

export function InvoicesTable({ invoices, onPayInvoice }: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredInvoices = invoices.filter(invoice => 
    invoice.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.amount.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF()
    
    // Add header
    doc.setFontSize(20)
    doc.text('Fatura', 105, 15, { align: 'center' })
    
    // Add invoice details
    doc.setFontSize(12)
    doc.text(`Data: ${invoice.date}`, 20, 30)
    doc.text(`Vencimento: ${invoice.dueDate}`, 20, 40)
    doc.text(`Plano: ${invoice.plan}`, 20, 50)
    doc.text(`Valor: ${invoice.amount}`, 20, 60)
    doc.text(`Forma de Pagamento: ${invoice.paymentMethod}`, 20, 70)
    doc.text(`Status: ${invoice.status === 'paid' ? 'Pago' : 'Em Atraso'}`, 20, 80)
    
    // Save PDF
    doc.save(`fatura-${invoice.date}.pdf`)
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Histórico de Faturas</CardTitle>
              <CardDescription>
                Visualize e baixe suas faturas anteriores
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar faturas..." 
              className="max-w-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                  <TableHead className="hidden sm:table-cell">Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden sm:table-cell">Forma de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice, index) => (
                  <TableRow key={index}>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className="hidden sm:table-cell">{invoice.dueDate}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{invoice.plan}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{invoice.amount}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{invoice.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.status === 'paid' ? (
                          <Badge variant="success" className="gap-1">
                            <Check className="h-3 w-3" />
                            Pago
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 cursor-pointer" onClick={onPayInvoice}>
                            <AlertCircle className="h-3 w-3" />
                            Em Atraso
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generatePDF(invoice)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Baixar Fatura</p>
                          </TooltipContent>
                        </Tooltip>

                        {invoice.status === 'overdue' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPayInvoice}>
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Pagar Fatura</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
