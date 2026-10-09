import React, { useCallback, useMemo, useRef } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { v4 as uuidv4 } from "uuid"
import { createLucideIcon } from "lucide-react"
import { butterfly } from "@lucide/lab"

import { cn } from "@/lib/utils"
import { useDimensions } from "@/hooks/use-debounced-dimensions"

/* ---------------------------------------------
   Create Lucide Butterfly React Component
---------------------------------------------- */
const ButterflyIcon = createLucideIcon("Butterfly", butterfly)

/* ---------------------------------------------
   Types
---------------------------------------------- */
interface PixelTrailProps {
  pixelSize: number
  fadeDuration?: number
  delay?: number
  className?: string
}

interface PixelDotProps {
  id: string
  size: number
  fadeDuration: number
  delay: number
}

/* ---------------------------------------------
   PixelTrail Component
---------------------------------------------- */
const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize,
  fadeDuration = 500,
  delay = 0,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(containerRef)
  const trailId = useRef(uuidv4())

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / pixelSize)
      const y = Math.floor((e.clientY - rect.top) / pixelSize)

      const pixel = document.getElementById(
        `${trailId.current}-pixel-${x}-${y}`
      ) as any

      pixel?.__animatePixel?.()
    },
    [pixelSize]
  )

  const columns = useMemo(
    () => Math.ceil(dimensions.width / pixelSize),
    [dimensions.width, pixelSize]
  )

  const rows = useMemo(
    () => Math.ceil(dimensions.height / pixelSize),
    [dimensions.height, pixelSize]
  )

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("absolute inset-0 w-full h-full", className)}
    >
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex">
          {Array.from({ length: columns }).map((_, col) => (
            <PixelDot
              key={`${col}-${row}`}
              id={`${trailId.current}-pixel-${col}-${row}`}
              size={pixelSize}
              fadeDuration={fadeDuration}
              delay={delay}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------
   PixelDot Component
---------------------------------------------- */
const PixelDot: React.FC<PixelDotProps> = React.memo(
  ({ id, size, fadeDuration, delay }) => {
    const controls = useAnimationControls()

    const animatePixel = useCallback(() => {
      controls.start({
        opacity: [1, 0],
        scale: [0.6, 1, 0.9],
        rotate: [0, 15, -10, 0],
        transition: {
          duration: fadeDuration / 1000,
          delay: delay / 1000,
          ease: "easeOut",
        },
      })
    }, [controls, fadeDuration, delay])

    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          ;(node as any).__animatePixel = animatePixel
        }
      },
      [animatePixel]
    )

    return (
      <motion.div
        id={id}
        ref={ref}
        className="flex items-center justify-center pointer-events-none"
        style={{ width: size, height: size }}
        initial={{ opacity: 0 }}
        animate={controls}
      >
        <ButterflyIcon
          className="w-full h-full drop-shadow-[0_0_6px_#A86DCD]"
          color="#A86DCD"
          strokeWidth={1.5}
        />
      </motion.div>
    )
  }
)

PixelDot.displayName = "PixelDot"

export { PixelTrail }
