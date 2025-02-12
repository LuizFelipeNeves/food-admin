import { router } from '../trpc';
import { productsRouter } from './products';
import { categoriesRouter } from './categories';
import { additionalsRouter } from './additionals';
import { additionalCategoriesRouter } from './additionalCategories';
import { settingsRouter } from './settings';

export const appRouter = router({
  products: productsRouter,
  productCategories: categoriesRouter,
  additionals: additionalsRouter,
  additionalCategories: additionalCategoriesRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
