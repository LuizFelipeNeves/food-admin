import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { AdditionalCategory } from '../../models';
import mongoose from 'mongoose';

export const additionalCategoriesRouter = router({
  list: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return await AdditionalCategory.find({ 
        store: new mongoose.Types.ObjectId(input.storeId)
      })
        .sort({ name: 1 });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      store: z.string(),
      minQuantity: z.number().min(0),
      maxQuantity: z.number().min(0),
    }))
    .mutation(async ({ input }) => {
      const category = new AdditionalCategory({
        ...input,
        store: new mongoose.Types.ObjectId(input.store)
      });
      await category.save();
      return category;
    }),

  update: publicProcedure
    .input(z.object({
      _id: z.string(),
      name: z.string(),
      minQuantity: z.number().min(0),
      maxQuantity: z.number().min(0),
    }))
    .mutation(async ({ input }) => {
      const { _id, ...updateData } = input;
      const category = await AdditionalCategory.findByIdAndUpdate(
        new mongoose.Types.ObjectId(_id),
        updateData,
        { new: true }
      );
      return category;
    }),

  delete: publicProcedure
    .input(z.object({
      _id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await AdditionalCategory.findByIdAndDelete(new mongoose.Types.ObjectId(input._id));
      return { success: true };
    }),
});
