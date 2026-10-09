"use client";

import { motion } from "framer-motion";
// import { Tilt } from "@/components/ui/tilt";
// import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import { Tilt } from "../ui/tilt";
import { Spotlight } from "../ui/spotlight";

type Feature = {
  icon: string; // ✅ image only
  title: string;
  description: string;
  color: string;
  bg: string;
};

const features: Feature[] = [
  {
    icon: "/assets/1.png",
    title: "Unparalleled Personalization",
    description:
      "Every invitation is uniquely yours — custom themes, colors, fonts, illustrations and heartfelt personal details.",
    color: "#A86DCD",
    bg: "bg-gradient-to-br from-purple-50 to-pink-50",
  },
  {
    icon: "/assets/2.png",
    title: "Exceptional Quality",
    description:
      "Premium materials and pixel-perfect craftsmanship — invitations that feel luxurious and last forever.",
    color: "#7C3AED",
    bg: "bg-gradient-to-br from-indigo-50 to-blue-50",
  },
  {
    icon: "/assets/4.png",
    title: "Timely Delivery",
    description:
      "We respect your timeline. Fast, reliable delivery so you and your guests can prepare without stress.",
    color: "#EC4899",
    bg: "bg-gradient-to-br from-pink-50 to-rose-50",
  },
  {
    icon: "/assets/3.png",
    title: "Always There For You",
    description:
      "Friendly, fast and dedicated support — we're here for every question and change you need.",
    color: "#10B981",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
  },
  {
    icon: "/assets/5.png",
    title: "Collaborative Design",
    description:
      "Your ideas + our creativity. We work together step-by-step until it's perfect for your vision.",
    color: "#F59E0B",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
  },
  {
    icon: "/assets/6.png",
    title: "Modern Technology",
    description:
      "Latest AI tools & innovative design techniques for fresh, contemporary and breathtaking results.",
    color: "#06B6D4",
    bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      className="relative py-10 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/1-4.webp')" }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-[#A86DCD]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 font-bold">
            Why Choose <span className="text-primary">Luring Invite?</span>
          </h2>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We go beyond invitations — we help you create memories your guests
            will talk about for years.
          </p>
        </motion.div>
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <Tilt
                rotationFactor={7}
                isRevese
                springOptions={{
                  stiffness: 160,
                  damping: 14,
                  mass: 0.35,
                }}
                className="group relative h-full perspective-[1100px]"
              >
                <div
                  className={cn(
                    "relative h-full rounded-3xl overflow-hidden border border-border/30",
                    "shadow-lg shadow-black/5 transition-all duration-500",
                    "group-hover:shadow-2xl group-hover:shadow-[#A86DCD]/15",
                    feature.bg,
                  )}
                >
                  <Spotlight
                    className="from-white/40 via-white/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    size={340}
                    springOptions={{
                      stiffness: 70,
                      damping: 18,
                    }}
                  />

                  <div className="relative z-10 p-8 flex flex-col h-full">
                    {/* Image Icon */}
                    <div className="mb-5 relative">
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-xl"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${feature.color}60, transparent 70%)`,
                        }}
                      />

                      <div
                        className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                        style={{
                          boxShadow: `0 8px 32px ${feature.color}40, inset 0 0 0 1px ${feature.color}30`,
                        }}
                      >
                        <img
                          src={feature.icon}
                          alt={feature.title}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-center mb-2 text-gray-600">
                      {feature.title}
                    </h3>

                    <p className="text-gray-700 text-base md:text-lg leading-relaxed text-center flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
