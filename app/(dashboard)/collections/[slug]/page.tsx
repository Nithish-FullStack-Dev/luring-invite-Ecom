"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

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
  language: [],
  religion: [],
  region: [],
  subOccasion: "",
  sortBy: "best-selling",
};

export default function CollectionDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const collection = getCollectionBySlug(slug);
  const allProducts = getProductsByCollection(slug);

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
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

            <Link href="/collections">
              <Button variant="outline">Back to Collections</Button>
            </Link>
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
          <Link
            href="/collections"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary md:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>

          <CollectionFilters
            onFilterChange={setFilters}
            currentFilters={filters}
            collectionSlug={slug}
          />

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
