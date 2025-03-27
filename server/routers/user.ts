import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';

export const userRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
  
  list: adminProcedure.query(async () => {
    // Aqui você implementaria a lógica para listar usuários do banco de dados
    return [];
  }),
  
  update: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Aqui você implementaria a lógica para atualizar o usuário no banco de dados
      return { success: true };
    }),
}); 