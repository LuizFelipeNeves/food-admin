import { connectDB } from '../lib/mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext(opts: FetchCreateContextFnOptions) {
  await connectDB();
  
  // Obter a sessão do usuário
  const session = await getServerSession(authOptions);
  
  return {
    session,
    req: opts.req,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
