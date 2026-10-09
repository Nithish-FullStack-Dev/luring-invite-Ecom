import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { collections } from "@/data/products";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useScreenSize } from "@/hooks/use-screen-size";

export default function CategoriesCarousel() {
  const screenSize = useScreenSize();

  // ✅ Autoplay
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 3500,
        stopOnInteraction: false, // keeps autoplay even after clicks/drags
        stopOnMouseEnter: false,   // pause on hover
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [autoplay]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateNavState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    autoplay.reset();
  }, [emblaApi, autoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    autoplay.reset();
  }, [emblaApi, autoplay]);

  useEffect(() => {
    if (!emblaApi) return;

    updateNavState();
    emblaApi.on("select", updateNavState);
    emblaApi.on("reInit", updateNavState);

    return () => {
      emblaApi.off("select", updateNavState);
      emblaApi.off("reInit", updateNavState);
    };
  }, [emblaApi, updateNavState]);

  return (
    <section 
    className="section-padding relative overflow-hidden bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/images/luringbg1.webp')",
  }}>
     

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-10">
            Browse All <span className="text-primary">Collections</span>
          </h2>

          <div
            className="relative"
            onMouseLeave={() => autoplay.play()} // helps resume after hover
          >
            {/* Prev */}
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous collections"
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10
                rounded-full p-2 backdrop-blur bg-background/70 shadow
                transition-opacity hover:bg-background/90
                ${!canScrollPrev ? "opacity-40 cursor-not-allowed" : "opacity-100"}
              `}
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next collections"
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10
                rounded-full p-2 backdrop-blur bg-background/70 shadow
                transition-opacity hover:bg-background/90
                ${!canScrollNext ? "opacity-40 cursor-not-allowed" : "opacity-100"}
              `}
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>

            {/* Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex-none w-[280px] md:w-[320px]"
                  >
                    <Link
                      to={`/collections/${collection.slug}`}
                      className="group block"
                    >
                      <div className="relative h-48 rounded-xl overflow-hidden mb-4 card-luxury">
                        <img
                          src={collection.thumbnail}
                          alt={collection.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-background text-sm font-medium">
                            {collection.productCount} templates
                          </span>
                          <ArrowRight className="w-5 h-5 text-background" />
                        </div>
                      </div>

                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {collection.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collection.description}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
