// src/components/home/ProcessScrollSection.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "../ui/button";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button"; // ✅ FIXED IMPORT

const THEME = "#a86dcd";

export default function ProcessScrollSection() {
  return (
    <section
      className="relative min-h-screen py-20 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 w-full px-4 flex flex-col items-center">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Our{" "}
            <span className="italic" style={{ color: THEME }}>
              Process
            </span>
          </h2>

          <p className="mt-2 text-muted-foreground text-sm md:text-base">
            Crafting your story, one layer at a time
          </p>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full flex items-center justify-center"
        >
          {/* Desktop image */}
          <img
            src="/assets/caterpillar.png"
            alt="Process Desktop"
            className="hidden md:block w-full max-w-7xl h-auto"
            loading="lazy"
            draggable={false}
          />

          {/* Mobile image */}
          <img
            src="/assets/ourprocess-mobile.png"
            alt="Process Mobile"
            className="block md:hidden w-full max-w-md h-auto"
            loading="lazy"
            draggable={false}
          />
        </motion.div>

        {/* BUTTON BELOW IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Link href="/about">
            <Button className="px-10 py-6 text-lg bg-[#A86DCD] hover:bg-[#A86DCD]/90 shadow-xl">
              Know More About Us
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}