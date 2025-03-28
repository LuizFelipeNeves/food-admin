import { z } from 'zod';
import { adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { hash } from 'bcryptjs';
import { Account } from '@/models/auth';

const userFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['user', 'admin'], {
    required_error: 'Selecione uma função',
  }),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
});

export const userRouter = router({
  list: adminProcedure.query(async () => {
    const users = await Account.find()
      .select('name email role isActive lastLogin createdAt')
      .sort({ createdAt: -1 });

    return users;
  }),

  create: adminProcedure
    .input(userFormSchema)
    .mutation(async ({ input }) => {
      const { name, email, role, password } = input;

      const existingUser = await Account.findOne({ email });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Já existe um usuário com este email',
        });
      }

      const hashedPassword = await hash(password!, 12);

      const user = await Account.create({
        name,
        email,
        role,
        password: hashedPassword,
        isActive: true,
      });

      return user;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(3),
      email: z.string().email(),
      role: z.enum(['user', 'admin']),
    }))
    .mutation(async ({ input }) => {
      const { id, name, email, role } = input;

      const existingUser = await Account.findOne({ 
        email, 
        _id: { $ne: id } 
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Já existe outro usuário com este email',
        });
      }

      const user = await Account.findByIdAndUpdate(
        id,
        { name, email, role },
        { new: true }
      );

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      return user;
    }),

  updateStatus: adminProcedure
    .input(z.object({
      userId: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { userId, isActive } = input;

      const user = await Account.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true }
      );

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      return user;
    }),

  updatePassword: adminProcedure
    .input(z.object({
      userId: z.string(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const { userId, password } = input;

      const hashedPassword = await hash(password, 12);

      const user = await Account.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      return user;
    }),
}); 