"use client";

import { usePublicContent } from "@/component/cms/PublicContentProvider";
import React from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoHeroSection() {
  const { hero } = usePublicContent();
  return (
    <section className="relative w-full h-[68vh]  overflow-hidden ">
      {/* Desktop video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover hidden md:block pointer-events-none "
        src="/assets/Webpage-Video.mp4"
      />

      {/* Mobile video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover md:hidden pointer-events-none"
        src="/assets/Webpage-Vertical-video.mp4"
      />

      {hero && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 px-6 text-center text-white"><h1 className="text-4xl md:text-6xl max-w-4xl">{hero.heading}</h1><p className="mt-5 text-lg md:text-xl max-w-2xl">{hero.description}</p></div>}
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
