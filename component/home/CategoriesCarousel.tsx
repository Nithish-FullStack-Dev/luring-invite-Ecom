import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { categories, collections } from "@/data/products";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
// import { PixelTrail } from "@/components/ui/MouseButterflyTrail";
import { useScreenSize } from "@/hooks/use-screen-size";

export default function CategoriesCarousel() {
  const screenSize = useScreenSize();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const updateNavState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList().map((_, i) => i));
    updateNavState();

    emblaApi.on("select", updateNavState);
    emblaApi.on("reInit", () => {
      setScrollSnaps(emblaApi.scrollSnapList().map((_, i) => i));
      updateNavState();
    });
  }, [emblaApi, updateNavState]);

  return (
    <section
      className="section-padding relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/luringbg1.webp')",
      }}
    >
      {/* <PixelTrail
        pixelSize={screenSize.lessThan("md") ? 40 : 64}
        fadeDuration={600}
        delay={1200}
        className="z-0"
      /> */}

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Explore Our <span className="text-primary">Collections</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From AI-powered video invitations to elegant digital designs, find
            the perfect invitation for your special occasion.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Link
                to={`/collections?category=${category.slug}`}
                className="group block relative h-64 md:h-80 rounded-2xl overflow-hidden card-luxury"
              >
                <img
                  src={category.thumbnail}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <h3 className="font-heading text-2xl md:text-3xl text-background mb-2">
                    {category.title}
                  </h3>
                  <p className="text-background/80 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>View Collection</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
