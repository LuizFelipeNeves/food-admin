import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { Item } from '../../models';
import mongoose from 'mongoose';

export const productsRouter = router({
  list: protectedProcedure
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
        .populate('category')
        .sort({ createdAt: -1 });
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0),
      discountPercentage: z.number().min(0),
      image: z.string().nullable().optional(),
      category: z.string(),
      store: z.string(),
      stock: z.number().min(0),
      additionals: z.array(z.string()).optional(),
      additionalGroups: z.array(z.string()).optional(),
      active: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const product = new Item({
        ...input,
        store: new mongoose.Types.ObjectId(input.store),
        category: new mongoose.Types.ObjectId(input.category),
        additionals: input.additionals?.map(_id => new mongoose.Types.ObjectId(_id)),
        additionalGroups: input.additionalGroups?.map(_id => new mongoose.Types.ObjectId(_id))
      });
      await product.save();
      return product;
    }),

  update: protectedProcedure
    .input(z.object({
      _id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0),
      discountPercentage: z.number().min(0),
      image: z.string().nullable().optional(),
      category: z.string(),
      store: z.string(),
      stock: z.number().min(0),
      additionals: z.array(z.string()).optional(),
      additionalGroups: z.array(z.string()).optional(),
      active: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const { _id, ...updateData } = input;
      const product = await Item.findByIdAndUpdate(
        new mongoose.Types.ObjectId(_id),
        {
          ...updateData,
          store: new mongoose.Types.ObjectId(updateData.store),
          category: new mongoose.Types.ObjectId(updateData.category),
          additionals: updateData.additionals?.map(_id => new mongoose.Types.ObjectId(_id)),
          additionalGroups: updateData.additionalGroups?.map(_id => new mongoose.Types.ObjectId(_id))
        },
        { new: true }
      ).populate('additionals').populate('additionalGroups');
      return product;
    }),

  delete: protectedProcedure
    .input(z.object({
      _id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await Item.findByIdAndDelete(new mongoose.Types.ObjectId(input._id));
      return { success: true };
    }),
});
