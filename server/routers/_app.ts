import { router } from '../trpc';
import { productsRouter } from './products';
import { categoriesRouter } from './categories';
import { additionalsRouter } from './additionals';
import { additionalCategoriesRouter } from './additionalCategories';

export const appRouter = router({
  products: productsRouter,
  productCategories: categoriesRouter,
  additionals: additionalsRouter,
  additionalCategories: additionalCategoriesRouter,
});

export type AppRouter = typeof appRouter;
