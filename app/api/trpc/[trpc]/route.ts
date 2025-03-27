import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ 
      req,
      resHeaders: new Headers()
    }),
    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error('Something went wrong', error);
      }
      return {
        message: error.message,
      };
    },
  });

  return response;
};

export { handler as GET, handler as POST };
