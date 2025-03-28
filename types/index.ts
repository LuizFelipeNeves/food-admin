export interface Account {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  phone?: string;
}

export interface AccountFormData {
  name: string;
  email: string;
  role: 'admin' | 'user';
  password?: string;
  phone?: string;
}

export interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
} 