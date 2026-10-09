"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "framer-motion";
import useMeasure from "react-use-measure";

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const size = direction === "horizontal" ? width : height;
    if (!size) return;

    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const controls = isTransitioning
      ? animate(translation, to, {
          duration:
            currentDuration * Math.abs((translation.get() - to) / contentSize),
          ease: "linear",
          onComplete: () => {
            setIsTransitioning(false);
            setKey((k) => k + 1);
          },
        })
      : animate(translation, [from, to], {
          duration: currentDuration,
          ease: "linear",
          repeat: Infinity,
        });

    return () => controls.stop();
  }, [
    key,
    width,
    height,
    gap,
    reverse,
    direction,
    translation,
    currentDuration,
    isTransitioning,
  ]);

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
