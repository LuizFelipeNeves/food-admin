import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Item } from '../../models';
import mongoose from 'mongoose';

export const productsRouter = router({
  list: publicProcedure
    .input(z.object({
      storeId: z.string(),
      category: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const query: any = { 
        store: new mongoose.Types.ObjectId(input.storeId)
      };
      if (input.category) {
        query.category = input.category;
      }
      return await Item.find(query)
        .populate('additionals')
        .populate('additionalGroups')
        .sort({ createdAt: -1 });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0),
      discountPercentage: z.number().min(0),
      image: z.string().optional(),
      category: z.string(),
      store: z.string(),
      additionals: z.array(z.string()).optional(),
      additionalGroups: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const product = new Item({
        ...input,
        store: new mongoose.Types.ObjectId(input.store),
        additionals: input.additionals?.map(id => new mongoose.Types.ObjectId(id)),
        additionalGroups: input.additionalGroups?.map(id => new mongoose.Types.ObjectId(id))
      });
      await product.save();
      return product;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0),
      discountPercentage: z.number().min(0),
      image: z.string().optional(),
      category: z.string(),
      additionals: z.array(z.string()).optional(),
      additionalGroups: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const product = await Item.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        {
          ...updateData,
          additionals: updateData.additionals?.map(id => new mongoose.Types.ObjectId(id)),
          additionalGroups: updateData.additionalGroups?.map(id => new mongoose.Types.ObjectId(id))
        },
        { new: true }
      ).populate('additionals').populate('additionalGroups');
      return product;
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await Item.findByIdAndDelete(new mongoose.Types.ObjectId(input.id));
      return { success: true };
    }),
});
