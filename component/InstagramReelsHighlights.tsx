"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { AuroraBackground } from "./ui/aurora-background";

/* =========================================================
   ✅ ADD YOUR INSTAGRAM URLS HERE
========================================================= */
const INSTAGRAM_REELS = [
  {
    url: "https://www.instagram.com/reel/DSZ3zbWD8JD/?igsh=Y2hrbGwwOXB0ZmY4",
    label: "Behind the Scenes",
  },
  {
    url: "https://www.instagram.com/reel/DSR_bwIk2_c/?igsh=bGN4emF0anFnM2xv",
    label: "Design Process",
  },
  {
    url: "https://www.instagram.com/reel/DQ9YeGqgFdC/?igsh=MW40d3Fibml3amx0Yw==",
    label: "New Collection",
  },
  {
    url: "https://www.instagram.com/reel/DN521i6Ezpm/?igsh=MTIxa2U0bjF6Y3lhYQ==",
    label: "Behind the Scenes",
  },
  {
    url: "https://www.instagram.com/reel/DNsD93VXunp/?igsh=Mm00eTlvanFveTNl",
    label: "Design Process",
  },
  {
    url: "https://www.instagram.com/reel/DNQnGpHTL7p/?igsh=azE5d3JmYWhrMXNv",
    label: "New Collection",
  },
  {
    url: "https://www.instagram.com/reel/DM8GNw9zGcP/?igsh=MWgzZzFybWRkanBwYw==",
    label: "Behind the Scenes",
  },
  {
    url: "https://www.instagram.com/reel/DMvCRY-vXk3/?igsh=aDVpZnhpMHdnY3Fy",
    label: "Design Process",
  },
  {
    url: "https://www.instagram.com/reel/DMspfizTXHE/?igsh=MW1jNHlrZzM1dW5qbA==",
    label: "New Collection",
  },
  {
    url: "https://www.instagram.com/reel/DMdH_3DTLmh/?igsh=MWlucXg1ajI0OXFhaA==",
    label: "Behind the Scenes",
  },
  {
    url: "https://www.instagram.com/reel/DMQRnWnTnbM/?igsh=ejRsNmMwMTBodjZq",
    label: "Behind the Scenes",
  },
];

/* ========================================================= */

function extractEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => ["reel", "p", "tv"].includes(p));
    if (idx === -1 || !parts[idx + 1]) return null;
    return `https://www.instagram.com/${parts[idx]}/${parts[idx + 1]}/embed/`;
  } catch {
    return null;
  }
}

export default function InstagramReelsHighlights() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll control
  const autoTimerRef = useRef<number | null>(null);
  const autoPausedUntilRef = useRef<number>(0);

  const reels = useMemo(
    () =>
      INSTAGRAM_REELS.map((r) => ({
        ...r,
        embed: extractEmbedUrl(r.url),
      })).filter((r) => r.embed),
    [],
  );

  const stopAuto = () => {
    if (autoTimerRef.current) {
      window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  const startAuto = () => {
    const el = scrollerRef.current;
    if (!el) return;
    if (autoTimerRef.current) return;

    let dir = 1;
    const speed = 0.5;

    autoTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      if (now < autoPausedUntilRef.current) return;

      el.scrollLeft += dir * speed;

      // bounce at edges
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) dir = -1;
      if (el.scrollLeft <= 2) dir = 1;
    }, 16);
  };

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;

    autoPausedUntilRef.current = Date.now() + 3000;

    // Scroll amount logic
    const isMobile = window.innerWidth < 768;
    const step = isMobile ? 280 : 324; // card width + gap

    el.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <AuroraBackground
      className="h-auto min-h-0 w-full items-stretch justify-start py-0"
      showRadialGradient
    >
      <section className="relative w-full py-10 md:py-14">
        <div className="mx-auto max-w-[1400px] px-4">
          {/* Heading */}
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight md:mb-10 md:text-5xl">
            Watch Highlights
          </h2>

          {/* ================= SLIDER WRAPPER ================= */}
          <div className="relative group">
            {/* ⬅️ LEFT ARROW (Hidden on mobile) */}
            <button
              onClick={() => scroll("left")}
              className="hidden md:block absolute left-[-24px] top-1/2 z-20 -translate-y-1/2 rounded-full border border-neutral-300 bg-white/90 p-3 shadow-md backdrop-blur transition hover:bg-white active:scale-95"
              aria-label="Scroll left"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* ➡️ RIGHT ARROW (Hidden on mobile) */}
            <button
              onClick={() => scroll("right")}
              className="hidden md:block absolute right-[-24px] top-1/2 z-20 -translate-y-1/2 rounded-full border border-neutral-300 bg-white/90 p-3 shadow-md backdrop-blur transition hover:bg-white active:scale-95"
              aria-label="Scroll right"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            {/* ================= SLIDER ================= */}
            <div
              ref={scrollerRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onMouseEnter={() => {
                autoPausedUntilRef.current = Date.now() + 9999999;
              }}
              onMouseLeave={() => {
                autoPausedUntilRef.current = Date.now() + 0;
              }}
              onTouchStart={() => {
                autoPausedUntilRef.current = Date.now() + 9999999;
              }}
            >
              {reels.map((item, i) => (
                <div
  key={i}
  className="
    relative
    shrink-0
    overflow-hidden
    rounded-2xl
    bg-neutral-100
    border border-black/5
    shadow-sm
    w-[260px]
    aspect-[9/16]
    md:w-[300px]
  "
>
                  <div className="absolute inset-0 w-full h-full">
    <iframe
      src={item.embed}
      className="absolute top-0 left-0 w-full h-[120%]"
      loading="lazy"
      scrolling="no"
      allow="encrypted-media; fullscreen"
      style={{ border: 0 }}
      title={`Instagram Reel ${i}`}
    />
  </div>
  <div className="absolute bottom-0 left-0 right-0 h-16 bg-white pointer-events-none" />
  {/* <style jsx>{`
    iframe {
      & ~ div[style*="position: absolute; bottom: 0"] 
        display: none !important;
      }
    }
  `}</style> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AuroraBackground>
  );
}
