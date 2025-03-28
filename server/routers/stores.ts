import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { Store, UserStore } from '@/models';
import { TRPCError } from '@trpc/server';

const addressSchema = z.object({
  street: z.string().min(3, 'Endereço deve ter no mínimo 3 caracteres'),
  neighborhood: z.string().min(3, 'Bairro deve ter no mínimo 3 caracteres'),
  city: z.string().min(3, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado é obrigatório'),
  cep: z.string().length(8, 'CEP inválido'),
  complement: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

const createStoreSchema = z.object({
  title: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: addressSchema,
});

export const storesRouter = router({
  create: protectedProcedure
    .input(createStoreSchema)
    .mutation(async ({ input, ctx }) => {
      const store = new Store(input);
      await store.save();

      const userStore = new UserStore({
        user: ctx.user.id,
        store: store._id,
        role: 'owner',
      });
      await userStore.save();

      return store;
    }),

  getUserStores: protectedProcedure
    .query(async ({ ctx }) => {
      const userStores = await UserStore.find({
        user: ctx.user.id,
        active: true,
      }).populate('store');

      return userStores;
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const userStore = await UserStore.findOne({
        user: ctx.user.id,
        store: input,
        active: true,
      }).populate('store');

      if (!userStore) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return userStore.store;
    }),
}); 