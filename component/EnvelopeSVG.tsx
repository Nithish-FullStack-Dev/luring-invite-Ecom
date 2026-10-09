// src\components\EnvelopeSVG.tsx
import React from "react";

// --- FLAP GEOMETRY ---
const FLAP_CLOSED = "30,100 480,380 930,100";

interface Props {
  flapRef?: React.RefObject<SVGPolygonElement>;
  seamRef?: React.RefObject<SVGPolylineElement>;
  flapShadowRef?: React.RefObject<SVGPathElement>;
  className?: string;
  part: "back" | "pocket" | "flap";
}

const EnvelopeSVG: React.FC<Props> = ({
  flapRef,
  seamRef,
  flapShadowRef,
  className,
  part,
}) => {
  return (
    <svg
      className={`${className ?? ""} block`}
      viewBox="0 -100 960 700"
      preserveAspectRatio="xMidYMax meet"
      // ✅ Critical: prevent SVG from contributing to page overflow
      style={{ overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf6ee" />
          <stop offset="100%" stopColor="#FEFCEF" />
        </linearGradient>

        <linearGradient id="goldFoil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b88a1b" />
          <stop offset="50%" stopColor="#ffe9a6" />
          <stop offset="100%" stopColor="#b67f1e" />
        </linearGradient>

        <filter id="softShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>

        <filter id="flapBlur">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {part === "back" && (
        <>
          <rect
            x="30"
            y="100"
            width="900"
            height="500"
            rx="12"
            fill="url(#paperGrad)"
            filter="url(#softShadow)"
          />
          <rect
            x="30"
            y="100"
            width="900"
            height="500"
            rx="12"
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="3"
          />
          <path
            ref={flapShadowRef}
            d="M40 120 L480 390 L920 120 Z"
            fill="#000"
            opacity="0"
            filter="url(#flapBlur)"
          />
        </>
      )}

      {part === "pocket" && (
        <>
          <polygon points="30,600 480,380 930,600" fill="#FEFCEF" />
          <polygon points="30,100 480,380 30,600" fill="#FEFCEF" />
          <polygon points="930,100 480,380 930,600" fill="#FEFCEF" />
        </>
      )}

      {part === "flap" && (
        <>
          <polygon ref={flapRef} points={FLAP_CLOSED} fill="#fffaf2" stroke="none" />
          <polyline
            ref={seamRef}
            points={FLAP_CLOSED}
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="3"
          />
        </>
      )}
    </svg>
  );
};

export default EnvelopeSVG;
