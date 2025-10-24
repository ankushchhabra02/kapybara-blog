"use client";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

const colors = [
  "border-red-500 text-red-500",
  "border-green-500 text-green-500",
  "border-blue-500 text-blue-500",
  "border-yellow-500 text-yellow-600",
  "border-purple-500 text-purple-500",
];

export default function HomePage() {
  const { data: posts = [], isLoading } = trpc.post.getAll.useQuery();

  if (isLoading) return <p>Loading...</p>;

  const recentPosts = posts.slice(0, Math.min(3, posts.length));
  const allPosts = posts.slice(Math.min(3, posts.length));

  return (
    <div className="max-w-7xl mx-auto py-20 px-4 space-y-12">
      <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">
        Welcome to MyBlog
      </h1>

      {/* Recent Blogs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Blogs</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Big left post */}
          {recentPosts[0] && (
            <Link
              href={`/post/${recentPosts[0].slug}`}
              className="flex-1 glass-card p-4 cursor-pointer transition-transform hover:scale-105 flex flex-col"
            >
              {recentPosts[0].imageUrl && (
                <img
                  src={recentPosts[0].imageUrl}
                  alt={recentPosts[0].title}
                  className="w-full h-80 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-2xl font-bold mb-2">
                {recentPosts[0].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
                {recentPosts[0].content}
              </p>

              {recentPosts[0].categories?.length ? (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {recentPosts[0].categories.map((cat, i) => {
                    const color = colors[i % colors.length];
                    return (
                      <span
                        key={cat.id}
                        className={`text-sm px-2 py-1 rounded border ${color} bg-white/10 dark:bg-gray-700/20`}
                      >
                        {cat.name}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </Link>
          )}

          {/* Right two smaller posts */}
          <div className="flex flex-col gap-6 flex-1">
            {recentPosts.slice(1, 3).map((post, idx) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="glass-card p-3 cursor-pointer flex gap-4 items-start hover:scale-105 transition-transform"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                    {post.content}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Blogs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">All Blogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allPosts.map((post, idx) => (
            <Link key={post.id} href={`/post/${post.slug}`}>
              <div className="glass-card p-4 cursor-pointer relative transition-transform hover:scale-105">
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

                {/* Categories */}
                {post.categories?.length ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.categories
                      .filter(
                        (cat): cat is { id: number; name: string } =>
                          !!cat.id && !!cat.name
                      )
                      .map((cat, i) => {
                        const colors = [
                          "bg-red-600",
                          "bg-green-600",
                          "bg-blue-600",
                          "bg-yellow-500",
                          "bg-purple-600",
                        ];
                        const color = colors[i % colors.length];
                        return (
                          <span
                            key={cat.id}
                            className={`${color} text-white text-sm px-2 py-1 rounded-full `}
                          >
                            {cat.name}
                          </span>
                        );
                      })}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
