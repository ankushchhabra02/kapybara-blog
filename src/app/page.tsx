"use client";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

export default function HomePage() {
  const { data: posts = [], isLoading } = trpc.post.getAll.useQuery();

  if (isLoading) return <p>Loading...</p>;

  const recentPosts = posts.slice(0, 4);
  const allPosts = posts.slice(4);

  return (
    <div className="max-w-7xl mx-auto py-20 px-4 space-y-12">
      <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">
        Welcome to MyBlog
      </h1>

      {/* Recent Blogs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Blogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.slug}`}>
              <div className="glass-card p-4 cursor-pointer">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                  {post.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Blogs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">All Blogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.slug}`}>
              <div className="glass-card p-4 cursor-pointer">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                  {post.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
