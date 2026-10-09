"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

export const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
};

type ProgressiveBlurProps = {
  direction?: keyof typeof GRADIENT_ANGLES;
  blurLayers?: number;
  blurIntensity?: number;
  className?: string;
} & HTMLMotionProps<"div">;

export function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  blurIntensity = 0.25,
  className,
  ...props
}: ProgressiveBlurProps) {
  const layers = Math.max(blurLayers, 2);
  const segmentSize = 1 / (layers + 1);

  return (
    <div className={cn("relative", className)}>
      {Array.from({ length: layers }).map((_, i) => {
        const angle = GRADIENT_ANGLES[direction];
        const stops = [
          i * segmentSize,
          (i + 1) * segmentSize,
          (i + 2) * segmentSize,
          (i + 3) * segmentSize,
        ].map(
          (pos, idx) =>
            `rgba(255,255,255,${idx === 1 || idx === 2 ? 1 : 0}) ${pos * 100}%`,
        );

        const gradient = `linear-gradient(${angle}deg, ${stops.join(",")})`;

        return (
          <motion.div
            key={i}
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              maskImage: gradient,
              WebkitMaskImage: gradient,
              backdropFilter: `blur(${i * blurIntensity}px)`,
            }}
            {...props}
          />
        );
      })}
    </div>
  );
}
