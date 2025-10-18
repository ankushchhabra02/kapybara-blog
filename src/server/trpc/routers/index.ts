import { router } from "../trpc";
import { categoryRouter } from "./category";
import { postRouter } from "./post";

export const appRouter = router({
  post: postRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
