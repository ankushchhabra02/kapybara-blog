"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import ReactMarkdown from "react-markdown";
import CloudinaryUploader from "@/components/CoudinaryUploader";
import { PlusCircle, Loader2, Edit, Rocket } from "lucide-react";
import { makeSlug } from "@/lib/slugify";

const CATEGORY_COLORS = [
  "bg-blue-500/80",
  "bg-green-500/80",
  "bg-yellow-500/80",
  "bg-purple-500/80",
  "bg-pink-500/80",
  "bg-indigo-500/80",
];

export default function DashboardPage() {
  const utils = trpc.useUtils();

  // --- Queries & Mutations ---
  const { data: categories = [] } = trpc.category.getAll.useQuery();
  const { data: posts = [] } = trpc.post.getAll.useQuery(); // fetch all posts
  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });
  const createPost = trpc.post.create.useMutation({
    onSuccess: () => utils.post.getAll.invalidate(),
  });
  const updatePost = trpc.post.update.useMutation({
    onSuccess: () => utils.post.getAll.invalidate(),
  });

  // --- Local States ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Auto-slugify title
  useEffect(() => {
    setSlug(makeSlug(title));
  }, [title]);

  // Filter drafts
  const drafts = posts.filter((p) => !p.published);

  // --- Handlers ---
  const handleCategoryToggle = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    createCategory.mutate({ name: newCatName, slug: makeSlug(newCatName) });
    setNewCatName("");
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSlug("");
    setImageUrl(undefined);
    setSelectedCategories([]);
    setEditingPostId(null);
  };

  const handleSubmit = (isDraft: boolean) => {
    if (editingPostId) {
      // update existing draft
      updatePost.mutate({
        id: editingPostId,
        title,
        content,
        imageUrl,
        categoryIds: selectedCategories,
        published: !isDraft,
      });
    } else {
      // create new post
      createPost.mutate({
        title,
        content,
        slug,
        imageUrl,
        categoryIds: selectedCategories,
        published: !isDraft,
      });
    }

    resetForm();
  };

  const handleEditDraft = (draft: any) => {
    setEditingPostId(draft.id);
    setTitle(draft.title);
    setContent(draft.content);
    setSlug(draft.slug);
    setImageUrl(draft.imageUrl);
    setSelectedCategories(draft.categories?.map((c: any) => c.id) || []);
  };

  const handlePublishDraft = (draft: any) => {
    updatePost.mutate({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      imageUrl: draft.imageUrl,
      categoryIds: draft.categories?.map((c: any) => c.id) || [],
      published: true,
    });
  };

  // --- Render ---
  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        📝 Create / Edit Blog Post
      </h1>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <input
          className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="Enter blog title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Thumbnail */}
      <div>
        <h2 className="font-semibold mb-2">Thumbnail Image</h2>
        <CloudinaryUploader onUpload={setImageUrl} />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Thumbnail Preview"
            className="w-full h-48 object-cover mt-3 rounded-md shadow-md"
          />
        )}
      </div>

      {/* Category Chips */}
      <div>
        <h2 className="font-semibold mb-3">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, i) => {
            const isSelected = selectedCategories.includes(cat.id);
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  isSelected
                    ? `${color} text-white`
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Add new category */}
        <div className="mt-4 flex gap-2 items-center">
          <input
            className="border p-2 rounded flex-1 bg-white dark:bg-gray-800 dark:border-gray-700"
            placeholder="New category name..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-1"
          >
            <PlusCircle size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Markdown Editor */}
      <div>
        <h2 className="font-semibold mb-2">Content (Markdown Supported)</h2>
        <textarea
          className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 h-40"
          placeholder="Write your blog content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => handleSubmit(false)}
          disabled={createPost.isPending || updatePost.isPending}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          {(createPost.isPending || updatePost.isPending) && (
            <Loader2 className="animate-spin" size={16} />
          )}
          Publish
        </button>

        <button
          onClick={() => handleSubmit(true)}
          className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        >
          Save as Draft
        </button>
      </div>

      {/* Markdown Preview */}
      <div>
        <h2 className="text-xl font-semibold mt-10">Live Markdown Preview:</h2>
        <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">🗂 Your Drafts</h2>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-4 border rounded-md flex justify-between items-center bg-gray-50 dark:bg-gray-800"
              >
                <div>
                  <h3 className="font-medium">{draft.title}</h3>
                  <p className="text-sm text-gray-500">
                    {draft.categories?.map((c: any) => c.name).join(", ") ||
                      "No categories"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditDraft(draft)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1 hover:bg-blue-600"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handlePublishDraft(draft)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md flex items-center gap-1 hover:bg-green-700"
                  >
                    <Rocket size={14} /> Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
