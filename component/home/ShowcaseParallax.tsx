import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const showcaseItems = [
  {
    title: 'AI Video Invitations',
    description: 'Cutting-edge 3D animations powered by artificial intelligence',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    link: '/collections/3d-ai-video',
  },
  {
    title: 'Royal Wedding Suites',
    description: 'Traditional elegance meets modern design',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
    link: '/collections/wedding-invites',
  },
  {
    title: 'Custom Caricatures',
    description: 'Fun, personalized illustrations of you and your partner',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    link: '/collections/caricature',
  },
];

export default function ShowcaseParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [150, -150]);

  const yValues = [y1, y2, y3];

  return (
    <section ref={containerRef} className="section-padding bg-foreground overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-background mb-4">
            Crafted with Passion
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each invitation is a work of art, designed to capture the essence of your special day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.title}
              style={{ y: yValues[index] }}
              className={index === 1 ? 'md:mt-16' : ''}
            >
              <Link to={item.link} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-heading text-xl md:text-2xl text-background mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-colors duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
