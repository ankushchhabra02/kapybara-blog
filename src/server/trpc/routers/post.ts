import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { posts, postCategories, categories } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const postRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Fetch all posts first
    const allPosts = await ctx.db.select().from(posts);

    // Fetch all post-category relations with category info
    const relations = await ctx.db
      .select({
        postId: postCategories.postId,
        categoryId: categories.id,
        categoryName: categories.name,
      })
      .from(postCategories)
      .leftJoin(categories, eq(postCategories.categoryId, categories.id));

    // Map categories to posts
    const postsWithCategories = allPosts.map((post) => {
      const postCats = relations
        .filter((rel) => rel.postId === post.id)
        .map((rel) => ({ id: rel.categoryId, name: rel.categoryName }));
      return {
        ...post,
        categories: postCats,
      };
    });

    return postsWithCategories;
  }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        slug: z.string().min(1),
        imageUrl: z.string().url().optional(),
        categoryIds: z.array(z.number()).optional(), // <-- multiple categories
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1️⃣ Insert into posts table
      const [createdPost] = await ctx.db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          slug: input.slug,
          imageUrl: input.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: posts.id }); // get the inserted post ID

      // 2️⃣ Insert into postCategories table
      if (input.categoryIds && input.categoryIds.length > 0) {
        await ctx.db.insert(postCategories).values(
          input.categoryIds.map((catId) => ({
            postId: createdPost.id,
            categoryId: catId,
          }))
        );
      }

      return { success: true };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
        imageUrl: z.string().url().optional(),
        categoryIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update post
      await ctx.db
        .update(posts)
        .set({
          title: input.title,
          content: input.content,
          imageUrl: input.imageUrl ?? null,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id));

      // Remove old category mappings
      await ctx.db
        .delete(postCategories)
        .where(eq(postCategories.postId, input.id));

      // Insert new category mappings
      if (input.categoryIds && input.categoryIds.length > 0) {
        await ctx.db.insert(postCategories).values(
          input.categoryIds.map((catId) => ({
            postId: input.id,
            categoryId: catId,
          }))
        );
      }

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Delete post-category mappings first
      await ctx.db
        .delete(postCategories)
        .where(eq(postCategories.postId, input.id));
      // Delete post
      await ctx.db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
