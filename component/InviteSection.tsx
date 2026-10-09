import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EnvelopeSVG from "./EnvelopeSVG";
import InviteCard from "./InviteCard";
import { useIsMobile } from "./useIsMobile";

gsap.registerPlugin(ScrollTrigger);

// --- FLAP GEOMETRY ---
const FLAP_CLOSED = "30,100 480,380 930,100";
const FLAP_OPEN_OVERSHOOT = "30,100 480,-220 930,100";
const FLAP_OPEN_SETTLE = "30,100 480,-180 930,100";

const SEAM_CLOSED = FLAP_CLOSED;
const SEAM_OPEN_OVERSHOOT = FLAP_OPEN_OVERSHOOT;
const SEAM_OPEN_SETTLE = FLAP_OPEN_SETTLE;

const InviteSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // SVG Refs
  const flapRef = useRef<SVGPolygonElement>(null);
  const seamRef = useRef<SVGPolylineElement>(null);
  const flapShadowRef = useRef<SVGPathElement>(null);

  // Layer Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const flapContainerRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);

  const isMobile = useIsMobile();

  const handleSealClick = () => {
    timelineRef.current?.play();
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const flap = flapRef.current;
    const seam = seamRef.current;
    const shadow = flapShadowRef.current;
    const card = cardRef.current;
    const flapContainer = flapContainerRef.current;
    const seal = sealRef.current;

    if (
      !section ||
      !wrap ||
      !flap ||
      !seam ||
      !shadow ||
      !card ||
      !flapContainer ||
      !seal
    )
      return;

    // --- INITIAL STATE ---
    gsap.set(flap, { attr: { points: FLAP_CLOSED } });
    gsap.set(seam, { attr: { points: SEAM_CLOSED } });
    gsap.set(flapContainer, { zIndex: 30 });
    gsap.set(shadow, { opacity: 0 });
    gsap.set(wrap, {
      clearProps: "transformPerspective, rotateX, transformStyle",
    });

    gsap.set(seal, {
      scale: isMobile ? 0.8 : 1,
      opacity: 1,
      rotate: 0,
    });

    gsap.set(card, {
      y: 100,
      scale: isMobile ? 0.9 : 0.95,
      zIndex: 10,
      autoAlpha: isMobile ? 0 : 1,
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: section,
          start: "top 65%", // 🔥 when section enters viewport
          end: "+=60",
          pin: true,
          once: true,
          onEnter: () => {
            tl.play(); // 🔥 auto open
          },
        },
      });

      timelineRef.current = tl;

      // 1. Open Flap
      tl.to(
        flap,
        {
          attr: { points: FLAP_OPEN_OVERSHOOT },
          duration: 0.3,
          ease: "power2.inOut",
        },
        0,
      )
        .to(
          seam,
          {
            attr: { points: SEAM_OPEN_OVERSHOOT },
            duration: 0.3,
            ease: "power2.inOut",
          },
          0,
        )
        .to(seal, { scale: 1.2, opacity: 0, duration: 0.3 }, 0)
        .to(shadow, { opacity: 0.14, duration: 0.5 }, 0.2);

      // 2. Settle Flap
      tl.to(
        flap,
        {
          attr: { points: FLAP_OPEN_SETTLE },
          duration: 0.3,
          ease: "power2.out",
        },
        0.2,
      ).to(
        seam,
        {
          attr: { points: SEAM_OPEN_SETTLE },
          duration: 0.3,
          ease: "power2.out",
        },
        0.2,
      );

      // 3. Send Flap to Back
      tl.set(flapContainer, { zIndex: 0 }, 0.2);

      // 4. Extract Card UP
      const wrapH = wrap.getBoundingClientRect().height;
      // Adjusted mobile extraction to ensure it doesn't fly too high and cut off
      const extractionY = isMobile ? -(wrapH * 0.85) : -380;

      tl.to(card, { y: extractionY, duration: 0.2, ease: "power3.inOut" }, 1.3);

      if (isMobile) {
        tl.to(card, { autoAlpha: 1, duration: 0.6, ease: "power2.in" }, 1.4);
      }

      // 5. Swap Z-Index
      tl.set(card, { zIndex: 40 }, 1.5);

      // 6. Present Card DOWN & Full Scale
      tl.to(
        card,
        {
          y: 0,
          scale: 1, // Ensures full size at the end
          duration: 0.8,
          ease: "back.out(0.8)",
        },
        1.7,
      );
    }, sectionRef);

    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="
    relative
    w-full
    overflow-hidden
    h-screen
    bg-cover
    bg-center
    bg-no-repeat
    flex
    items-center
    justify-center
  "
      style={{
        backgroundImage: "url('/images/bg3.png')"
        ,
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* WRAPPER */}
        <div
          ref={wrapRef}
          className="relative w-full max-w-5xl mx-auto aspect-[960/650]"
        >
          {/* BACK LAYER */}
          <div className="absolute inset-0 z-0">
            <EnvelopeSVG
              part="back"
              flapShadowRef={flapShadowRef}
              className="w-full h-full"
            />
          </div>

          {/* CARD LAYER */}
          <div
            ref={cardRef}
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ willChange: "transform, opacity" }}
          >
            {/* UPDATED CARD CONTAINER SIZING:
               - Mobile: w-[95%] for max width, h-[80dvh] for safe height
               - Desktop: Fixed px sizes
            */}
            <div
              className="
                w-[95%] 
                md:w-[820px]

                h-[80dvh] 
                md:h-[520px]
                
                max-h-[85dvh] 
                md:max-h-[520px]

                bg-white 
                shadow-lg 
                rounded-lg 
                overflow-hidden 
                flex
              "
            >
              <InviteCard />
            </div>
          </div>

          {/* POCKET LAYER */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <EnvelopeSVG part="pocket" className="w-full h-full" />
          </div>

          {/* SEAL BUTTON */}
          <div className="absolute z-[35] left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 select-none">
            <button
              ref={sealRef}
              type="button"
              onClick={handleSealClick}
              aria-label="Open invitation"
              className="
                relative 
                w-[90px] h-[90px] 
                md:w-[110px] md:h-[110px] 
                rounded-full 
                transition-transform 
                active:scale-[0.96] 
                hover:scale-[1.04] 
                cursor-pointer
              "
            >
              <img
                src="/assets/stamp.png"
                alt="Seal Logo"
                draggable={false}
                className="w-full h-full object-contain"
              />
            </button>

            <span className="text-[11px] md:text-sm tracking-wide text-[#9b6bd3] font-medium opacity-90 animate-fadeInUp">
              Click to open
            </span>
          </div>

          {/* FLAP LAYER */}
          <div
            ref={flapContainerRef}
            className="absolute inset-0 z-30 pointer-events-none"
          >
            <EnvelopeSVG
              part="flap"
              flapRef={flapRef}
              seamRef={seamRef}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InviteSection;
