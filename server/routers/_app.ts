import { router } from '../trpc';
import { productsRouter } from './products';
import { categoriesRouter } from './categories';
import { additionalsRouter } from './additionals';
import { additionalCategoriesRouter } from './additionalCategories';
import { settingsRouter } from './settings';
import { ordersRouter } from './orders';

export const appRouter = router({
  products: productsRouter,
  productCategories: categoriesRouter,
  additionals: additionalsRouter,
  additionalCategories: additionalCategoriesRouter,
  settings: settingsRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
