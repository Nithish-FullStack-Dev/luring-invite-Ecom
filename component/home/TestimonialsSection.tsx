"use client";
import { motion } from "framer-motion";
import { testimonials } from "@/data/products";
import CircularTestimonials, { Testimonial } from "../ui/circular-testimonials";

export default function TestimonialsSection() {
  // Map your existing data into the component’s required shape
  const circularData: Testimonial[] = testimonials.map((t) => ({
    quote: t.text,
    name: t.name,
    // designation: `${t.location} • ${t.occasion}`,
    src: t.image,
  }));

  return (
    <section className="section-padding bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 font-bold">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from couples who made their celebrations unforgettable
            with our invitations.
          </p>
        </motion.div>

        <div className="flex justify-center">
          <div className="w-full max-w-6xl rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-4 md:p-8">
            <CircularTestimonials
              testimonials={circularData}
              autoplay={true}
              colors={{
                name: "hsl(var(--foreground))",
                // designation: "hsl(var(--muted-foreground))",
                testimony: "hsl(var(--foreground))",
                arrowBackground: "hsl(var(--primary))",
                arrowForeground: "hsl(var(--primary-foreground))",
                arrowHoverBackground: "hsl(var(--foreground))",
              }}
              fontSizes={{
                name: "28px",
                // designation: "18px",
                quote: "18px",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
