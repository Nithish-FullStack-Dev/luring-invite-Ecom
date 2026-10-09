import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Flame,
  ArrowRight,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import {
  getBestSellers,
  type Product,
  type VideoPlatform,
} from "@/data/products";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";

/* -------------------------------- types -------------------------------- */

type ReelJsonItem = {
  productSlug: string;
  url: string;
  thumbnail?: string;
  platform?: VideoPlatform;
};

type SlideItem = Product & {
  video?: {
    url: string;
    platform?: VideoPlatform;
    thumbnail?: string;
  };
};

/* -------------------------------- helpers -------------------------------- */

function isLocalVideoUrl(url: string): boolean {
  const lower = url.toLowerCase().split("?")[0].split("#")[0];
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.startsWith("/videos/") ||
    lower.startsWith("videos/")
  );
}

function inferPlatform(url: string, declared?: VideoPlatform): VideoPlatform {
  if (isLocalVideoUrl(url)) return "local";
  try {
    const u = new URL(url, window.location.origin);
    const host = u.hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be"))
      return "youtube";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("pinterest.") || host.includes("pin.it"))
      return "pinterest";
  } catch {
    // ignore
  }
  return declared ?? "local";
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url, window.location.origin);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    const v = u.searchParams.get("v");
    if (v) return v;

    const parts = u.pathname.split("/").filter(Boolean);
    const shortsIndex = parts.indexOf("shorts");
    if (shortsIndex >= 0 && parts[shortsIndex + 1])
      return parts[shortsIndex + 1];

    return null;
  } catch {
    return null;
  }
}

function getEmbedSrc(platform: VideoPlatform, url: string) {
  if (platform === "youtube") {
    const id = getYouTubeId(url);
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
  }
  return null;
}

