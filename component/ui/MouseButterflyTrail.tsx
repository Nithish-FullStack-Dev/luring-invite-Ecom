"use client";

import { useEffect, useRef } from "react";

interface MouseButterflyTrailProps {
  size?: number;
  gifSrc?: string;
  className?: string;
}

export default function MouseButterflyTrail({
  size = 300,
  gifSrc = "/images/Butterfly-2.gif",
  className = "",
}: MouseButterflyTrailProps) {
  const butterflyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = butterflyRef.current;
    if (!el) return;

    const move = (x: number, y: number) => {
      el.style.transform = `
        translate(${x}px, ${y}px)
        translate(-50%, -50%)
      `;
    };

    const onMouseMove = (e: MouseEvent) => {
      move(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        move(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // Center on load (instant)
    move(window.innerWidth / 2, window.innerHeight / 2);

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      ref={butterflyRef}
      className={`fixed top-0 left-0 z-[9999] pointer-events-none transition-transform duration-100 ease-out ${className}`}
    >
      <img src={gifSrc} width={size} height={size} draggable={false} alt="" />
    </div>
  );
}
