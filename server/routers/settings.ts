import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { Store } from '@/models';

const businessSchema = z.object({
  businessName: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(5, 'Descrição muito curta'),
  // email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço muito curto'),
  logo: z.string().optional(),
});

const businessHoursSchema = z.array(z.object({
  day: z.string(),
  enabled: z.boolean(),
  hours: z.object({
    from: z.object({
      hour: z.number().min(0).max(23),
      minute: z.number().min(0).max(59),
    }),
    to: z.object({
      hour: z.number().min(0).max(23),
      minute: z.number().min(0).max(59),
    }),
  }),
}));

const paymentMethodSchema = z.array(z.string());

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  showPublicEmail: z.boolean(),
  showPublicPhone: z.boolean(),
  soundAlerts: z.boolean(),
});

export const settingsRouter = router({
  getBusiness: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      const store = await Store.findById(input.storeId);
      if (!store) {
        throw new Error('Store not found');
      }
      return {
        businessName: store.title || '',
        description: store.description || '',
        email: store.email || '',
        phone: store.phone || '',
        address: store.address?.street || '',
        logo: store.logo,
      };
    }),

  updateBusiness: publicProcedure
    .input(businessSchema.extend({
      storeId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { storeId, ...data } = input;
      const store = await Store.findById(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      const updatedStore = await Store.findByIdAndUpdate(
        storeId,
        {
          title: data.businessName,
          description: data.description,
          // email: data.email,
          phone: data.phone,
          'address.street': data.address,
          logo: data.logo,
        },
        { new: true }
      );

      return updatedStore;
    }),

  getBusinessHours: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      const store = await Store.findById(input.storeId);
      if (!store) {
        throw new Error('Store not found');
      }
      return store.businessHours || [];
    }),

  updateBusinessHours: publicProcedure
    .input(z.object({
      storeId: z.string(),
      businessHours: businessHoursSchema,
    }))
    .mutation(async ({ input }) => {
      const { storeId, businessHours } = input;
      const store = await Store.findById(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      const updatedStore = await Store.findByIdAndUpdate(
        storeId,
        { businessHours },
        { new: true }
      );

      return updatedStore.businessHours;
    }),

  getPaymentMethods: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      const store = await Store.findById(input.storeId);
      if (!store) {
        throw new Error('Store not found');
      }
      return store.paymentMethods || [];
    }),

  updatePaymentMethods: publicProcedure
    .input(z.object({
      storeId: z.string(),
      paymentMethods: paymentMethodSchema,
    }))
    .mutation(async ({ input }) => {
      const { storeId, paymentMethods } = input;
      const store = await Store.findById(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      const updatedStore = await Store.findByIdAndUpdate(
        storeId,
        { paymentMethods },
        { new: true }
      );

      return updatedStore.paymentMethods;
    }),

  updateNotificationSettings: publicProcedure
    .input(notificationSettingsSchema.extend({
      storeId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { storeId, ...settings } = input;
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new Error('Store not found');
      }

      await Store.findByIdAndUpdate(storeId, {
        emailNotifications: settings.emailNotifications,
        showPublicEmail: settings.showPublicEmail,
        showPublicPhone: settings.showPublicPhone,
        soundAlerts: settings.soundAlerts,
      });

      return { success: true };
    }),

  getNotificationSettings: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      const store = await Store.findById(input.storeId);
      
      if (!store) {
        throw new Error('Store not found');
      }

      return {
        emailNotifications: store.emailNotifications ?? true,
        showPublicEmail: store.showPublicEmail ?? true,
        showPublicPhone: store.showPublicPhone ?? true,
        soundAlerts: store.soundAlerts ?? true,
      };
    }),
});
