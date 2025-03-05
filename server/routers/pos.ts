import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Item, Category, Order, Additional, AdditionalGroup, Store, User } from '@/models';
import mongoose from 'mongoose';

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
  getCategories: publicProcedure
    .query(async () => {
      try {
        return await Category.find({ active: true })
          .sort({ name: 1 });
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        throw new Error('Não foi possível carregar as categorias');
      }
    }),

  getProductsByCategory: publicProcedure
    .input(z.object({
      categoryId: z.string().min(1, "ID da categoria é obrigatório"),
    }))
    .query(async ({ input }) => {
      try {
        // Buscar produtos da categoria
        const products = await Item.find({
          category: new mongoose.Types.ObjectId(input.categoryId),
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

  getAllProducts: publicProcedure
    .query(async () => {
      try {
        // Buscar todos os produtos ativos
        const products = await Item.find({ active: true })
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

  createOrder: publicProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
        additionals: z.array(z.string()).optional(),
      })),
      paymentMethod: z.string(),
      storeId: z.string().optional(), // ID da loja opcional, usará a primeira loja se não for fornecido
    }))
    .mutation(async ({ input }) => {
      try {
        // Buscar informações completas dos produtos
        const productIds = input.items.map(item => 
          new mongoose.Types.ObjectId(item.productId)
        );
        
        const products = await Item.find({
          _id: { $in: productIds }
        }).populate('additionals');
        
        if (products.length !== productIds.length) {
          throw new Error('Alguns produtos não foram encontrados');
        }
        
        // Buscar todos os adicionais que podem estar nos pedidos
        const allAdditionalIds = input.items.flatMap(item => item.additionals || [])
          .map(id => new mongoose.Types.ObjectId(id));
        
        const additionals = allAdditionalIds.length > 0 
          ? await Additional.find({ _id: { $in: allAdditionalIds } })
          : [];
        
        // Calcular valores
        const orderItems = await Promise.all(input.items.map(async (item) => {
          const product = products.find(p => 
            p._id.toString() === item.productId
          );
          
          if (!product) {
            throw new Error(`Produto não encontrado: ${item.productId}`);
          }
          
          // Buscar adicionais selecionados
          const selectedAdditionals = item.additionals && item.additionals.length > 0
            ? additionals
                .filter(additional => 
                  item.additionals?.includes(additional._id.toString())
                )
                .map(additional => ({
                  _id: additional._id.toString(),
                  name: additional.name,
                  price: additional.price
                }))
            : [];
          
          // Calcular preço total do item com adicionais
          const additionalTotal = selectedAdditionals.reduce(
            (sum: number, additional: { price: number }) => sum + additional.price, 
            0
          );
          
          const itemTotal = (product.price + additionalTotal) * item.quantity;
          
          return {
            _id: product._id.toString(), // Adicionando _id explicitamente
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            notes: item.notes,
            additionals: selectedAdditionals,
            total: itemTotal
          };
        }));
        
        const subtotal = orderItems.reduce(
          (sum, item) => sum + item.total, 
          0
        );
        
        // Buscar ou criar usuário padrão para PDV
        let user = await User.findOne({ email: 'pdv@sistema.com' });
        if (!user) {
          user = new User({
            name: 'Cliente PDV',
            email: 'pdv@sistema.com',
            phone: '0000000000'
          });
          await user.save();
        }
        
        // Criar o pedido
        const newOrder = new Order({
          items: orderItems,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'paid', // No POS, o pagamento é feito na hora
          subtotal,
          total: subtotal,
          status: 'pending',
          source: 'pos',
          store: input.storeId, // Campo obrigatório
          user: user._id, // Campo obrigatório
          deliveryType: 'local', // Campo obrigatório, no PDV é sempre local
          events: [{
            date: new Date(),
            status: 'pending',
            description: 'Pedido criado no PDV'
          }]
        });

        await newOrder.save();
        return newOrder;
      } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw new Error('Não foi possível criar o pedido: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      }
    }),
}); 