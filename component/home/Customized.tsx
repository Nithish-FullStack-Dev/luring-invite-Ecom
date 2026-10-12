"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, LoaderCircle, Video, ArrowRight } from "lucide-react";
import { mediaUrl } from "@/lib/client-api";

type Category = { id: string; name: string; slug: string };
type Template = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  price: number;
  durationSeconds: number;
  categories: Category[];
  frames: { id: number; previewImage?: string | null }[];
};

const categoryOptions = [
  { label: "All Templates", value: "all" },
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "First Birthday", value: "first-birthday" },
];

export default function Customized() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/templates?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success")
        throw new Error(result.message || "Could not load templates.");
      setTemplates(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load templates.",
      );
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get(
      "category",
    );
    if (
      requestedCategory &&
      categoryOptions.some((option) => option.value === requestedCategory)
    ) {
      setCategory(requestedCategory);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  return (
    <>
      <section id="templates" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="page-title text-3xl font-semibold">
              Choose Your Template
            </h2>
            <p className="mt-2 text-gray-500">
              Start with a design and customize it to match your event.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <label className="relative flex-1 sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-[#a86dcd]"
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-[#a86dcd]"
            >
              {categoryOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-3 text-gray-500">
            <LoaderCircle className="animate-spin" /> Loading templates...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
            <p className="mt-2 text-sm">
              Check your Neon connection and run the Prisma seed command.
            </p>
            <button
              onClick={() => void loadTemplates()}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            No templates found. Run <code>npm run db:seed</code> to add the
            sample templates.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <article
                key={template.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Link
                  href={`/preview/${template.categories[0]?.slug || "birthday"}/${template.id}`}
                  className="block"
                >
                  <div className="relative bg-gray-100">
                    {template.thumbnail ? (
                      <img
                        src={mediaUrl(template.thumbnail)}
                        alt={template.title}
                        loading="lazy"
                        className="aspect-[9/12] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex aspect-[9/12] items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#8951ac]">
                      {template.categories[0]?.name || "Invitation"}
                    </span>
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                      <Video size={13} /> Preview
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-semibold text-gray-900">
                      {template.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
                      {template.description ||
                        "Customize this invitation with your event details."}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-[#975dbb]">
                        ₹{template.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {template.frames.length} frame
                        {template.frames.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
