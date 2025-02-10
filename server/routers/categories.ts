import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Category } from '../../models';
import mongoose from 'mongoose';

export const categoriesRouter = router({
  list: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return await Category.find({ 
        store: new mongoose.Types.ObjectId(input.storeId)
      })
        .sort({ name: 1 });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      store: z.string(),
    }))
    .mutation(async ({ input }) => {
      const category = new Category({
        ...input,
        store: new mongoose.Types.ObjectId(input.store)
      });
      await category.save();
      return category;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const category = await Category.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        updateData,
        { new: true }
      );
      return category;
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await Category.findByIdAndDelete(new mongoose.Types.ObjectId(input.id));
      return { success: true };
    }),
});
