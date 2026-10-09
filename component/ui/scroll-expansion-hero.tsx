'use client';

import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

/**
 * NOTE:
 * This component intentionally intercepts wheel/touch to create a "scroll to expand" effect.
 * It should be used at/near the TOP of a page route (hero section).
 */
const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend = false,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Refs to avoid re-binding listeners on every state change
  const scrollProgressRef = useRef(0);
  const mediaFullyExpandedRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    mediaFullyExpandedRef.current = mediaFullyExpanded;
  }, [mediaFullyExpanded]);

  // Reset when media type/src changes (and when demo dispatches event)
  const reset = () => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
    scrollProgressRef.current = 0;
    mediaFullyExpandedRef.current = false;
    touchStartYRef.current = null;
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType, mediaSrc]);

  useEffect(() => {
    const onReset = () => reset();
    window.addEventListener('resetSection', onReset);
    return () => window.removeEventListener('resetSection', onReset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  const commitProgress = (next: number) => {
    const p = clamp01(next);
    setScrollProgress(p);

    if (p >= 1) {
      setMediaFullyExpanded(true);
      setShowContent(true);
    } else {
      setMediaFullyExpanded(false);
      if (p < 0.75) setShowContent(false);
    }
  };

  // Attach listeners once
  useEffect(() => {
    const handleWheel = (e: globalThis.WheelEvent) => {
      // If fully expanded, allow normal scrolling DOWN.
      // Collapse only when user scrolls UP at very top.
      if (mediaFullyExpandedRef.current) {
        if (e.deltaY < 0 && window.scrollY <= 5) {
          e.preventDefault();
          // collapse back to near-expanded so user can "scroll back" smoothly
          commitProgress(0.9);
          return;
        }
        return; // allow normal scrolling
      }

      // Not expanded: intercept scrolling to drive expansion
      e.preventDefault();
      const scrollDelta = e.deltaY * 0.0009;
      commitProgress(scrollProgressRef.current + scrollDelta);
    };

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      touchStartYRef.current = e.touches?.[0]?.clientY ?? null;
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      const startY = touchStartYRef.current;
      if (startY == null) return;

      const touchY = e.touches?.[0]?.clientY ?? startY;
      const deltaY = startY - touchY;

      // If fully expanded, collapse only when pulling DOWN at top
      if (mediaFullyExpandedRef.current) {
        if (deltaY < -20 && window.scrollY <= 5) {
          e.preventDefault();
          commitProgress(0.9);
        }
        touchStartYRef.current = touchY;
        return;
      }

      // Not expanded: intercept and drive progress
      e.preventDefault();
      const scrollFactor = deltaY < 0 ? 0.008 : 0.005; // higher sensitivity when scrolling back
      const scrollDelta = deltaY * scrollFactor;
      commitProgress(scrollProgressRef.current + scrollDelta);

      touchStartYRef.current = touchY;
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };

    // Keep page at top until expanded (prevents normal scroll)
    const handleScroll = () => {
      if (!mediaFullyExpandedRef.current && window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel as any);
      window.removeEventListener('scroll', handleScroll as any);
      window.removeEventListener('touchstart', handleTouchStart as any);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleTouchEnd as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sizing based on progress
  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);

  const firstWord = useMemo(() => (title ? title.split(' ')[0] : ''), [title]);
  const restOfTitle = useMemo(
    () => (title ? title.split(' ').slice(1).join(' ') : ''),
    [title]
  );

  const isYouTube = mediaType === 'video' && /youtube\.com|youtu\.be/i.test(mediaSrc);

  const youtubeEmbed = useMemo(() => {
    if (!isYouTube) return null;

    try {
      // Supports: youtu.be/<id> or youtube.com/watch?v=<id> or embed/<id>
      const u = new URL(mediaSrc, window.location.origin);

      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.split('/').filter(Boolean)[0];
        if (!id) return null;
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playsinline=1&playlist=${id}`;
      }

      const v = u.searchParams.get('v');
      if (v) {
        return `https://www.youtube.com/embed/${v}?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playsinline=1&playlist=${v}`;
      }

      const parts = u.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        const id = parts[embedIndex + 1];
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playsinline=1&playlist=${id}`;
      }

      return null;
    } catch {
      return null;
    }
  }, [isYouTube, mediaSrc]);

  return (
    <div className="transition-colors duration-700 ease-in-out overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* Background image fades out as we expand */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <img
              src={bgImageSrc}
              alt="Background"
              className="w-screen h-screen object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              {/* Expanding media container */}
              <div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.3)',
                }}
              >
                {mediaType === 'video' ? (
                  youtubeEmbed ? (
                    <div className="relative w-full h-full pointer-events-none">
                      <iframe
                        width="100%"
                        height="100%"
                        src={youtubeEmbed}
                        className="w-full h-full rounded-xl"
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video"
                      />
                      <div className="absolute inset-0 z-10 pointer-events-none" />

                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full pointer-events-none">
                      <video
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover rounded-xl"
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <div className="absolute inset-0 z-10 pointer-events-none" />

                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />

                    <motion.div
                      className="absolute inset-0 bg-black/50 rounded-xl"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {/* Small floating text inside media */}
                <div className="flex flex-col items-center text-center relative z-10 mt-4 transition-none">
                  {date && (
                    <p
                      className="text-base md:text-xl text-white/90 drop-shadow"
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p
                      className="text-white/80 font-medium text-center drop-shadow"
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
                    >
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              {/* Title text */}
              <div
                className={`flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${
                  textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
                }`}
              >
                <motion.h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow transition-none"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white drop-shadow transition-none"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>

            {/* Content reveals after expand */}
            <motion.section
              className="flex flex-col w-full px-6 py-10 md:px-12 lg:px-16 lg:py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
