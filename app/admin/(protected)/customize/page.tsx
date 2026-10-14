"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { mediaUrl } from "@/lib/client-api";
import { Button } from "@/component/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/component/ui/dialog";

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

export default function page() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/customize`, {
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

  const handleDelete = async () => {
    if (selectedTemplateId === null) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/templates/${selectedTemplateId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Unable to delete template.");
      }

      setTemplates((current) =>
        current.filter((template) => template.id !== selectedTemplateId),
      );

      setDeleteOpen(false);
      setSelectedTemplateId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete template.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section id="templates" className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button>
          <Link href="/admin/add-customize">Add New Template</Link>
        </Button>
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
          No templates found. Run <code>npm run db:seed</code> to add the sample
          templates.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <article
              key={template.id}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/admin/customize/${template.id}`} className="block">
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
              <div className="border-t border-gray-100 p-4 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/customize/${template.id}/edit`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#975dbb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8048a3]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            Confirm deletion of this template. This action cannot be undone.
          </DialogHeader>
          <div>
            <Button
              variant="destructive"
              className="mr-2"
              onClick={handleDelete}
              disabled={deleting}
            >
              Delete
            </Button>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
