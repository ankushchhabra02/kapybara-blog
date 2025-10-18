import { db } from "../db";

export const createContext = async () => ({
  db,
});

export type Context = Awaited<ReturnType<typeof createContext>>;
