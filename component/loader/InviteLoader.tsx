// src/components/loader/InviteLoader.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLoader } from "@/lib/loader-context";

const LEFT_FLAP_IMAGE = "/assets/LEFT.png";
const RIGHT_FLAP_IMAGE = "/assets/RIGHT.png";

const LOGO_URL =
  "https://res.cloudinary.com/drdotym31/image/upload/v1750078130/main-logo-1-1024x795_lfasd5.webp";

const THEMES = {
  wedding: { bg: "from-[#f7f1fb] to-[#fff]", accent: "#a86dcd" },
};

export default function InviteLoader() {
  const { done, finish } = useLoader();
  const theme = useMemo(() => THEMES.wedding, []);

  const [doorsOpen, setDoorsOpen] = useState(false);
  const [showCenter, setShowCenter] = useState(false);
  const [phase, setPhase] = useState<"playing" | "fadeout">("playing");
  const [mounted, setMounted] = useState(true);

  // track BOTH doors completion (prevents jump)
  const leftDone = useRef(false);
  const rightDone = useRef(false);

  // lock scroll while loader is visible
  useEffect(() => {
    if (!mounted || done) {
      document.body.style.overflow = "";
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted, done]);

  // start door animation immediately
  useEffect(() => {
    if (done) return;
    requestAnimationFrame(() => setDoorsOpen(true));
  }, [done]);

  // small preload so logo never flashes/missing
  useEffect(() => {
    try {
      const img = new Image();
      img.src = LOGO_URL;
    } catch {}
  }, []);

  if (!mounted || done) return null;

  const handleDoorDone = () => {
    // show center only after BOTH doors finished
    if (leftDone.current && rightDone.current) {
      setShowCenter(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* FADEOUT LAYER (smooth ending) */}
        <motion.div
          className="absolute inset-0"
          animate={phase === "fadeout" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (phase !== "fadeout") return;

            // mark done AFTER fade (no jump)
            finish();

            // keep mounted a tiny bit so fade completes everywhere
            window.setTimeout(() => setMounted(false), 80);
          }}
        >
          {/* BACKGROUND */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`} />

          {/* LEFT DOOR */}
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-full z-20"
            initial={{ x: 0 }}
            animate={doorsOpen ? { x: "-100%" } : { x: 0 }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => {
              leftDone.current = true;
              handleDoorDone();
            }}
          >
            <img
              src={LEFT_FLAP_IMAGE}
              className="w-full h-full object-cover object-right"
              alt=""
              draggable={false}
            />
          </motion.div>

          {/* RIGHT DOOR */}
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full z-20"
            initial={{ x: 0 }}
            animate={doorsOpen ? { x: "100%" } : { x: 0 }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => {
              rightDone.current = true;
              handleDoorDone();
            }}
          >
            <img
              src={RIGHT_FLAP_IMAGE}
              className="w-full h-full object-cover object-left"
              alt=""
              draggable={false}
            />
          </motion.div>

          {/* CENTER CONTENT */}
          <AnimatePresence>
            {showCenter && (
              <motion.div
                className="absolute inset-0 z-40 flex items-center justify-center"
                initial={{
                  opacity: 0,
                  scale: 0.985,
                  y: 8,
                  filter: "blur(6px)",
                }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.985, y: -6, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-col items-center">
                  {/* LOGO */}
                  <motion.img
                    src={LOGO_URL}
                    className="h-28 sm:h-36 w-auto drop-shadow-2xl select-none"
                    alt="Luring Invite"
                    draggable={false}
                    loading="eager"
                    decoding="async"
                    // @ts-ignore
                    fetchpriority="high"
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* PROGRESS BAR */}
                  <div className="mt-8 w-56 sm:w-72 h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{
                        backgroundColor: theme.accent,
                        transformOrigin: "left",
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.6, ease: "easeInOut" }}
                      onAnimationComplete={() => {
                        // trigger smooth fade out (instead of sudden unmount)
                        setPhase("fadeout");
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
