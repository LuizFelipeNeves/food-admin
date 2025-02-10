import * as trpcNext from '@trpc/server/adapters/next';
import { connectDB } from '../lib/mongodb';

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions) {
  await connectDB();
  return {
    req,
    res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
