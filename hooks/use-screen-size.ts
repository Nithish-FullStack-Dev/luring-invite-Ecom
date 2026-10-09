import { useEffect, useState } from "react"

const SCREEN_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const
export type ScreenSize = (typeof SCREEN_SIZES)[number]

const sizeOrder: Record<ScreenSize, number> = {
  xs: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  "2xl": 5,
}

class ComparableScreenSize {
  constructor(private value: ScreenSize) {}

  lessThan(other: ScreenSize) {
    return sizeOrder[this.value] < sizeOrder[other]
  }
}

export const useScreenSize = (): ComparableScreenSize => {
  const [size, setSize] = useState<ScreenSize>("xs")

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 1536) setSize("2xl")
      else if (w >= 1280) setSize("xl")
      else if (w >= 1024) setSize("lg")
      else if (w >= 768) setSize("md")
      else if (w >= 640) setSize("sm")
      else setSize("xs")
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return new ComparableScreenSize(size)
}
