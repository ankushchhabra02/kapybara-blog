"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import ReactMarkdown from "react-markdown";
import CloudinaryUploader from "@/components/CoudinaryUploader";

export default function DashboardPage() {
  const utils = trpc.useUtils();

  // --- Queries & Mutations ---
  const { data: categories = [] } = trpc.category.getAll.useQuery();
  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => utils.post.getAll.invalidate(),
  });

  // --- Local States ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");

  // --- Handlers ---
  const handleSubmit = () => {
    createPost.mutate({
      title,
      content,
      slug,
      imageUrl,
      categoryIds: selectedCategories, // send array of selected categories
    });

    setTitle("");
    setContent("");
    setSlug("");
    setImageUrl(undefined);
    setSelectedCategories([]);
  };

  const handleAddCategory = () => {
    if (newCatName && newCatSlug) {
      createCategory.mutate({ name: newCatName, slug: newCatSlug });
      setNewCatName("");
      setNewCatSlug("");
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value)
    );
    setSelectedCategories(options);
  };

  // --- Render ---
  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">📝 Create New Blog Post</h1>

      <input
        className="w-full p-2 border rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded"
        placeholder="Slug (unique)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <textarea
        className="w-full p-2 border rounded h-40"
        placeholder="Write your markdown content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* --- Category Section --- */}
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Select Categories</h2>
        <select
          className="border p-2 rounded w-full"
          multiple
          value={selectedCategories.map(String)}
          onChange={handleCategoryChange}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="mt-3 flex gap-2">
          <input
            className="border p-2 rounded flex-1"
            placeholder="New Category Name"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <input
            className="border p-2 rounded flex-1"
            placeholder="Slug"
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-500 text-white px-3 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <CloudinaryUploader onUpload={setImageUrl} />

      <button
        onClick={handleSubmit}
        disabled={createPost.isPending}
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        {createPost.isPending ? "Publishing..." : "Publish Post"}
      </button>

      <h2 className="text-xl font-semibold mt-10">Live Markdown Preview:</h2>
      <div className="border p-4 rounded bg-gray-50">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
