import { Banknote, QrCode, CreditCard, CreditCardIcon } from 'lucide-react';

export const PAYMENTS = [
  {
    id: "money",
    name: "Dinheiro",
    description: "Aceitar pagamento via Dinheiro",
    icon: Banknote,
  },
  {
    id: "pix",
    name: "Pix",
    description: "Aceitar pagamento via PIX",
    icon: QrCode,
  },
  {
    id: "credit",
    name: "Cartão de Crédito",
    description: "Aceitar pagamento via Cartão de Crédito",
    icon: CreditCard,
  },
  {
    id: "debit",
    name: "Cartão de Débito",
    description: "Aceitar pagamento via Cartão de Débito",
    icon: CreditCardIcon,
  },
  {
    id: "vrRefeicao",
    name: "Vale Refeição",
    description: "Aceitar pagamento via Vale Refeição",
    icon: CreditCard,
  },
  {
    id: "ticketRefeicao",
    name: "Ticket Refeição",
    description: "Aceitar pagamento via Ticket Refeição",
    icon: CreditCard,
  },
  {
    id: "aleloRefeicao",
    name: "Alelo Refeição",
    description: "Aceitar pagamento via Alelo Refeição",
    icon: CreditCard,
  },
  {
    id: "sodexoRefeicao",
    name: "Sodexo Refeição",
    description: "Aceitar pagamento via Sodexo Refeição",
    icon: CreditCard,
  }
] as const;

export const PAYMENT_METHOD_NAMES = PAYMENTS.reduce((acc, payment) => {
  acc[payment.id] = payment.name;
  return acc;
}, {} as Record<string, string>);
