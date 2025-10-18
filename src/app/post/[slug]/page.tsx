"use client";

import { trpc } from "@/utils/trpc";
import { notFound, useParams } from "next/navigation";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.post.getBySlug.useQuery({ slug });

  if (isLoading) return <p className="text-center mt-20">Loading...</p>;
  if (!post) return notFound();

  // Ensure categories is always an array
  const categories = (post.categories ?? []) as {
    id: number;
    name: string;
  }[];

  const colors = [
    "bg-red-600/80",
    "bg-green-600/80",
    "bg-blue-600/80",
    "bg-yellow-500/80",
    "bg-purple-600/80",
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      {/* Cover Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
        />
      )}

      {/* Title */}
      <h1 className="text-4xl font-bold mt-6 mb-3 text-blue-600 dark:text-blue-400">
        {post.title}
      </h1>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat, i) => (
            <span
              key={cat.id}
              className={`${
                colors[i % colors.length]
              } text-white px-3 py-1 rounded-full text-sm`}
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <article className="glass-card p-6 rounded-xl leading-relaxed text-gray-800 dark:text-gray-200">
        {post.content}
      </article>

      {/* Meta */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        {post.createdAt
          ? `Published on ${new Date(post.createdAt).toLocaleDateString()}`
          : "Publish date unavailable"}
      </div>
    </div>
  );
}
