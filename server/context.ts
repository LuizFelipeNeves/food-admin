import { connectDB } from '../lib/mongodb';

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}) {
  await connectDB();
  return {
    req,
    res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
