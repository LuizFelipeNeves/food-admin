import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { Item, Category, Additional, AdditionalGroup } from '@/models';
import mongoose from 'mongoose';
import { orderService } from '../services/order-service';

// Definir interfaces para tipagem
interface IAdditional {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  price: number;
}

interface IAdditionalGroup {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  additionals: IAdditional[];
  minQuantity?: number;
  maxQuantity?: number;
}

export const posRouter = router({
  getCategories: protectedProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        return await Category.find({ 
          store: new mongoose.Types.ObjectId(input.storeId),
          active: true 
        })
          .sort({ name: 1 });
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        throw new Error('Não foi possível carregar as categorias');
      }
    }),

  getProductsByCategory: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const products = await Item.find({
          category: new mongoose.Types.ObjectId(input.categoryId),
          store: new mongoose.Types.ObjectId(input.storeId),
          active: true
        })
          .populate('category')
          .populate('additionals')
          .populate({
            path: 'additionalGroups',
            model: AdditionalGroup
          })
          .sort({ name: 1 });

        // Para cada produto, popular os adicionais dos grupos de adicionais
        const productsWithPopulatedGroups = await Promise.all(
          products.map(async (product) => {
            // Converter para objeto para poder modificar
            const productObj = product.toObject();

            // Se o produto tem grupos de adicionais, popular os adicionais de cada grupo
            if (productObj.additionalGroups && productObj.additionalGroups.length > 0) {
              // Buscar todos os grupos com seus adicionais populados
              const populatedGroups = await AdditionalGroup.find({
                _id: { $in: productObj.additionalGroups.map((group: IAdditionalGroup) => group._id) }
              }).populate('additionals');

              // Substituir os grupos no produto
              productObj.additionalGroups = populatedGroups.map((group) => ({
                _id: group._id.toString(),
                name: group.name,
                additionals: group.additionals.map((additional: IAdditional) => ({
                  _id: additional._id.toString(),
                  name: additional.name,
                  price: additional.price
                })),
                minQuantity: group.minQuantity || 0,
                maxQuantity: group.maxQuantity || 1
              }));
            }

            // Garantir que os adicionais diretos também estejam formatados corretamente
            if (productObj.additionals) {
              productObj.additionals = productObj.additionals.map((additional: IAdditional) => ({
                _id: additional._id.toString(),
                name: additional.name,
                price: additional.price
              }));
            }

            return productObj;
          })
        );

        return productsWithPopulatedGroups;
      } catch (error) {
        console.error('Erro ao buscar produtos por categoria:', error);
        throw new Error('Não foi possível carregar os produtos da categoria');
      }
    }),

  getAllProducts: protectedProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        // Buscar todos os produtos ativos
        const products = await Item.find({ 
          store: new mongoose.Types.ObjectId(input.storeId),
          active: true 
        })
          .populate('category')
          .populate('additionals')
          .populate({
            path: 'additionalGroups',
            model: AdditionalGroup
          })
          .sort({ name: 1 });

        // Para cada produto, popular os adicionais dos grupos de adicionais
        const productsWithPopulatedGroups = await Promise.all(
          products.map(async (product) => {
            // Converter para objeto para poder modificar
            const productObj = product.toObject();

            // Se o produto tem grupos de adicionais, popular os adicionais de cada grupo
            if (productObj.additionalGroups && productObj.additionalGroups.length > 0) {
              // Buscar todos os grupos com seus adicionais populados
              const populatedGroups = await AdditionalGroup.find({
                _id: { $in: productObj.additionalGroups.map((group: IAdditionalGroup) => group._id) }
              }).populate('additionals');

              // Substituir os grupos no produto
              productObj.additionalGroups = populatedGroups.map((group) => ({
                _id: group._id.toString(),
                name: group.name,
                additionals: group.additionals.map((additional: IAdditional) => ({
                  _id: additional._id.toString(),
                  name: additional.name,
                  price: additional.price
                })),
                minQuantity: group.minQuantity || 0,
                maxQuantity: group.maxQuantity || 1
              }));
            }

            // Garantir que os adicionais diretos também estejam formatados corretamente
            if (productObj.additionals) {
              productObj.additionals = productObj.additionals.map((additional: IAdditional) => ({
                _id: additional._id.toString(),
                name: additional.name,
                price: additional.price
              }));
            }

            return productObj;
          })
        );

        return productsWithPopulatedGroups;
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw new Error('Não foi possível carregar os produtos');
      }
    }),

  createOrder: protectedProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
        additionals: z.array(z.string()).optional(),
      })),
      paymentMethod: z.string(),
      storeId: z.string(),
      customerPhone: z.string().optional(),
      customerName: z.string().optional(),
      sendNotification: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await orderService.createOrder({
          items: input.items,
          paymentMethod: input.paymentMethod,
          storeId: input.storeId,
          customerPhone: input.customerPhone,
          customerName: input.customerName,
          sendNotification: input.sendNotification,
        });

        if (!result.notificationSent) {
          console.log('Notificação WhatsApp de pedido criado não enviada:', result.notificationMessage);
        }

        return result.order;
      } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw new Error('Não foi possível criar o pedido: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      }
    }),
}); 