// component\home\Customized.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Sparkles, Video } from "lucide-react";
import { mediaUrl } from "@/lib/client-api";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Template = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  price: number;
  durationSeconds: number;
  categories: Category[];
  frames: {
    id: number;
    previewImage?: string | null;
  }[];
};

const categoryOptions = [
  { label: "All Templates", value: "all" },
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "First Birthday", value: "first-birthday" },
];

function TemplateCard({ template }: { template: Template }) {
  return (
    <article className="group/card min-w-0 overflow-hidden rounded-2xl border border-[#eee5f3] bg-white shadow-[0_4px_18px_rgba(65,36,79,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8b9e9] hover:shadow-[0_14px_32px_rgba(91,46,119,0.13)]">
      <Link
        href={`/preview/${template.categories[0]?.slug || "birthday"}/${template.id}`}
        className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a86dcd]"
        aria-label={`Preview ${template.title}`}
      >
        <div className="relative overflow-hidden bg-[#f7f1fa]">
          {template.thumbnail ? (
            <img
              src={mediaUrl(template.thumbnail)}
              alt={template.title}
              loading="lazy"
              draggable={false}
              className="aspect-[9/12] w-full select-none object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
            />
          ) : (
            <div className="flex aspect-[9/12] flex-col items-center justify-center gap-3 text-[#987aa9]">
              <Sparkles size={28} strokeWidth={1.3} />
              <span className="text-sm">Invitation preview</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5 opacity-60 transition-opacity duration-300 group-hover/card:opacity-100" />

          <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] truncate rounded-full border border-white/60 bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#80519b] shadow-sm sm:left-3 sm:top-3 sm:px-3">
            {template.categories[0]?.name || "Invitation"}
          </span>

          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-[#80519b] opacity-0 shadow-lg transition-opacity duration-300 group-hover/card:opacity-100 sm:bottom-3 sm:right-3">
            <Video size={13} />
            Preview
            <ArrowRight size={12} />
          </span>
        </div>

        <div className="flex min-h-[128px] flex-col p-3 sm:p-4">
          <h3 className="line-clamp-1 text-2xl font-semibold tracking-tight text-[#302438] transition-colors group-hover/card:text-[#9059b2] ">
            {template.title}
          </h3>

          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-[#8b8093]">
            {template.description ||
              "A beautiful invitation, ready to personalize for your special occasion."}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f0eaf4] pt-3">
            <span className="text-lg font-bold text-[#925bb4] ">
              ₹{Number(template.price).toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-[#a399ad]">
              {String(template.durationSeconds % 60).padStart(2, "0")} secs
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function Customized() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTemplates = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (category !== "all") params.set("category", category);
        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(`/api/templates?${params.toString()}`, {
          cache: "no-store",
          signal,
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || "Could not load templates.");
        }

        setTemplates(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Could not load templates.",
        );
        setTemplates([]);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [category, search],
  );

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
    const controller = new AbortController();
    void loadTemplates(controller.signal);
    return () => controller.abort();
  }, [loadTemplates]);

  // Show no more than ten cards: five columns and two rows on desktop.
  const visibleTemplates = templates.slice(0, 10);

  return (
    <section
      id="templates"
      className="relative w-full overflow-hidden bg-white py-10"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#f4eafa]/60 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-[#f8effb]/70 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-3 max-w-3xl text-center ">
          <h2 className="text-3xl font-semibold tracking-tight text-[#302438] sm:text-4xl lg:text-5xl">
            Choose Your{" "}
            <span className="font-normal italic text-[#a86dcd]">Template</span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8b8093] sm:text-base sm:leading-7">
            Discover beautiful invitations, find your perfect design, and make
            every celebration unforgettable.
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-[#8b8093]">
            <LoaderCircle size={22} className="animate-spin text-[#a86dcd]" />
            Finding your perfect invitation...
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-red-50 p-3 text-center">
            <p className="break-words text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadTemplates()}
              className="mt-3 rounded-xl bg-[#a86dcd] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9259b7]"
            >
              Try again
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#e4d6ed] bg-[#fcf9fe] px-6 py-12 text-center">
            <Sparkles
              size={30}
              strokeWidth={1.4}
              className="mx-auto text-[#a86dcd]"
            />
            <h3 className="mt-4 text-lg font-semibold text-[#302438]">
              No invitations found
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#8b8093]">
              Try another search or select a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="mt-3 rounded-xl border border-[#d9c4e8] bg-white px-5 py-2.5 text-sm font-medium text-[#9059b2] transition-colors hover:bg-[#f8f0fc]"
            >
              Explore all templates
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 lg:gap-6">
              {visibleTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>

            <div className="mt-3 text-center ">
              <Link
                href="/templates"
                className="group  inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a86dcd] to-[#9254b7] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(168,109,205,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(168,109,205,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/30"
              >
                Explore More Designs
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
