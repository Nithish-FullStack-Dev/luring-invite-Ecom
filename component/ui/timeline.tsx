"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode; // ✅ allow custom icons
}

export function Timeline({
  data,
  heading = "Our Work Process",
  subheading = "A structured and collaborative approach from concept to delivery.",
}: {
  data: TimelineEntry[];
  heading?: string;
  subheading?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ Always calculate correct height (fix line mismatch)
  useEffect(() => {
    if (!listRef.current) return;

    const updateHeight = () => {
      if (!listRef.current) return;
      setHeight(listRef.current.getBoundingClientRect().height);
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(listRef.current);

    return () => ro.disconnect();
  }, []);

// ✅ Active step highlight while scrolling (reliable)
useEffect(() => {
  const getActive = () => {
    const focusY = window.innerHeight * 0.35; // focus line (35% from top)
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    itemsRef.current.forEach((node, i) => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const distance = Math.abs(rect.top - focusY);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    });

    setActiveIndex(bestIndex);
  };

  getActive();

  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(getActive);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    cancelAnimationFrame(raf);
  };
}, [data.length]);


  // ✅ Scroll progress line animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 70%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-background text-foreground"
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          {heading}
        </h2>
        <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
          {subheading}
        </p>
      </div>

     {/* Timeline */}
<div ref={listRef} className="relative max-w-6xl mx-auto pb-20">
  {/* ✅ Background Line (darker + primary color) */}
  <div
    className="absolute left-[44px] md:left-[64px] top-0 w-[3px] rounded-full bg-primary/30"
    style={{ height }}
  />

  {/* ✅ Progress Line */}
  <motion.div
    style={{ height: heightTransform, opacity: opacityTransform }}
    className="absolute left-[44px] md:left-[64px] top-0 w-[3px] rounded-full bg-primary shadow-[0_0_18px_rgba(0,0,0,0.15)]"
  />

  {/* ✅ Content wrapper with padding */}
  <div className="px-4 md:px-8 space-y-12 md:space-y-20">
    {data.map((item, index) => {
      const isActive = index === activeIndex;

      return (
        <div
          key={index}
          data-index={index}
          ref={(el) => {
            itemsRef.current[index] = el;
          }}
          className="grid grid-cols-[3.5rem_1fr] md:grid-cols-[4rem_1fr] gap-5 md:gap-10"
        >
          {/* Marker */}
          <div className="relative flex justify-center">
            <div
              className={[
                "z-20 h-11 w-11 rounded-full flex items-center justify-center",
                "border bg-background shadow-sm transition-all duration-300",
                isActive
                  ? "border-primary ring-4 ring-primary/20 scale-[1.05]"
                  : "border-border",
              ].join(" ")}
            >
              {item.icon ? (
                <div className={isActive ? "text-primary" : "text-muted-foreground"}>
                  {item.icon}
                </div>
              ) : (
                <span
                  className={[
                    "text-sm font-semibold",
                    isActive ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {index + 1}
                </span>
              )}
            </div>
          </div>

          {/* Content Card */}
          <div
            className={[
              "rounded-2xl border p-5 md:p-7 transition-all duration-300",
              "bg-card shadow-sm hover:shadow-md",
              isActive
                ? "border-primary/40 bg-primary/[0.06]"
                : "border-border",
            ].join(" ")}
          >
            <p
              className={[
                "text-xs font-medium tracking-wide",
                isActive ? "text-primary" : "text-muted-foreground",
              ].join(" ")}
            >
              Step {index + 1}
            </p>

            <h3
              className={[
                "mt-2 text-2xl md:text-3xl font-semibold leading-snug",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground/80",
              ].join(" ")}
            >
              <span
                className={
                  isActive
                    ? "bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                    : ""
                }
              >
                {item.title}
              </span>
            </h3>

            <div className="mt-4">{item.content}</div>
          </div>
        </div>
      );
    })}
  </div>
</div>

    </section>
  );
}
