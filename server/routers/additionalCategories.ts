import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { AdditionalGroup } from '../../models';
import mongoose from 'mongoose';

export const additionalCategoriesRouter = router({
  list: protectedProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return await AdditionalGroup.find({ 
        store: new mongoose.Types.ObjectId(input.storeId)
      })
        .sort({ name: 1 });
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      store: z.string(),
      minQuantity: z.number().min(0),
      maxQuantity: z.number().min(0),
    }))
    .mutation(async ({ input }) => {
      const category = new AdditionalGroup({
        ...input,
        store: new mongoose.Types.ObjectId(input.store)
      });
      await category.save();
      return category;
    }),

  update: protectedProcedure
    .input(z.object({
      _id: z.string(),
      name: z.string(),
      minQuantity: z.number().min(0),
      maxQuantity: z.number().min(0),
    }))
    .mutation(async ({ input }) => {
      const { _id, ...updateData } = input;
      const category = await AdditionalGroup.findByIdAndUpdate(
        new mongoose.Types.ObjectId(_id),
        updateData,
        { new: true }
      );
      return category;
    }),

  delete: protectedProcedure
    .input(z.object({
      _id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await AdditionalGroup.findByIdAndDelete(new mongoose.Types.ObjectId(input._id));
      return { success: true };
    }),
});
