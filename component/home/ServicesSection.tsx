// component\home\ServicesSection.tsx
"use client";

import React, { memo } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";

/* ───────────────── Flipping Card ───────────────── */
interface FlippingCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

const FlippingCard = memo(function FlippingCard({
  frontContent,
  backContent,
  className,
}: FlippingCardProps) {
  return (
    <div className="relative w-[300px] sm:w-[320px] lg:w-[340px] perspective-[1200px] group">
      <div
        className={cn(
          "relative h-[360px] sm:h-[380px] lg:h-[400px] w-full rounded-2xl",
          "border border-border/40 bg-gradient-to-b from-white/5 to-white/2",
          "shadow-xl transition-transform duration-700",
          "[transform-style:preserve-3d]",
          // ✅ hover ONLY on desktop
          "md:group-hover:[transform:rotateY(180deg)]",
          className,
        )}
      >
        {/* FRONT */}
        <div
          className="
            absolute inset-0 rounded-2xl overflow-hidden
            [backface-visibility:hidden]
            [transform:rotateY(0deg)]
            [transform-style:preserve-3d]
            will-change-transform
          "
        >
          {frontContent}
        </div>

        {/* BACK */}
        <div
          className="
            absolute inset-0 rounded-2xl
            bg-gradient-to-br from-[#A86DCD]/10 to-[#A86DCD]/5
            [backface-visibility:hidden]
            [transform:rotateY(180deg)]
            [transform-style:preserve-3d]
            will-change-transform
          "
        >
          <div className="flex h-full w-full flex-col items-center justify-center p-6 sm:p-7 text-center">
            {backContent}
          </div>
        </div>
      </div>
    </div>
  );
});

const services = [
  {
    id: "ai-video",
    title: "AI Video Invitations",
    shortDesc: "Cinematic AI-powered love stories",
    fullDesc:
      "Bring your love story to life with cinematic AI-powered videos featuring 3D animations, emotional storytelling, and modern visual effects.",
    image: "/images/AI.jpeg",
    link: "/collections/3d-ai-video",
  },
  {
    id: "digital-invites",
    title: "Digital Invitations",
    shortDesc: "Elegant, modern & eco-friendly invites",
    fullDesc:
      "Beautifully crafted digital invitations ranging from traditional Indian designs to sleek modern styles.",
    image: "/images/Wedding invites.jpeg",
    link: "/collections/wedding-invites",
  },
  {
    id: "custom-logo",
    title: "Custom Logo Design",
    shortDesc: "Personalized monograms & wedding logos",
    fullDesc:
      "Unique couple monograms and signature wedding logos that become the visual identity of your celebration.",
    image: "/images/logos.jpeg",
    link: "/collections/logo",
  },
  {
    id: "caricature",
    title: "Caricature Art",
    shortDesc: "Fun & personalized couple portraits",
    fullDesc:
      "Playful hand-drawn caricatures filled with charm, emotions, and personal details.",
    image: "/images/Caricature.jpeg",
    link: "/collections/caricature",
  },
  {
    id: "stationery",
    title: "Complete Wedding Stationery",
    shortDesc: "A perfectly matched stationery suite",
    fullDesc:
      "Save-the-dates, invitations, menus, place cards, and thank-you notes — all beautifully coordinated.",
    image: "/images/stationary.jpeg",
    link: "/collections/stationery",
  },
  {
    id: "magnets",
    title: "Customized Magnets & Badges",
    shortDesc: "Memorable wedding keepsakes",
    fullDesc:
      "Thoughtfully designed custom magnets and badges as wedding favours and lasting souvenirs.",
    image: "/images/magnets and badges.jpeg",
    link: "/contact",
  },
  {
    id: "wedding-calendar",
    title: "Wedding Calendars",
    shortDesc: "Your memories, beautifully dated",
    fullDesc:
      "Personalized wedding calendars featuring your most cherished moments.",
    image: "/images/calender.jpeg",
    link: "/contact",
  },
  {
    id: "pdf-invitations",
    title: "PDF Invitations",
    shortDesc: "Classic invites in digital format",
    fullDesc:
      "High-quality PDF invitations designed for easy sharing and printing.",
    image: "/images/pdf invition.jpeg",
    link: "/collections/pdf-invites",
  },
  {
    id: "festival-greetings",
    title: "Festival Greetings",
    shortDesc: "Personalized greetings for every festival",
    fullDesc:
      "Custom-designed festival greeting cards perfect for personal and professional wishes.",
    image: "/images/festival greeting.jpeg",
    link: "/contact",
  },
];

/* ───────────────── Page ───────────────── */
export default function ServicesPage() {
  const butterflyControls = useAnimationControls();

  const fireButterfly = async () => {
    await butterflyControls.start({
      opacity: 1,
      scale: 1.08,
      transition: { duration: 0.3, ease: "easeOut" },
    });

    butterflyControls.start({
      opacity: 0.9,
      scale: 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    });
  };

  return (
    <main className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden py-10 bg-gradient-to-b from-background to-muted/30">
        {/* LEFT BUTTERFLY */}
        <motion.img
          src="/assets/Butterflies-GIF-left.gif"
          alt="butterfly"
          animate={butterflyControls}
          initial={{ opacity: 0.9 }}
          className="pointer-events-none absolute left-[6%] sm:left-[10%] lg:left-[14%] top-[42%] -translate-y-1/2 w-32 sm:w-40 lg:w-72"
        />

        {/* RIGHT BUTTERFLY */}
        <motion.img
          src="/assets/Butterflies-GIF-Right.gif"
          alt="butterfly"
          animate={butterflyControls}
          initial={{ opacity: 0.9 }}
          className="pointer-events-none absolute right-[6%] sm:right-[10%] lg:right-[14%] top-[42%] -translate-y-1/2 w-32 sm:w-40 lg:w-72"
        />

        {/* HERO CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto text-center px-4"
        >
          <h1 className="text-4xl sm:text-6xl font-bold">
            What We <span className="text-[#A86DCD]">Offer</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground">
            Invitations, stationery, and keepsakes — crafted with love and
            precision.
          </p>
        </motion.div>
      </section>

      {/* SERVICES GRID */}
      <section>
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 justify-items-center">
            {services.map((service) => (
              <div
                key={service.id}
                onMouseEnter={fireButterfly}
                className="group"
              >
                <Link href={service.link}>
                  <FlippingCard
                    frontContent={
                      <div className="relative h-full">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="relative z-10 h-full flex flex-col justify-end p-6">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                            {service.title}
                          </h3>
                          <p className="text-sm text-white/90">
                            {service.shortDesc}
                          </p>
                        </div>
                      </div>
                    }
                    backContent={
                      <>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#A86DCD] mb-3">
                          {service.title}
                        </h3>
                        <p className="text-sm sm:text-base text-foreground/90">
                          {service.fullDesc}
                        </p>
                        <Button className="mt-5 bg-[#A86DCD] hover:bg-[#A86DCD]/90">
                          Explore →
                        </Button>
                      </>
                    }
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-muted/30 text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Let’s create something unforgettable
        </h2>
        <Link href="/contact">
          <Button
            size="lg"
            className="px-10 text-lg bg-[#A86DCD] hover:bg-[#A86DCD]/90 shadow-xl"
          >
            Contact Us
          </Button>
        </Link>
      </section>
    </main>
  );
}
