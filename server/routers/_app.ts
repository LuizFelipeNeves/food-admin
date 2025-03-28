import { router } from '../trpc';
import { userRouter } from './user';
import { storesRouter } from './stores';

import { productsRouter } from './products';
import { categoriesRouter } from './categories';
import { additionalsRouter } from './additionals';
import { additionalCategoriesRouter } from './additionalCategories';
import { settingsRouter } from './settings';
import { ordersRouter } from './orders';
import { dashboardRouter } from './dashboard';
import { dataRouter } from './data';
import { posRouter } from './pos';
import { analyticsRouter } from './analytics';
import { authRouter } from './auth';

export const appRouter = router({
  user: userRouter,
  auth: authRouter,
  products: productsRouter,
  productCategories: categoriesRouter,
  additionals: additionalsRouter,
  additionalCategories: additionalCategoriesRouter,
  settings: settingsRouter,
  orders: ordersRouter,
  dashboard: dashboardRouter,
  data: dataRouter,
  pos: posRouter,
  analytics: analyticsRouter,
  stores: storesRouter
});

export type AppRouter = typeof appRouter;
