"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoHeroSection() {
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
