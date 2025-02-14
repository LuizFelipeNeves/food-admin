import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard } from 'lucide-react'

interface AddCardModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (cardData: {
    number: string
    expiry: string
    cvv: string
    name: string
  }) => void
}

export function AddCardModal({
  isOpen,
  onOpenChange,
  onSubmit
}: AddCardModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit({
      number: formData.get('number') as string,
      expiry: formData.get('expiry') as string,
      cvv: formData.get('cvv') as string,
      name: formData.get('name') as string
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Adicionar Novo Cartão
          </DialogTitle>
          <DialogDescription>
            Adicione um novo cartão de crédito para pagamentos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Número do Cartão</Label>
            <Input
              id="number"
              name="number"
              placeholder="•••• •••• •••• ••••"
              className="font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Validade</Label>
              <Input
                id="expiry"
                name="expiry"
                placeholder="MM/AA"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="•••"
                className="font-mono"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome no Cartão</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nome como está no cartão"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Cartão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
