import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 3, suffix: "+", label: "Years Experience" },
  { value: 5000, suffix: "+", label: "Design Templates" },
  { value: 99.9, suffix: "%", label: "Client Satisfaction" },
  { value: 500, suffix: "+", label: "Happy Couples" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const isFloat = !Number.isInteger(value);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        const currentValue = value * eased;

        setDisplayValue(
          isFloat
            ? Number(currentValue.toFixed(1)) // 👈 keep 1 decimal
            : Math.floor(currentValue),
        );

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value, isFloat]);

  return (
    <span
      ref={ref}
      className="font-heading text-4xl sm:text-5xl md:text-6xl text-primary"
    >
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: isFloat ? 1 : 0,
        maximumFractionDigits: isFloat ? 1 : 0,
      })}
      {suffix}
    </span>
  );
}

export default function StatsCounter() {
  return (
    <section className="relative py-16 md:py-10 overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-full bg-center bg-fixed"
        style={{
          backgroundImage: "url(/images/journey.jpeg)",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/65" />

      {/* Content */}
      <div className="container-custom relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-background mb-4">
            Our Journey in Numbers
          </h2>
          <p className="text-background/70 max-w-2xl mx-auto text-sm md:text-base">
            Celebrating milestones of creativity, trust, and unforgettable
            celebrations.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-4 md:p-6 font-extrabold"
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="text-background/80 mt-2 text-sm md:text-base font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
