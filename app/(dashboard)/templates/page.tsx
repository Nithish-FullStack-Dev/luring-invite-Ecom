// app\(dashboard)\templates\page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  ChevronDown,
  Film,
  LoaderCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Video,
  X,
} from "lucide-react";

import { mediaUrl } from "@/lib/client-api";
import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";
import {
  templateCategoryForSlug,
  templateCategoryFilterSlugs,
} from "@/lib/template-categories";

type Category = {
  id: string | number;
  name: string;
  slug: string;
};

type Template = {
  id: number;
  title: string;
  slug?: string;
  description?: string | null;
  thumbnail?: string | null;
  previewVideo?: string | null;
  price: number;
  durationSeconds: number;
  categories: Category[];
  frames: {
    id: number;
    title?: string | null;
    previewImage?: string | null;
  }[];
};

type SortOption = "featured" | "price-low" | "price-high" | "name";

const PURPLE = "#A86DCD";

function TemplateCard({ template }: { template: Template }) {
  const category = template.categories[0];

  return (
    <article className="group/card min-w-0 overflow-hidden rounded-2xl border border-[#eee5f3] bg-white shadow-[0_4px_18px_rgba(65,36,79,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8b9e9] hover:shadow-[0_16px_36px_rgba(91,46,119,0.12)]">
      <Link
        href={`/preview/${category?.slug || "birthday"}/${template.id}`}
        aria-label={`View ${template.title}`}
        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a86dcd]"
      >
        <div className="relative overflow-hidden bg-[#f7f1fa]">
          {template.thumbnail ? (
            <img
              src={mediaUrl(template.thumbnail)}
              alt={template.title}
              loading="lazy"
              draggable={false}
              className="aspect-[4/5] w-full select-none object-cover transition-transform duration-500 group-hover/card:scale-[1.04] sm:aspect-[3/4]"
            />
          ) : (
            <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 text-[#987aa9] sm:aspect-[3/4]">
              <Sparkles size={32} strokeWidth={1.3} />
              <span className="text-sm">Invitation preview</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#25152f]/45 via-transparent to-black/[0.04]" />

          <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] truncate rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#80519b] shadow-sm sm:left-3 sm:top-3">
            {category?.name || "Invitation"}
          </span>

          {template.previewVideo && (
            <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#9259b7] shadow-sm sm:right-3 sm:top-3">
              <Film size={15} />
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center p-3 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100">
            <span className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#80519b] shadow-lg">
              View invitation
              <ArrowRight size={14} />
            </span>
          </div>
        </div>

        <div className="flex min-h-[145px] flex-col p-3.5 sm:min-h-[160px] sm:p-4">
          <h2 className="line-clamp-1 text-sm font-semibold tracking-tight text-[#302438] transition-colors group-hover/card:text-[#9059b2] sm:text-base">
            {template.title}
          </h2>

          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-[#8b8093]">
            {template.description ||
              "A beautiful invitation, ready to personalize for your special occasion."}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f0eaf4] pt-3">
            <span className="text-base font-bold text-[#925bb4] sm:text-lg">
              ₹{Number(template.price).toLocaleString("en-IN")}
            </span>

            <span className="shrink-0 text-[10px] text-[#a399ad] sm:text-xs">
              {template.frames.length}{" "}
              {template.frames.length === 1 ? "frame" : "frames"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function TemplateSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-[#eee5f3] bg-white"
    >
      <div className="aspect-[4/5] animate-pulse bg-[#f1e5f8] sm:aspect-[3/4]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#f1e5f8]" />
        <div className="h-3 w-full animate-pulse rounded bg-[#f8f2fb]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[#f8f2fb]" />
        <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-[#f1e5f8]" />
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const loadTemplates = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/templates", {
        cache: "no-store",
        signal,
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Could not load invitations.");
      }

      setTemplates(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error ? err.message : "Could not load invitations.",
      );
      setTemplates([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");

    if (requestedCategory) {
      setCategory(
        templateCategoryForSlug(requestedCategory)?.slug ?? requestedCategory,
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadTemplates(controller.signal);

    return () => controller.abort();
  }, [loadTemplates]);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, Category>();

    templates.forEach((template) => {
      template.categories?.forEach((item) => {
        if (item.slug) {
          const definition = templateCategoryForSlug(item.slug);
          const slug = definition?.slug ?? item.slug;
          if (!categoryMap.has(slug)) {
            categoryMap.set(slug, definition
              ? { ...item, name: definition.name, slug: definition.slug }
              : item);
          }
        }
      });
    });

    return Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = templates.filter((template) => {
      const matchesCategory =
        category === "all" ||
        template.categories?.some((item) =>
          templateCategoryFilterSlugs(category).includes(item.slug),
        );

      const searchableText = [
        template.title,
        template.description || "",
        ...(template.categories || []).map((item) => item.name),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!query || searchableText.includes(query));
    });

    switch (sort) {
      case "price-low":
        return filtered.sort((a, b) => Number(a.price) - Number(b.price));

      case "price-high":
        return filtered.sort((a, b) => Number(b.price) - Number(a.price));

      case "name":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));

      default:
        return filtered;
    }
  }, [templates, category, search, sort]);

  const hasActiveFilters = search.trim() !== "" || category !== "all";

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("featured");
    setMobileFiltersOpen(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen overflow-hidden bg-[#fdfbfe] text-[#302438]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#f0e5f6] bg-gradient-to-b from-[#f8effd] via-[#fdf9ff] to-[#fdfbfe]">
          <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[#e9d2f8]/60 blur-[100px]" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[#f0dffa]/60 blur-[100px]" />

          <div className="relative mx-auto max-w-[1440px] px-4 py-10 ">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#302438]  sm:text-5xl lg:text-6xl">
                Find Your Perfect
                <span className="mt-1 block font-normal italic text-[#a86dcd]">
                  Invitation Design
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-sm leading-7 text-[#8b8093]  sm:text-base">
                Explore beautiful digital invitations for life&apos;s special
                moments. Choose your favorite, personalize every detail, and
                make it unforgettable.
              </p>

              <div className="mx-auto mt-3 flex max-w-2xl items-center gap-3 rounded-2xl border border-[#eadcf3] bg-white p-2 shadow-[0_12px_35px_rgba(91,46,119,0.08)] transition-shadow focus-within:border-[#c99be4] focus-within:shadow-[0_12px_35px_rgba(91,46,119,0.13)]  sm:rounded-[20px] sm:p-2.5">
                <Search
                  size={21}
                  className="ml-2 shrink-0 text-[#a86dcd] sm:ml-3"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search wedding, birthday, baby shower..."
                  aria-label="Search invitation designs"
                  className="h-7 min-w-0 flex-1 bg-transparent text-sm text-[#302438] outline-none placeholder:text-[#b1a4ba]  sm:text-base"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[#8b8093]">
                <Check size={14} className="text-[#a86dcd]" />
                <span>Personalizable designs</span>
                <Check size={14} className="text-[#a86dcd]" />
                <span>Digital invitations</span>
                <Check size={14} className="text-[#a86dcd]" />
                <span>Made for your occasion</span>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace */}
        <section className="mx-auto max-w-[1440px] px-4 py-10">
          {/* Category filters */}
          <div
            className={`mb-3 overflow-hidden transition-all duration-300 ${
              mobileFiltersOpen
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0 sm:max-h-[500px] sm:opacity-100"
            }`}
          >
            <div className="rounded-2xl border border-[#eee2f5] bg-white p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-[#a86dcd]" />
                  <h2 className="text-sm font-semibold text-[#51415d]">
                    Browse by occasion
                  </h2>
                </div>

                {category !== "all" && (
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className="text-xs font-medium text-[#9259b7] hover:underline"
                  >
                    Clear category
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  aria-pressed={category === "all"}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    category === "all"
                      ? "border-[#a86dcd] bg-[#a86dcd] text-white shadow-[0_4px_12px_rgba(168,109,205,0.2)]"
                      : "border-[#eee2f5] bg-white text-[#786682] hover:border-[#d3b0e8] hover:bg-[#fcf8ff]"
                  }`}
                >
                  All templates
                  {category === "all" && <Check size={14} />}
                </button>

                {categories.map((item) => {
                  const active = category === item.slug;

                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => setCategory(item.slug)}
                      aria-pressed={active}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                        active
                          ? "border-[#a86dcd] bg-[#a86dcd] text-white shadow-[0_4px_12px_rgba(168,109,205,0.2)]"
                          : "border-[#eee2f5] bg-white text-[#786682] hover:border-[#d3b0e8] hover:bg-[#fcf8ff]"
                      }`}
                    >
                      {item.name}
                      {active && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results heading and sorting */}
          <div className="mb-3 flex flex-col gap-4  sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a477bf]">
                Made for your special moments
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#302438] sm:text-3xl">
                {category === "all"
                  ? "All Invitation Designs"
                  : categories.find((item) => item.slug === category)?.name ||
                    "Invitation Designs"}
              </h2>

              <p className="mt-2 text-sm text-[#94869e]" aria-live="polite">
                {loading
                  ? "Finding your perfect invitation..."
                  : `${filteredTemplates.length} ${
                      filteredTemplates.length === 1 ? "design" : "designs"
                    } available`}
                {hasActiveFilters && !loading ? " for your selection" : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="template-sort"
                className="flex shrink-0 items-center gap-2 text-xs font-medium text-[#8b8093]"
              >
                <ArrowDownUp size={15} />
                Sort by
              </label>

              <div className="relative min-w-0 flex-1 sm:flex-none">
                <select
                  id="template-sort"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-[#eadcf3] bg-white py-2 pl-3 pr-9 text-xs font-medium text-[#51415d] outline-none transition focus:border-[#a86dcd] focus:ring-2 focus:ring-[#a86dcd]/15 sm:min-w-[180px]"
                >
                  <option value="featured">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a399ad]"
                />
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6"
              aria-label="Loading invitation designs"
            >
              {Array.from({ length: 10 }, (_, index) => (
                <TemplateSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white px-6 py-10 text-center shadow-sm ">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <RotateCcw size={25} />
              </div>

              <h3 className="mt-3 text-lg font-semibold text-[#302438]">
                We couldn&apos;t load the designs
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-[#8b8093]">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadTemplates()}
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9259b7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/25"
              >
                <RotateCcw size={15} />
                Try again
              </button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            /* Empty state */
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-[#e4d6ed] bg-white px-6 py-10 text-center ">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5eafa] text-[#a86dcd]">
                <Search size={28} strokeWidth={1.5} />
              </div>

              <h3 className="mt-3 text-xl font-semibold text-[#302438]">
                No invitations found
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#8b8093]">
                We couldn&apos;t find any designs matching your search. Try a
                different keyword or explore all our invitations.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a86dcd] to-[#9254b7] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(168,109,205,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/25"
              >
                <RotateCcw size={15} />
                Explore all designs
              </button>
            </div>
          ) : (
            /* Complete template collection */
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>

              <div className="mt-3 rounded-3xl border border-[#eadcf3] bg-gradient-to-r from-[#faf3ff] via-white to-[#f8effd] p-3 text-center ">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#a86dcd] shadow-sm ring-1 ring-[#eadcf3]">
                  <Video size={23} />
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#302438] sm:text-2xl">
                  Have a special design in mind?
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#8b8093]">
                  Need something unique? Contact us to discuss custom invitation
                  designs for your special occasion.
                </p>

                <a
                  href={`https://wa.me/919121080131?text=${encodeURIComponent(
                    "Hi, I would like a custom digital invitation design. Please share the available options.",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a86dcd] to-[#9254b7] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(168,109,205,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(168,109,205,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/30"
                >
                  Request Custom Design
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>
              </div>

              <div className="mt-3 text-center">
                <Link
                  href="/"
                  className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#9259b7] transition-colors hover:text-[#754293]"
                >
                  <ArrowRight size={15} className="rotate-180" />
                  Back to homepage
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
