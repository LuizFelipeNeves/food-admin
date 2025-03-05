import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Order, Item, Category } from '@/models';
import { subDays } from 'date-fns';
import { generateOrdersForTimeRange, generateRandomDeliveryTime, generateRandomPrice } from '../utils/seed-helpers';

export const dataRouter = router({
  seed: publicProcedure
    .input(z.object({
      storeId: z.string(),
      days: z.number().min(1).max(30).default(2),
    }))
    .mutation(async ({ input }) => {
      try {
        // Verificar categorias existentes
        const existingCategories = await Category.find({ store: input.storeId });
        const categoryNames = ['Lanches', 'Bebidas', 'Sobremesas', 'Acompanhamentos', 'Combos'];
        const categoriesToCreate = categoryNames.filter(
          name => !existingCategories.find(cat => cat.name === name)
        );

        // Criar apenas categorias que não existem
        const newCategories = categoriesToCreate.length > 0
          ? await Category.insertMany(
              categoriesToCreate.map(name => ({ name, store: input.storeId }))
            )
          : [];

        // Combinar categorias existentes com as novas
        const categories = [
          ...existingCategories,
          ...newCategories
        ];

        // Mapear categorias por nome para fácil acesso
        const categoryByName = categories.reduce((acc, cat) => {
          acc[cat.name] = cat;
          return acc;
        }, {} as Record<string, any>);

        // Verificar itens existentes
        const existingItems = await Item.find({ store: input.storeId });
        const itemsData = [
          // Lanches
          {
            name: 'X-Burger',
            description: 'Hambúrguer com queijo e salada',
            discountPercentage: 0,
            price: generateRandomPrice(15, 25),
            category: categoryByName['Lanches']._id,
            stock: 100,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          {
            name: 'X-Salada',
            description: 'Hambúrguer com queijo e salada completa',
            discountPercentage: 0,
            price: generateRandomPrice(18, 28),
            category: categoryByName['Lanches']._id,
            stock: 100,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          // Bebidas
          {
            name: 'Refrigerante 350ml',
            description: 'Refrigerante em lata',
            discountPercentage: 0,
            price: generateRandomPrice(5, 8),
            category: categoryByName['Bebidas']._id,
            stock: 200,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          {
            name: 'Suco Natural',
            description: 'Suco natural da fruta',
            discountPercentage: 0,
            price: generateRandomPrice(8, 12),
            category: categoryByName['Bebidas']._id,
            stock: 50,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          // Sobremesas
          {
            name: 'Pudim',
            description: 'Pudim de leite condensado',
            discountPercentage: 0,
            price: generateRandomPrice(8, 12),
            category: categoryByName['Sobremesas']._id,
            stock: 30,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          {
            name: 'Sorvete',
            description: 'Sorvete de diversos sabores',
            discountPercentage: 0,
            price: generateRandomPrice(10, 15),
            category: categoryByName['Sobremesas']._id,
            stock: 50,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          // Acompanhamentos
          {
            name: 'Batata Frita',
            description: 'Porção de batata frita crocante',
            discountPercentage: 0,
            price: generateRandomPrice(10, 15),
            category: categoryByName['Acompanhamentos']._id,
            stock: 100,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          {
            name: 'Onion Rings',
            description: 'Anéis de cebola empanados',
            discountPercentage: 0,
            price: generateRandomPrice(12, 18),
            category: categoryByName['Acompanhamentos']._id,
            stock: 80,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          // Combos
          {
            name: 'Combo Família',
            description: '4 lanches + 4 bebidas + 2 porções',
            discountPercentage: 10,
            price: generateRandomPrice(50, 70),
            category: categoryByName['Combos']._id,
            stock: 50,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
          {
            name: 'Combo Individual',
            description: '1 lanche + 1 bebida + 1 porção',
            discountPercentage: 5,
            price: generateRandomPrice(30, 40),
            category: categoryByName['Combos']._id,
            stock: 100,
            active: true,
            store: input.storeId,
            additionals: [],
            additionalGroups: [],
          },
        ];

        // Criar apenas itens que não existem
        const itemsToCreate = itemsData.filter(
          item => !existingItems.find(existing => existing.name === item.name)
        );

        const newItems = itemsToCreate.length > 0
          ? await Item.insertMany(itemsToCreate)
          : [];

        // Combinar itens existentes com os novos
        const items = [
          ...existingItems,
          ...newItems
        ];

        // Gerar pedidos para os últimos X dias
        const endDate = new Date();
        const startDate = subDays(endDate, input.days);
        
        // Gerar entre 3-8 pedidos por hora
        const orders = await generateOrdersForTimeRange(
          input.storeId,
          items,
          categories,
          startDate,
          endDate,
          3,
          8
        );

        await Order.insertMany(orders);

        return {
          message: 'Dados de teste gerados com sucesso',
          categories: categories.length,
          items: items.length,
          orders: orders.length,
          newCategories: newCategories.length,
          newItems: newItems.length,
        };
      } catch (error) {
        console.error('Erro ao gerar dados de teste:', error);
        throw new Error('Falha ao gerar dados de teste');
      }
    }),

  runMigration: publicProcedure
    .mutation(async () => {
      try {
        const completedOrders = await Order.find({ 
          status: 'completed',
          deliveryTime: { $exists: false }
        }).lean();

        const bulkOps = completedOrders.map(order => ({
          updateOne: {
            filter: { _id: order._id },
            update: { $set: { deliveryTime: generateRandomDeliveryTime() } }
          }
        }));
        
        await Order.bulkWrite(bulkOps);

        return { success: true, message: 'Migration concluída com sucesso!', ordersUpdated: bulkOps.length };
      } catch (error) {
        console.error('Erro ao executar migration:', error);
        throw new Error('Erro ao executar migration');
      }
    }),
}); 