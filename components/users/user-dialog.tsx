'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/app/_trpc/client';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

// Schema base para campos comuns
const baseUserSchema = {
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user'] as const),
};

// Schema para criação de usuário
const createUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Schema para edição de usuário
const editUserSchema = z.object({
  ...baseUserSchema,
});

// Schema para alteração de senha
const changePasswordSchema = z.object({
  userId: z.string(),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type CreateUserData = z.infer<typeof createUserSchema>;
type EditUserData = z.infer<typeof editUserSchema>;
type ChangePasswordData = z.infer<typeof changePasswordSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    phone?: string;
    isPasswordChange?: boolean;
  };
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const utils = trpc.useUtils();
  const isPasswordChange = user?.isPasswordChange;
  const isEditing = !!user && !isPasswordChange;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form para criação/edição
  const userForm = useForm<CreateUserData | EditUserData>({
    resolver: zodResolver(isEditing ? editUserSchema : createUserSchema),
    defaultValues: isEditing ? {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role as 'admin' | 'user',
    } : {
      name: '',
      email: '',
      phone: '',
      role: 'user' as const,
      password: '',
      confirmPassword: '',
    },
  });

  // Form para alteração de senha
  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      userId: user?._id || '',
      password: '',
      confirmPassword: '',
    },
  });

  // Mutations
  const { mutateAsync: createUser, isLoading: isCreating } = trpc.auth.createStaff.useMutation({
    onSuccess: () => {
      toast.success('Usuário criado com sucesso');
      utils.user.list.invalidate();
      onOpenChange(false);
      userForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar usuário');
    },
  });

  const { mutateAsync: updateUser, isLoading: isUpdating } = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso');
      utils.user.list.invalidate();
      onOpenChange(false);
      userForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar usuário');
    },
  });

  const { mutateAsync: updatePassword, isLoading: isChangingPassword } = trpc.user.updatePassword.useMutation({
    onSuccess: () => {
      toast.success('Senha alterada com sucesso');
      onOpenChange(false);
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao alterar senha');
    },
  });

  const onSubmit = async (data: CreateUserData | EditUserData | ChangePasswordData) => {
    try {
      if (isPasswordChange && user) {
        await updatePassword({
          userId: user._id,
          password: (data as ChangePasswordData).password,
        });
      } else if (isEditing && user) {
        await updateUser({
          id: user._id,
          ...data as EditUserData,
        });
      } else {
        await createUser(data as CreateUserData);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const currentForm = isPasswordChange ? passwordForm : userForm;
  const isSubmitting = isCreating || isUpdating || isChangingPassword;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isPasswordChange ? 'Alterar Senha' : isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {isPasswordChange 
              ? 'Digite a nova senha do usuário'
              : isEditing 
                ? 'Faça as alterações necessárias nos dados do usuário'
                : 'Preencha os dados para criar um novo usuário'}
          </DialogDescription>
        </DialogHeader>

        {isPasswordChange ? (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Digite a nova senha" 
                          type={showPassword ? "text" : "password"} 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Confirme a nova senha" 
                          type={showConfirmPassword ? "text" : "password"} 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
                  Alterar Senha
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o telefone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && (
                <>
                  <FormField
                    control={userForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Digite a senha" 
                              type={showPassword ? "text" : "password"} 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={userForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Confirme a senha" 
                              type={showConfirmPassword ? "text" : "password"} 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
} 