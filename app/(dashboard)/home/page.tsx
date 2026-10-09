// app\(dashboard)\home\page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "../layout/header";
import VideoHeroSection from "@/component/VideoHero";
import InviteSection from "@/component/InviteSection";
import TrendingVideo from "@/component/home/TrendingVideo";
import WhyChooseUs from "@/component/home/WhyChooseUs";
import ProcessScrollSection from "@/component/home/ProcessScrollSection";
import InstagramReelsHighlights from "@/component/InstagramReelsHighlights";
import StatsCounter from "@/component/home/StatsCounter";
import TestimonialsSection from "@/component/home/TestimonialsSection";
import Footer from "../layout/Footer";
import FloatingWhatsApp from "../layout/FloatingWhatsApp";
// import ServicesSection from "@/components/home/ServicesSection";
import ServicesSection from "@/component/home/ServicesSection";
const Index = () => {
  // ✅ FIX: avoid window.open collision, define state
  const [aboutOpen, setAboutOpen] = useState(false);

  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  // ✅ FIX: remove “white space on revisit” caused by preserved scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
    setAboutOpen(false);
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      {/* <MouseButterflyTrail size={300} gifSrc="/images/Butterfly-2.gif" /> */}

      <Header />

      <main className="relative z-10">
        <VideoHeroSection />
        {/* <LuxuryCTASection />  */}
        {/* <ScrollExpandMedia
          mediaType="video"
          mediaSrc={
            isMobile
              ? "/assets/Webpage-Vertical-video.mp4"
              : "/assets/Webpage-Video.mp4"
          }
          posterSrc="/assets/video-poster.jpg"
          bgImageSrc="/images/bg.png"
          title="Outrights Luring Invite"
          date="2025"
          scrollToExpand="Scroll to expand"
        /> */}

        {/* Envelope scroll → modal */}
        <InviteSection />

        {/* <AboutModal
          open={aboutOpen}
          onClose={closeAbout}
          enableSound
          //soundSrc="/sounds/envelope-open.mp3"
        /> */}

        <TrendingVideo />
        <ServicesSection />
        <WhyChooseUs />
        {/* <CategoriesCarousel /> */}

        <ProcessScrollSection />
        <InstagramReelsHighlights />
        {/* <BestSellersCarousel /> */}
        <StatsCounter />
        <TestimonialsSection />
        {/* <CollectionCarousel /> */}

        {/* <ShowcaseParallax /> */}
        {/* <FAQPreview /> */}
        {/* <ContactFormSection /> */}
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
