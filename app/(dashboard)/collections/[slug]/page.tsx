//app\(dashboard)\collections\[slug]\page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock3, Film, Play, Sparkles } from "lucide-react";

import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";
import PageHero from "@/component/shared/PageHero";
import CollectionFilters, {
  type FilterState,
} from "@/component/shared/CollectionFilters";
import VideoPreview, {
  type VideoPlatform,
} from "@/component/shared/VideoPreview";
import { Button } from "@/component/ui/button";
import { getCollectionBySlug, getProductsByCollection } from "@/data/products";

const initialFilters: FilterState = {
  style: [],
  deliveryTime: [],
  budget: "",
  minPrice: "",
  maxPrice: "",
  language: [],
  religion: [],
  region: [],
  subOccasion: "",
  sortBy: "best-selling",
};
interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface InvitationTemplate {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  active: boolean;
  price: number;
  durationSeconds: number;
  categories: TemplateCategory[];
}

interface TemplatesApiResponse {
  status: string;
  data: InvitationTemplate[];
}
function getTemplateImageUrl(thumbnail: string | null): string {
  if (!thumbnail) return "";

  const path = thumbnail.replace(/^\/+/, "");

  if (path.startsWith("media/")) {
    return `/${path}`;
  }

  if (path.startsWith("uploads/")) {
    return `/media/${path}`;
  }

  return `/${path}`;
}
export default function CollectionDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const collection = getCollectionBySlug(slug);
  const allProducts = getProductsByCollection(slug);

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState("");

  const loadTemplates = useCallback(async (signal: AbortSignal) => {
    try {
      setTemplatesLoading(true);
      setTemplatesError("");

      const response = await fetch("/api/templates", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error("Unable to load invitation templates.");
      }

      const result: TemplatesApiResponse = await response.json();

      if (result.status !== "success" || !Array.isArray(result.data)) {
        throw new Error("Invalid templates API response.");
      }

      setTemplates(result.data.filter((template) => template.active));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setTemplatesError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading templates.",
      );
    } finally {
      if (!signal.aborted) {
        setTemplatesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadTemplates(controller.signal);

    return () => controller.abort();
  }, [loadTemplates]);

  const categorySlug = useMemo(() => {
    const normalizedSlug = slug.toLowerCase();

    const categoryAliases: Record<string, string> = {
      "wedding-invites": "wedding",
      "wedding-invitations": "wedding",
      "birthday-invites": "birthday",
      "birthday-invitations": "birthday",
      "anniversary-invites": "anniversary",
      "anniversary-invitations": "anniversary",
      "baby-shower": "birthday",
    };

    return categoryAliases[normalizedSlug] ?? normalizedSlug;
  }, [slug]);

  const categoryTemplates = useMemo(() => {
    return templates.filter((template) =>
      template.categories.some(
        (category) => category.slug.toLowerCase() === categorySlug,
      ),
    );
  }, [templates, categorySlug]);

  const filteredTemplates = useMemo(() => {
    const minPrice =
      filters.minPrice.trim() !== "" ? Number(filters.minPrice) : null;

    const maxPrice =
      filters.maxPrice.trim() !== "" ? Number(filters.maxPrice) : null;

    let result = [...categoryTemplates];

    if (minPrice !== null && Number.isFinite(minPrice)) {
      result = result.filter((item) => item.price >= minPrice);
    }

    if (maxPrice !== null && Number.isFinite(maxPrice)) {
      result = result.filter((item) => item.price <= maxPrice);
    }

    // Budget
    if (filters.budget === "under-1000") {
      result = result.filter((item) => item.price < 1000);
    } else if (filters.budget === "1000-3000") {
      result = result.filter(
        (item) => item.price >= 1000 && item.price <= 3000,
      );
    } else if (filters.budget === "above-3000") {
      result = result.filter((item) => item.price > 3000);
    }

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        result.sort((a, b) => a.id - b.id);
        break;
    }

    return result;
  }, [categoryTemplates, filters]);

  const filteredProducts = useMemo(() => {
    const minPrice =
      filters.minPrice.trim() !== "" ? Number(filters.minPrice) : null;

    const maxPrice =
      filters.maxPrice.trim() !== "" ? Number(filters.maxPrice) : null;

    let result = allProducts.filter((product) => {
      if (
        minPrice !== null &&
        Number.isFinite(minPrice) &&
        product.priceFrom < minPrice
      ) {
        return false;
      }

      if (
        maxPrice !== null &&
        Number.isFinite(maxPrice) &&
        product.priceFrom > maxPrice
      ) {
        return false;
      }

      if (
        filters.style.length &&
        !filters.style.some((style) =>
          product.styles.includes(style as (typeof product.styles)[number]),
        )
      ) {
        return false;
      }

      if (
        filters.language.length &&
        !filters.language.some((language) =>
          product.languages.includes(
            language as (typeof product.languages)[number],
          ),
        )
      ) {
        return false;
      }

      if (
        filters.religion.length &&
        !filters.religion.some((religion) =>
          product.religion?.includes(
            religion as NonNullable<typeof product.religion>[number],
          ),
        )
      ) {
        return false;
      }

      if (
        filters.region.length &&
        !filters.region.some((region) =>
          product.region?.includes(
            region as NonNullable<typeof product.region>[number],
          ),
        )
      ) {
        return false;
      }

      if (
        filters.subOccasion &&
        !product.subOccasion?.includes(filters.subOccasion)
      ) {
        return false;
      }

      if (filters.budget === "under-1000" && product.priceFrom >= 1000) {
        return false;
      }

      if (
        filters.budget === "1000-3000" &&
        (product.priceFrom < 1000 || product.priceFrom > 3000)
      ) {
        return false;
      }

      if (filters.budget === "above-3000" && product.priceFrom <= 3000) {
        return false;
      }

      if (
        filters.deliveryTime.length &&
        !filters.deliveryTime.includes(product.deliveryTime)
      ) {
        return false;
      }

      return true;
    });

    result = [...result];

    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;

      case "price-low":
        result.sort((a, b) => a.priceFrom - b.priceFrom);
        break;

      case "price-high":
        result.sort((a, b) => b.priceFrom - a.priceFrom);
        break;

      case "best-selling":
      default:
        result.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
        break;
    }

    return result;
  }, [allProducts, filters]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="section-padding">
          <div className="container-custom px-4 text-center">
            <h1 className="mb-4 font-heading text-3xl">Collection not found</h1>
          </div>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <PageHero
          title={collection.title}
          subtitle={collection.description}
          backgroundImage={collection.thumbnail}
        />

        <div className="container-custom px-4 py-5">
          <CollectionFilters
            onFilterChange={setFilters}
            currentFilters={filters}
            collectionSlug={slug}
          />
          <section className=" mb-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#A86DCD]">
                  <Sparkles size={17} />
                  Video Invitations
                </div>

                <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                  {collection.title} Templates
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Personalize a design and create an invitation for your special
                  occasion.
                </p>
              </div>

              {!templatesLoading && (
                <span className="rounded-full bg-[#A86DCD]/10 px-3 py-1.5 text-sm font-medium text-[#9254B7]">
                  {filteredTemplates.length} templates
                </span>
              )}
            </div>

            {templatesLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-xl border border-border"
                  >
                    <div className="aspect-[4/5] bg-muted" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : templatesError ? (
              <div className="rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {templatesError}
                </p>

                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    const controller = new AbortController();
                    void loadTemplates(controller.signal);
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.2) }}
                  >
                    <Link
                      href={`/preview/${categorySlug}/${template.id}`}
                      className="group card-luxury block overflow-hidden rounded-xl"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        {template.thumbnail ? (
                          <img
                            src={getTemplateImageUrl(template.thumbnail)}
                            alt={template.title}
                            loading={index < 4 ? "eager" : "lazy"}
                            onError={(event) => {
                              const image = event.currentTarget;

                              // Retry the original uploads path if the media path fails.
                              if (
                                image.dataset.fallbackAttempted !== "true" &&
                                template.thumbnail?.startsWith("uploads/")
                              ) {
                                image.dataset.fallbackAttempted = "true";
                                image.src = `/${template.thumbnail}`;
                                return;
                              }

                              image.style.display = "none";
                            }}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Film size={36} />
                            <span className="text-sm">Preview unavailable</span>
                          </div>
                        )}

                        <div className="absolute left-2 top-2 rounded-full border border-white/70 bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9254B7] shadow-sm">
                          {template.categories.find(
                            (category) =>
                              category.slug.toLowerCase() === categorySlug,
                          )?.name ?? collection.title}
                        </div>

                        <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#A86DCD] text-white shadow-lg transition-transform group-hover:scale-110">
                          <Play size={17} fill="currentColor" />
                        </div>
                      </div>

                      <div className="p-3 md:p-4">
                        <h3 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-[#A86DCD] md:text-base">
                          {template.title}
                        </h3>

                        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock3 size={14} />
                            {template.durationSeconds} sec
                          </span>

                          <span className="font-semibold text-[#9254B7]">
                            {template.price === 0
                              ? "Free"
                              : `₹${template.price.toLocaleString("en-IN")}`}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                <Film size={30} className="mx-auto text-[#A86DCD]" />

                <h3 className="mt-3 font-semibold text-foreground">
                  No video templates yet
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  New {collection.title.toLowerCase()} templates will appear
                  here when available.
                </p>
              </div>
            )}
          </section>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="group card-luxury block overflow-hidden rounded-xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {product.video?.url ? (
                      <div className="pointer-events-none absolute inset-0">
                        <VideoPreview
                          url={product.video.url}
                          platform={product.video.platform as VideoPlatform}
                          thumbnail={product.video.thumbnail}
                          title={product.title}
                          mode="card"
                          interactive={false}
                          className="h-full w-full"
                          mediaClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}

                    <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
                      {product.bestSeller && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          Best Seller
                        </span>
                      )}

                      {product.isNew && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 md:p-4">
                    <h2 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary md:text-base">
                      {product.title}
                    </h2>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">
                No templates match your filters.
              </p>

              <Button
                variant="outline"
                onClick={() => setFilters({ ...initialFilters })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
