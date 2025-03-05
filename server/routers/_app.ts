import { router } from '../trpc';
import { productsRouter } from './products';
import { categoriesRouter } from './categories';
import { additionalsRouter } from './additionals';
import { additionalCategoriesRouter } from './additionalCategories';
import { settingsRouter } from './settings';
import { ordersRouter } from './orders';
import { dashboardRouter } from './dashboard';
import { dataRouter } from './data';
import { posRouter } from './pos';

export const appRouter = router({
  products: productsRouter,
  productCategories: categoriesRouter,
  additionals: additionalsRouter,
  additionalCategories: additionalCategoriesRouter,
  settings: settingsRouter,
  orders: ordersRouter,
  dashboard: dashboardRouter,
  data: dataRouter,
  pos: posRouter
});

export type AppRouter = typeof appRouter;
