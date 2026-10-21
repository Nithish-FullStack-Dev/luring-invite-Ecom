"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { Link } from "react-router-dom";
import {
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
// import useEmblaCarousel from "embla-carousel-react";
// import type { EmblaOptionsType } from "embla-carousel";

import { getTrendingVideosWithProducts } from "@/data/products";
// import { Button } from "@/components/ui/button";
// import { AuroraBackground } from "@/components/ui/aurora-background";
// import VideoPreview, { VideoPlatform } from "@/components/shared/VideoPreview";
import Link from "next/link";
import AuroraBackground from "../ui/aurora-background";
import { Button } from "../ui/button";
import VideoPreview, { VideoPlatform } from "../shared/VideoPreview";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";

type TrendingItem = ReturnType<typeof getTrendingVideosWithProducts>[number];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);

    const onChange = () => setMatches(mql.matches);
    onChange();

    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

export default function TrendingVideo() {
  const items = useMemo(() => getTrendingVideosWithProducts(), []);
  const [selected, setSelected] = useState<TrendingItem | null>(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const emblaOptions = useMemo<EmblaOptionsType>(
    () => ({
      loop: true,
      align: isDesktop ? "start" : "center",
      slidesToScroll: 1,
      dragFree: false,
      containScroll: false,
    }),
    [isDesktop],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!selected) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selected]);

  const handleWhatsAppEnquiry = (product: TrendingItem["product"]) => {
    const currentUrl = window.location.origin + `/product/${product.slug}`;

    const message = encodeURIComponent(
      `Hi! I'm interested in this product:\n\n` +
        `📌 Product: ${product.title}\n` +
        `💰 Price: Starting at ₹${product.priceFrom}\n` +
        `🔗 Link: ${currentUrl}\n\n` +
        `Please share more details.`,
    );

    window.open(
      `https://api.whatsapp.com/send?phone=919121080131&text=${message}`,
      "_blank",
    );
  };

  return (
    <AuroraBackground
      className="h-auto min-h-0 w-full items-stretch justify-start py-0"
      showRadialGradient
    >
      <section className="section-padding w-full relative z-10">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mb-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Trending Now
                </span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl text-foreground font-bold">
                Trending Videos
              </h2>
            </div>

            <div className="mt-4 flex justify-center md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
              <Button asChild variant="default" className="group">
                <Link href="/collections">
                  View All
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Carousel */}
          <div className="relative">
            <button
              type="button"
              onClick={scrollPrev}
              className="
                flex items-center justify-center
                absolute left-2 sm:left-0 top-1/2 -translate-y-1/2
                z-10
                w-10 h-10 sm:w-11 sm:h-11
                rounded-full
                bg-background/90 border border-border shadow-md
                hover:bg-muted
                sm:-translate-x-1/2
              "
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={scrollNext}
              className="
                flex items-center justify-center
                absolute right-2 sm:right-0 top-1/2 -translate-y-1/2
                z-10
                w-10 h-10 sm:w-11 sm:h-11
                rounded-full
                bg-background/90 border border-border shadow-md
                hover:bg-muted
                sm:translate-x-1/2
              "
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div ref={emblaRef} className="overflow-hidden w-full">
              <div className="flex gap-4 px-4 md:px-0 items-stretch">
                {items.map((item, index) => {
                  const resolvedPlatform =
                    (item.platform as VideoPlatform) || "local";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.03 }}
                      className="
                        flex-shrink-0
                        basis-[88%]
                        sm:basis-[52%]
                        md:basis-[33.333%]
                        lg:basis-[25%]
                      "
                    >
                      <div className="w-full h-full rounded-2xl border border-border bg-background shadow-sm overflow-hidden flex flex-col">
                        <div className="relative aspect-[9/16] bg-muted overflow-hidden">
                          {/* ✅ Auto preview from platform */}
                          <div className="absolute inset-0 pointer-events-none">
                            <VideoPreview
                              url={item.url}
                              platform={resolvedPlatform}
                              thumbnail={item.thumbnail}
                              title={item.product.title}
                              mode="card"
                              interactive={false}
                              className="w-full h-full"
                              mediaClassName="w-full h-full object-cover"
                            />
                          </div>

                          <div className="absolute top-3 right-3 flex gap-2 z-10">
                            {item.product.bestSeller && (
                              <span className="bg-primary text-primary-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                Best Seller
                              </span>
                            )}
                            {item.product.isNew && (
                              <span className="bg-foreground text-background text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                New
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            className="absolute inset-0 flex items-center justify-center z-10"
                            aria-label="Play video"
                          >
                            <span className="w-14 h-14 rounded-full bg-background/85 border border-border flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                              <Play className="w-6 h-6" />
                            </span>
                          </button>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {item.product.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h3 className="font-semibold text-foreground leading-snug line-clamp-1">
                            {item.product.title}
                          </h3>

                          <div className="mt-4 flex gap-2">
                            <Button
                              asChild
                              variant="default"
                              size="default"
                              className="w-full flex-1"
                            >
                              <Link href={`/product/${item.product.slug}`}>
                                View
                              </Link>
                            </Button>

                            <Button
                              type="button"
                              variant="default"
                              size="default"
                              className="flex-1"
                              onClick={() =>
                                handleWhatsAppEnquiry(item.product)
                              }
                            >
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <TrendingModal
              selected={selected}
              onClose={() => setSelected(null)}
              onWhatsApp={handleWhatsAppEnquiry}
            />
          )}
        </AnimatePresence>
      </section>
    </AuroraBackground>
  );
}

/** Modal */
function TrendingModal({
  selected,
  onClose,
  onWhatsApp,
}: {
  selected: TrendingItem;
  onClose: () => void;
  onWhatsApp: (p: TrendingItem["product"]) => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className="
          relative z-10 w-full
          sm:max-w-[460px]
          bg-background
          rounded-t-2xl sm:rounded-2xl
          overflow-hidden border border-border shadow-xl
          flex flex-col
        "
        style={{ height: "80vh" }}
        initial={{ y: 16, scale: 0.99, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, scale: 0.99, opacity: 0 }}
        transition={{ duration: 0.18 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Preview</p>
            <p className="font-semibold truncate">{selected.product.title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-black">
          <VideoPreview
            url={selected.url}
            platform={selected.platform as VideoPlatform}
            thumbnail={selected.thumbnail}
            title={selected.product.title}
            mode="modal"
            interactive={true}
            className="w-full h-full"
            mediaClassName="w-full h-full"
          />
        </div>

        <div className="relative z-10 shrink-0 px-4 py-3 border-t border-border bg-background">
          <div className="flex gap-2">
            <Button asChild variant="default" className="w-full flex-1">
              <Link href={`/product/${selected.product.slug}`}>View</Link>
            </Button>

            <Button
              type="button"
              variant="default"
              className="flex-1"
              onClick={() => onWhatsApp(selected.product)}
            >
              WhatsApp
            </Button>
          </div>

          <div className="mt-2 text-[11px] text-muted-foreground">
            If preview doesn’t load, open:
            <a
              href={selected.url}
              target="_blank"
              rel="noreferrer"
              className="underline ml-1"
            >
              Link
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