function normalizeInstagramUrl(url: string) {
  try {
    const u = new URL(url, window.location.origin);
    u.protocol = "https:";
    if (!u.pathname.endsWith("/")) u.pathname += "/";
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

function useInstagramEmbed(url: string | null) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url) return;

    const w = window as unknown as { instgrm?: any };

    const process = () => {
      try {
        w.instgrm?.Embeds?.process?.();
        setReady(true);
      } catch {
        setReady(false);
      }
    };

    if (w.instgrm?.Embeds?.process) {
      process();
      return;
    }

    const existing = document.querySelector(
      'script[data-instgrm-embed="true"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", process, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = "https://www.instagram.com/embed.js";
    script.setAttribute("data-instgrm-embed", "true");
    script.onload = process;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [url]);

  useEffect(() => {
    if (!url) return;
    const w = window as unknown as { instgrm?: any };
    const t = window.setTimeout(() => {
      try {
        w.instgrm?.Embeds?.process?.();
        setReady(true);
      } catch {
        setReady(false);
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [url]);

  return ready;
}

/* ------------------------------ main component ------------------------------ */

export default function BestSellersCarousel() {
  const bestSellers = useMemo(() => getBestSellers(), []);
  const [reelsMap, setReelsMap] = useState<Record<string, ReelJsonItem>>({});
  const [selected, setSelected] = useState<SlideItem | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Load /reels.json (static)
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/reels.json", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ReelJsonItem[];
        if (!alive) return;

        const map: Record<string, ReelJsonItem> = {};
        for (const item of data) {
          if (item?.productSlug) map[item.productSlug] = item;
        }
        setReelsMap(map);
      } catch {
        // ignore if file missing
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const slides: SlideItem[] = useMemo(() => {
    return bestSellers.map((p) => {
      const reel = reelsMap[p.slug];
      if (!reel) return p;

      return {
        ...p,
        video: {
          url: reel.url,
          platform: reel.platform ?? inferPlatform(reel.url),
          thumbnail: reel.thumbnail,
        },
      };
    });
  }, [bestSellers, reelsMap]);

  // Lock body scroll on modal
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const handleWhatsAppEnquiry = (product: Product) => {
    const url = `${window.location.origin}/product/${product.slug}`;
    const msg = encodeURIComponent(
      `Hi! I'm interested in:\n\n📌 ${product.title}\n💰 From ₹${product.priceFrom}\n🔗 ${url}`,
    );
    window.open(
      `https://api.whatsapp.com/send?phone=919121080131&text=${msg}`,
      "_blank",
    );
  };

  return (
    <AuroraBackground
      className="h-auto min-h-0 w-full items-stretch justify-start py-0 overflow-x-hidden"
      showRadialGradient
    >
      <section className="section-padding w-full relative z-10 overflow-x-hidden">
        <div className="container-custom overflow-x-hidden">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mb-10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Trending Now
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading text-foreground font-bold">
                Instagram Feed
              </h2>
            </div>

            <div className="mt-4 flex justify-center md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
              <Button asChild variant="ctaOutline" className="group">
                <Link to="/collections">
                  View All{" "}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="relative w-full">
            {/* Prev */}
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous"
              className="
                absolute z-30
                left-3 md:left-0
                top-1/2 -translate-y-1/2
                w-11 h-11
                rounded-full
                bg-background/90 border border-border shadow-md
                hover:bg-muted
                flex items-center justify-center
                md:-translate-x-1/2
              "
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next"
              className="
                absolute z-30
                right-3 md:right-0
                top-1/2 -translate-y-1/2
                w-11 h-11
                rounded-full
                bg-background/90 border border-border shadow-md
                hover:bg-muted
                flex items-center justify-center
                md:translate-x-1/2
              "
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="px-4 sm:px-6 md:px-0">
              <div ref={emblaRef} className="overflow-hidden w-full">
                <div className="flex gap-4 md:gap-6 items-stretch">
                  {slides.map((product, index) => {
                    const hasVideo = Boolean(product.video?.url);
                    const videoUrl = product.video?.url ?? "";
                    const platform = hasVideo
                      ? inferPlatform(videoUrl, product.video?.platform)
                      : null;

                    const cardThumb =
                      product.video?.thumbnail || product.thumbnail;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: index * 0.03 }}
                        className="
                          flex-shrink-0
                          basis-[86%]
                          sm:basis-[52%]
                          md:basis-[33.333%]
                          lg:basis-[25%]
                        "
                      >
                        <div className="w-full h-full rounded-2xl border border-border bg-background shadow-sm overflow-hidden flex flex-col">
                          <div className="relative aspect-[9/16] bg-muted">
                            <Link
                              to={`/product/${product.slug}`}
                              className="block w-full h-full"
                            >
                              <img
                                src={cardThumb}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                draggable={false}
                              />
                            </Link>

                            {hasVideo && (
                              <button
                                type="button"
                                onClick={() => setSelected(product)}
                                className="absolute inset-0 z-10 flex items-center justify-center"
                                aria-label="Play"
                              >
                                <span className="bg-white/85 w-14 h-14 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                  <Play className="w-6 h-6" />
                                </span>

                                {platform && platform !== "local" && (
                                  <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/90 border border-border">
                                    {platform.toUpperCase()}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* MODAL */}
          <AnimatePresence>
            {selected && (
              <BestSellerVideoModal
                selected={selected}
                onClose={() => setSelected(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </section>
    </AuroraBackground>
  );
}

/* -------------------------------- modal -------------------------------- */

function BestSellerVideoModal({
  selected,
  onClose,
}: {
  selected: SlideItem;
  onClose: () => void;
}) {
  const videoUrl = selected.video?.url ?? "";
  const platform = inferPlatform(videoUrl, selected.video?.platform);
  const normalizedInstaUrl =
    platform === "instagram" ? normalizeInstagramUrl(videoUrl) : videoUrl;

  const embedSrc =
    platform === "local" ? null : getEmbedSrc(platform, normalizedInstaUrl);
  const instaReady = useInstagramEmbed(
    platform === "instagram" ? normalizedInstaUrl : null,
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className="
          relative z-10 w-full sm:max-w-[460px]
          bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden
          border border-border shadow-xl flex flex-col
        "
        style={{ maxHeight: "calc(100vh - 16px)" }}
        initial={{ y: 16, scale: 0.99, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, scale: 0.99, opacity: 0 }}
        transition={{ duration: 0.18 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between p-4 border-b border-border">
          <h4 className="font-semibold truncate pr-3">{selected.title}</h4>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-black flex-1 min-h-[55vh] sm:min-h-[420px]">
          {platform === "local" ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
          ) : platform === "instagram" ? (
            <div className="w-full h-full bg-white overflow-auto">
              <div className="p-2">
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={normalizedInstaUrl}
                  data-instgrm-version="14"
                  style={{ margin: 0, width: "100%" }}
                />
                {!instaReady && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Loading Instagram preview...
                  </div>
                )}
                <div className="text-center text-xs text-muted-foreground pb-3">
                  If it doesn’t load,{" "}
                  <a
                    className="underline"
                    href={normalizedInstaUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    open on Instagram
                  </a>
                  .
                </div>
              </div>
            </div>
          ) : embedSrc ? (
            <iframe
              src={embedSrc}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white p-6 text-center">
              <div>
                <p className="mb-3">Preview not available for this link.</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Open video
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex gap-2">
          <Button asChild className="flex-1" variant="hero">
            <Link to={`/product/${selected.slug}`}>View</Link>
          </Button>

          <Button
            variant="whatsapp"
            className="flex-1"
            onClick={() =>
              window.open(
                `https://api.whatsapp.com/send?phone=919121080131`,
                "_blank",
              )
            }
          >
            WhatsApp
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
