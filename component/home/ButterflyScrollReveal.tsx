import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  imageSrc: string;
  videoSrc: string;
  /** Scroll distance while the hero is pinned (default "+=120%") */
  pinEnd?: string;
  /** Debug markers */
  markers?: boolean;
  /** Optional: render your next sections right after the hero */
  children?: React.ReactNode;
};

export default function ButterflyScrollHero({
  imageSrc,
  videoSrc,
  pinEnd = "+=120%",
  markers = false,
  children,
}: Props) {
  const heroRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const img = imgRef.current;
    const video = videoRef.current;
    if (!hero || !img || !video) return;

    // Respect reduced motion: no pin / no animation
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const safePlay = () => {
      try {
        video.muted = true;
        video.playsInline = true;
        const p = video.play();
        if (p && typeof (p as Promise<void>).catch === "function") {
          (p as Promise<void>).catch(() => {});
        }
      } catch {}
    };

    const safePause = () => {
      try {
        video.pause();
      } catch {}
    };

    // If reduced motion, just keep image visible and stop here.
    if (reduceMotion) {
      img.style.opacity = "1";
      video.style.opacity = "0";
      return;
    }

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(img, { autoAlpha: 1 });
      gsap.set(video, { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: pinEnd,
          pin: true,
          scrub: true,
          markers,
          anticipatePin: 1,

          onEnter: () => safePlay(),
          onEnterBack: () => safePlay(),
          onLeave: () => safePause(),
          onLeaveBack: () => safePause(),

          // Helps mobile resize/orientation
          invalidateOnRefresh: true,
        },
      });

      // NO ZOOM: only crossfade image -> video
      tl.to(video, { autoAlpha: 1, duration: 0.25, ease: "none" }, 0.1)
        .to(img, { autoAlpha: 0, duration: 0.25, ease: "none" }, 0.1);
    }, hero);

    // Refresh after video metadata loads (fixes pin heights on some mobiles)
    const onLoadedMeta = () => ScrollTrigger.refresh();
    video.addEventListener("loadedmetadata", onLoadedMeta);

    // Mobile autoplay unlock (first interaction)
    const unlock = () => {
      safePlay();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      ctx.revert();
    };
  }, [pinEnd, markers]);

  return (
    <>
      <style>{styles}</style>

      {/* HERO (pinned) */}
      <section ref={heroRef} className="bsh-hero">
        <div className="bsh-media">
          {/* Image behind (shows first) */}
          <img ref={imgRef} className="bsh-img" src={imageSrc} alt="Hero" />

          {/* Video on top (fades in on scroll, full cover, loop) */}
          <video
            ref={videoRef}
            className="bsh-video"
            src={videoSrc}
            muted
            playsInline
            loop
            preload="auto"
          />
        </div>
      </section>

      {/* NEXT CONTENT (appears after pin ends) */}
      {/* <section className="bsh-next">
        {children ?? (
          <div className="bsh-next-inner">
            <h2>Next Section</h2>
            <p>
              Put your next page content here. This will show after the pinned
              hero finishes.
            </p>
          </div>
        )}
      </section> */}
    </>
  );
}

const styles = `
/* Reset-ish */
*{box-sizing:border-box}
html,body{margin:0;padding:0}
img,video{display:block}

/* HERO */
.bsh-hero{
  position:relative;
  width:100%;
  height:100vh;
  height:100svh;
  height:100dvh;
  overflow:hidden;
}

/* Fullscreen media wrapper */
.bsh-media{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  overflow:hidden;
}

/* Image always covers */
.bsh-img{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
  z-index:1;
}

/* Video covers, no zoom. Starts hidden via GSAP autoAlpha */
.bsh-video{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
  z-index:2;
  opacity:0; /* GSAP will animate */
  visibility:hidden; /* GSAP autoAlpha toggles this */
}

/* NEXT SECTION */
.bsh-next{
  min-height:100vh;
  padding: clamp(18px, 3vw, 48px);
  background: transparent; /* keep as you like */
}

.bsh-next-inner{
  max-width: 1100px;
  margin: 0 auto;
}

/* Mobile small screens: nothing special required, cover handles it */
@media (max-width: 480px){
  .bsh-next{padding: 18px}
}
`;
