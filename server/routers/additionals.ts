import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Additional } from '../../models';
import mongoose from 'mongoose';

export const additionalsRouter = router({
  list: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return await Additional.find({ store: input.storeId })
        .sort({ name: 1 });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      price: z.number(),
      stock: z.number(),
      active: z.boolean(),
      store: z.string(),
    }))
    .mutation(async ({ input }) => {
      const additional = new Additional({
        ...input,
        store: new mongoose.Types.ObjectId(input.store),
      });
      await additional.save();
      return additional;
    }),

  update: publicProcedure
    .input(z.object({
      _id: z.string(),
      name: z.string(),
      price: z.number().min(0),
      stock: z.number().min(0),
      active: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { _id, ...updateData } = input;
      const additional = await Additional.findByIdAndUpdate(
        _id,
        updateData,
        { new: true }
      );
      return additional;
    }),

  delete: publicProcedure
    .input(z.object({
      _id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await Additional.findByIdAndDelete(input._id);
      return { success: true };
    }),
});
